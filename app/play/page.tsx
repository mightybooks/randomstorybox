"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buildPrompt } from "../../lib/prompts"; // 기존 파일 유지 사용
import "./play.css";

import { useGeneration } from "../../hooks/useGeneration";
import { useLoadingLines } from "../../hooks/useLoadingLines";
import { QuestionGroup, QItem } from "../../components/QuestionGroup";
import { ResultView } from "../../components/ResultView";
import { ActionsBar } from "../../components/ActionsBar";
import { copyFallback, shareResult, decodeStoryBase64 } from "../../lib/share";
import { useReducedMotion } from "@/hooks/useReducedMotion"; // [A11Y]

// (추가) 토스트 훅/컴포넌트
import { useToast } from "@/hooks/useToast";
import { ToastRegion } from "@/components/ui/Toast";

// 타입
export type Phase = "idle" | "asking" | "writing" | "done";
export type QOption = { label: string; value: string };

// 로딩 멘트(순환)
const LOADING_LINES = [
  "연관성 없어 보이는 단어를 연결한 글쓰기는",
  "실제 문수림 작가의 실전 작법 중 하나입니다",
  "저서 <장르불문 관통하는 글쓰기>에 연습법을 소개하고 있습니다",
];

// 풀
const POOLS = {
  q1: ["고양이","바람","돌멩이","지하철 안내방송","비둘기","변기","군화","낙엽","미나리","신호등","우산","맘모스","분리수거 라벨","골목 자판기","텀블러","귤껍질"],
  q2: ["웨이팅","소음","반말","더운 날씨","냉난방 온도차","자잘한 진동","끈적한 바닥","사이버렉카","보이스피싱","비좁은 좌석","미세먼지","낯선 향수 냄새","직장 상사","엄마","모기","와이파이"],
  q3: ["편의점 진열대 사이","지하 주차장","옥상 모서리","세탁소 스팀 옆","도서관 구석","매표소 대기열","버스 맨 뒷좌석","수거함 옆","엘리베이터 앞","지하 통로 끝","자판기 앞","공원 벤치 아래 그림자","등산로","둘레길","침대 밑","베란다 가운데"],
  q4: ["냉장고","야식","다이어트","채식","과일","배구","축구","당구","농구","극장","OTT","숏츠","광고","손가락","북극","허리"],
  q5: ["약속 파기","무단횡단","쓰레기 불법투척","환승연애","줄 새치기","욕설","흡연 구역 외 흡연","무단 촬영","말 돌리기","카트 방치","자리 킵","음식 남기기","초면에 반말","잠수이별","가래침","지각"],
};

// Q7: 스타일 라벨/값
const POOL_Q7: QOption[] = [
  { label: "무라카미 소라치의 진혼", value: "byungmat" },
  { label: "문수림의 20에서 30까지", value: "msr" },
  { label: "스티븐 킹의 미스트", value: "king" },
  { label: "노라 에프런의 유브 갓 메일", value: "ephron" },
];

function sampleN<T>(arr: T[], n: number): T[] { if (arr.length <= n) return [...arr]; const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]];} return a.slice(0,n); }
function buildSessionQuestions(): QItem[] { return [
  { id:1, text:"당신은 무엇으로 환생하고 싶나요?", options: sampleN(POOLS.q1,4).map((l)=>({label:l,value:l})) },
  { id:2, text:"평소 무엇이 가장 불편한가요?", options: sampleN(POOLS.q2,4).map((l)=>({label:l,value:l})) },
  { id:3, text:"조금이라도 안정감을 느끼는 장소는?", options: sampleN(POOLS.q3,4).map((l)=>({label:l,value:l})) },
  { id:4, text:"다음 중 평화와 가장 관련이 깊다고 생각되는 것은?", options: sampleN(POOLS.q4,4).map((l)=>({label:l,value:l})) },
  { id:5, text:"당신이 정말 용납하기 힘든 것은?", options: sampleN(POOLS.q5,4).map((l)=>({label:l,value:l})) },
  { id:6, text:"다음 중 문수림 작가가 쓴 책이 아닌 것은?", options: ["괜찮아 아빠도 쉽진 않더라","20에서 30까지","장르불문 관통하는 글쓰기","아프니까 중년이다"].map((l)=>({label:l,value:l})) },
  { id:7, text:"당신이 휴가철에 읽고 싶은 작가의 책은?", options: POOL_Q7 },
];}

