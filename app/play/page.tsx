"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buildPrompt } from "../../lib/prompts";
import "./play.css";

type Phase = "idle" | "asking" | "writing" | "done";
type QOption = { label: string; value: string };
type QItem = { id: number; text: string; options: QOption[] };

const POOLS = {
  q1: ["고양이", "바람", "돌멩이", "지하철 안내방송", "비둘기", "변기", "군화", "낙엽", "미나리", "신호등", "우산", "맘모스", "분리수거 라벨", "골목 자판기", "텀블러", "귤껍질"],
  q2: ["웨이팅", "소음", "반말", "더운 날씨", "냉난방 온도차", "자잘한 진동", "끈적한 바닥", "사이버렉카", "보이스피싱", "비좁은 좌석", "미세먼지", "낯선 향수 냄새", "직장 상사", "엄마", "모기", "와이파이"],
  q3: ["편의점 진열대 사이", "지하 주차장", "옥상 모서리", "세탁소 스팀 옆", "도서관 구석", "매표소 대기열", "버스 맨 뒷좌석", "수거함 옆", "엘리베이터 앞", "지하 통로 끝", "자판기 앞", "공원 벤치 아래 그림자", "등산로", "둘레길", "침대 밑", "베란다 가운데"],
  q4: ["냉장고", "야식", "다이어트", "채식", "과일", "배구", "축구", "당구", "농구", "극장", "OTT", "숏츠", "광고", "손가락", "북극", "허리"],
  q5: ["약속 파기", "무단횡단", "쓰레기 불법투척", "환승연애", "줄 새치기", "욕설", "흡연 구역 외 흡연", "무단 촬영", "말 돌리기", "카트 방치", "자리 킵", "음식 남기기", "초면에 반말", "잠수이별", "가래침", "지각"],
};

const POOL_Q7: QOption[] = [
  { label: "무라카미 소라치의 진혼", value: "byungmat" },
  { label: "문수림의 20에서 30까지", value: "msr" },
  { label: "스티븐 킹의 미스트", value: "king" },
  { label: "노라 에프런의 유브 갓 메일", value: "ephron" },
];

function sampleN<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function buildSessionQuestions(): QItem[] {
  return [
    { id: 1, text: "당신은 무엇으로 환생하고 싶나요?", options: sampleN(POOLS.q1, 4).map((label) => ({ label, value: label })) },
    { id: 2, text: "평소 무엇이 가장 불편한가요?", options: sampleN(POOLS.q2, 4).map((label) => ({ label, value: label })) },
    { id: 3, text: "조금이라도 안정감을 느끼는 장소는?", options: sampleN(POOLS.q3, 4).map((label) => ({ label, value: label })) },
    { id: 4, text: "다음 중 평화와 가장 관련이 깊다고 생각되는 것은?", options: sampleN(POOLS.q4, 4).map((label) => ({ label, value: label })) },
    { id: 5, text: "당신이 정말 용납하기 힘든 것은?", options: sampleN(POOLS.q5, 4).map((label) => ({ label, value: label })) },
    { id: 6, text: "헤어진 연인에게 권하고 싶은 영화 장르는?", options: ["로맨틱 코미디", "스릴러", "호러", "반전 드라마"].map((label) => ({ label, value: label })) },
    { id: 7, text: "당신이 휴가철에 읽고 싶은 작가의 책은?", options: POOL_Q7 },
  ];
}