export default function PlayPage(){
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [sessionQs, setSessionQs] = useState<QItem[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [storyFromShare, setStoryFromShare] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [randomBanner, setRandomBanner] = useState("");

  const { phase: genPhase, text: genText, error: genError, isSubmitting, generate } = useGeneration();
  const loadingIdx = useLoadingLines(phase === "writing", LOADING_LINES.length, loadingInterval);

  // 모션 민감 사용자 대응: 로딩 문구 순환 속도 완화
  const reduceMotion = useReducedMotion();
  const loadingInterval = reduceMotion ? 3500 : 2000;
  
  // (추가) 토스트 훅
  const { toasts, addToast, removeToast } = useToast();
  const delayToastFiredRef = useRef(false);

  useEffect(()=>{ const banners = Array.from({length:12},(_,i)=>`/banners/adver${String(i+1).padStart(2,"0")}.webp`); const idx=Math.floor(Math.random()*banners.length); setRandomBanner(banners[idx]); },[]);

  // 공유 링크 (?s=...)
  useEffect(()=>{ if (typeof window === "undefined") return; const sp=new URLSearchParams(window.location.search); const s=sp.get("s"); if(!s) return; try{ const decoded = decodeStoryBase64(decodeURIComponent(s)); if(decoded){ setStoryFromShare(decoded); setPhase("done"); setNotice(""); }}catch{} },[]);

  const start = ()=>{ const newQs=buildSessionQuestions(); setSessionQs(newQs); setPhase("asking"); setStep(0); setAnswers(Array(newQs.length).fill("")); setStoryFromShare(""); setImageUrl(""); setNotice(""); delayToastFiredRef.current = false; if (typeof window!=="undefined") window.scrollTo({top:0,behavior:"smooth"}); };

  const currentQ = sessionQs[step];
  const onSelect = (value: string)=>{ const next=[...answers]; next[step]=value; setAnswers(next); setNotice(""); };

  const nextStep = async ()=>{
    if (!answers[step]){ setNotice("선택지를 골라주세요."); return; }
    if (step < sessionQs.length - 1){ setStep(step+1); return; }

    // 마지막 단계 → 생성 시작
    setPhase("writing");
    setNotice("이야기를 정리하는 중…");
    delayToastFiredRef.current = false; // 새 요청마다 초기화

    const words = answers.slice(0,5);
    const style = answers[6];
    const promptText = buildPrompt(style as "byungmat"|"msr"|"king"|"ephron", words);

    // 3.5초 지연시 단 한 번만 토스트
    const delayId = setTimeout(() => {
      if (!delayToastFiredRef.current) {
        addToast("처리가 지연되고 있습니다. 잠시만 기다려주세요.");
        delayToastFiredRef.current = true;
      }
    }, 3500);

    try {
      // API 요청 스키마(Zod)와 맞추기 위해 prompt는 보내지 않습니다.
      await generate({ prompt: promptText, style, words });
    } finally {
      clearTimeout(delayId);
      // 완료 전환은 응답이 도착했을 때로 지연 (아래 useEffect에서 처리)
      setNotice("");
    }
  };

  // useGeneration 훅에서 에러가 올라오면 한글 표준 메시지로 토스트
  useEffect(() => {
    if (!genError) return;
    addToast(mapKnownError(genError), "error");
  }, [genError, addToast]);

  const displayStory = storyFromShare || genText;

  // ✅ 생성이 끝났을 때 화면 상태를 done으로 전환
useEffect(() => {
  if (phase === "writing" && genPhase === "done" && !genError) {
    setPhase("done");
  }
}, [genPhase, genError, phase]);

  return (
    <main className="rsb-app" aria-busy={phase === "writing"}>
      <div className="rsb-card">
        <header className="rsb-header">
          <h1 className="rsb-title">문수림의 랜덤서사박스</h1>
          <p className="rsb-subtitle">진지한데 엉뚱한 단편 서사 생성기</p>
        </header>

        {phase === "idle" && (<div className="rsb-center"><button className="rsb-btn rsb-primary" onClick={start}>시작하기</button></div>)}

        {phase === "asking" && currentQ && (
          <section>
            <QuestionGroup q={currentQ} selected={answers[step]} onSelect={onSelect} disabled={isSubmitting} />
            {notice && (
  <p
    className="rsb-notice"
    role="alert"
    tabIndex={-1}
    ref={(el) => {
      if (el) el.focus(); // 오류/미선택 시 자동 포커스
    }}
    aria-live="polite"
  >
    {notice}
  </p>
)}

            <div className="rsb-actions">
              <button className="rsb-btn" onClick={()=>setStep(Math.max(0, step-1))} disabled={step===0 || isSubmitting} aria-disabled={step===0 || isSubmitting}>이전</button>
              <button className="rsb-btn rsb-primary" onClick={nextStep} disabled={isSubmitting} aria-disabled={isSubmitting}>{step===sessionQs.length-1 ? (isSubmitting?"생성 중…":"완료") : "다음"}</button>
            </div>
            <div className="rsb-progress"><div className="rsb-bar" style={{ width: `${sessionQs.length ? ((step + 1) / sessionQs.length) * 100 : 0}%` }} /></div>
          </section>
        )}

        {(phase === "writing" || phase === "done") && (
          <>
            <ResultView text={displayStory} isWriting={genPhase === "writing"} loadingLines={LOADING_LINES} loadingIdx={loadingIdx} error={genError} />

            {phase === "done" && !!imageUrl && (
              <div className="mb-6"><Image src={imageUrl} alt="이야기 이미지" width={512} height={512} onError={()=>setImageUrl("")} className="rounded-lg shadow-md mx-auto"/></div>
            )}

            {phase === "done" && !!randomBanner && (
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-500 mb-2">아래 배너는 자체 광고 배너입니다.</p>
                <Image src={randomBanner} alt="광고 배너" width={512} height={512} className="rounded-lg shadow-md mx-auto"/>
              </div>
            )}

            {phase === "done" && (
              <ActionsBar onHome={()=>router.push("/")} onRestart={start} onCopy={()=>copyFallback(displayStory)} onShare={()=>shareResult(displayStory)} />
            )}
          </>
        )}
      </div>

      {/* 토스트 렌더링 영역 */}
      <ToastRegion toasts={toasts} removeToast={removeToast} />
    </main>
  );
}

// 표준 에러 메시지 매핑 (TIMEOUT/422/429/500/502 등)
function mapKnownError(err: any) {
  // 우선순위: Abort/Timeout → 상태코드 → 기본값
  const name = err?.name || "";
  const status = err?.status || err?.code || 0;
  const msg = (typeof err?.message === "string" ? err.message : "").toLowerCase();

  if (name === "AbortError" || msg.includes("timeout") || status === 408) {
    return "응답이 지연됩니다. 잠시 후 다시 시도해주세요.";
  }
  if (status === 422 || msg.includes("422")) return "입력값을 다시 확인해주세요.";
  if (status === 429 || msg.includes("rate") || msg.includes("429")) return "요청이 많습니다. 잠시 후 시도해주세요.";
  if (status === 500 || status === 502 || msg.includes("500") || msg.includes("502")) return "서버 오류입니다. 잠시 후 재시도해주세요.";

  return "알 수 없는 오류가 발생했습니다.";
}