async function copyFallback(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

async function shareText(text: string) {
  const url = typeof window !== "undefined" ? window.location.href : undefined;
  try {
    await copyFallback(url ? `${text}\n${url}` : text);
  } catch {}
  if (navigator.share) {
    try {
      await navigator.share({
        title: "랜덤서사박스 결과",
        text: text.length > 400 ? text.slice(0, 400) + "…" : text,
        url,
      });
      return;
    } catch {}
  }
  alert("결과를 클립보드에 복사했습니다.");
}

async function shareApp(origin?: string) {
  const url = origin ? `${origin}/` : "/";
  try {
    if (navigator.share) {
      await navigator.share({ title: "랜덤서사박스", url });
    } else {
      await copyFallback(url);
      alert("앱 주소가 복사되었습니다.");
    }
  } catch {}
}

export default function PlayPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [sessionQs, setSessionQs] = useState<QItem[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [randomBanner, setRandomBanner] = useState("");

  useEffect(() => {
    const banners = Array.from({ length: 12 }, (_, i) => `/banners/adver${String(i + 1).padStart(2, "0")}.webp`);
    const idx = Math.floor(Math.random() * banners.length);
    setRandomBanner(banners[idx]);
  }, []);

  const start = () => {
    const newQs = buildSessionQuestions();
    setSessionQs(newQs);
    setPhase("asking");
    setStep(0);
    setAnswers(Array(newQs.length).fill(""));
    setStory("");
    setImageUrl("");
    setNotice("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentQ = sessionQs[step];

  const onSelect = (value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
    setNotice("");
  };

  const nextStep = () => {
    if (!answers[step]) {
      setNotice("선택지를 골라주세요.");
      return;
    }
    if (step < sessionQs.length - 1) {
      setStep(step + 1);
      return;
    }
    setPhase("writing");
    setNotice("이야기를 정리하는 중…");
    const words = answers.slice(0, 5);
    const style = answers[6];
    const promptText = buildPrompt(style as "byungmat" | "msr" | "king" | "ephron", words);
    fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText, style, words }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.result) {
          setStory(data.result);
          // 이미지 생성이 아직 없다면 빈값 유지 → 엑박 방지
          // setImageUrl(generatedImageUrl);
        } else {
          setStory("생성 실패… 다시 시도해 주세요.");
        }
        setPhase("done");
        setNotice("");
      })
      .catch(() => {
        setStory("API 호출 실패… 다시 시도해 주세요.");
        setPhase("done");
        setNotice("");
      });
  };

  return (
    <main className="rsb-app">
      <div className="rsb-card">
        <header className="rsb-header">
          <h1 className="rsb-title">문수림의 랜덤서사박스</h1>
          <p className="rsb-subtitle">진지한데 엉뚱한 단편 서사 생성기</p>
        </header>

        {phase === "idle" && (
          <div className="rsb-center">
            <button className="rsb-btn rsb-primary" onClick={start}>시작하기</button>
          </div>
        )}

        {phase === "asking" && currentQ && (
          <section>
            <div className="rsb-qhead">
              <span className="rsb-qno">Q{step + 1}</span>
              <span className="rsb-qtext">{currentQ.text}</span>
            </div>
            <div className="rsb-options">
              {currentQ.options.map((opt) => (
                <label key={opt.label} className={`rsb-option ${answers[step] === opt.value ? "active" : ""}`}>
                  <input type="radio" name={`q${currentQ.id}`} checked={answers[step] === opt.value} onChange={() => onSelect(opt.value)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {notice && <p className="rsb-notice">{notice}</p>}
            <div className="rsb-actions">
              <button className="rsb-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>이전</button>
              <button className="rsb-btn rsb-primary" onClick={nextStep}>{step === sessionQs.length - 1 ? "완료" : "다음"}</button>
            </div>
            <div className="rsb-progress">
              <div className="rsb-bar" style={{ width: `${sessionQs.length ? ((step + 1) / sessionQs.length) * 100 : 0}%` }} />
            </div>
          </section>
        )}

        {(phase === "writing" || phase === "done") && (
          <section className="rsb-result">
            {/* 1) 생성된 이야기 */}
            <article className="rsb-story">
              {story ? story.split("
").map((line, i) => <p key={i}>{line}</p>) : <p className="rsb-wip">이야기를 정리하는 중…</p>}
            </article>

            {/* 2) (옵션) 이야기 이미지 — 실제 URL 있을 때만, 완료 후에만 */}
            {phase === "done" && !!imageUrl && (
              <div className="mb-6">
                <Image
                  src={imageUrl}
                  alt="이야기 이미지"
                  width={512}
                  height={512}
                  onError={() => setImageUrl("")}
                  className="rounded-lg shadow-md mx-auto"
                />
              </div>
            )}

            {/* 3) 랜덤 배너 — 완료 후에만 표시 (생성보다 먼저 나오지 않도록) */}
            {phase === "done" && !!randomBanner && (
              <div className="mb-6">
                <Image
                  src={randomBanner}
                  alt="광고 배너"
                  width={512}
                  height={512}
                  className="rounded-lg shadow-md mx-auto"
                />
              </div>
            )}

            {/* 4) 액션 버튼들 */}
            {phase === "done" && (
              <div className="rsb-actions rsb-actions-grid">
                <button className="rsb-btn" onClick={() => router.push("/")}>홈으로</button>
                <button className="rsb-btn" onClick={start}>다시하기</button>
                {/* 전체 텍스트 복사 전용 (공유타겟이 URL만 받는 경우 대비) */}
                <button className="rsb-btn" onClick={() => copyFallback(story)}>결과 복사</button>
                {/* 브라우저/앱 공유 — 일부 대상은 URL만 처리할 수 있음 */}
                <button className="rsb-btn" onClick={() => shareText(story)}>결과 공유</button>
                <button className="rsb-btn" onClick={() => shareApp(typeof window !== "undefined" ? window.location.origin : undefined)}>앱 공유</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
