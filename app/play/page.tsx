"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { buildPrompt } from "../../lib/prompts";
import { useGeneration } from "../../hooks/useGeneration"; // ✅ 새로 추가
import "./play.css";

type Phase = "idle" | "asking" | "writing" | "done";
type QOption = { label: string; value: string };
type QItem = { id: number; text: string; options: QOption[] };

// 로딩 멘트(순환)
const LOADING_LINES = [
  "연관성 없어 보이는 단어를 연결한 글쓰기는",
  "실제 문수림 작가의 실전 작법 중 하나입니다",
  "저서 <장르불문 관통하는 글쓰기>에 연습법을 소개하고 있습니다",
];

const POOLS = {
  q1: [
    "고양이",
    "바람",
    "돌멩이",
    "지하철 안내방송",
    "비둘기",
    "변기",
    "군화",
    "낙엽",
    "미나리",
    "신호등",
    "우산",
    "맘모스",
    "분리수거 라벨",
    "골목 자판기",
    "텀블러",
    "귤껍질",
  ],
  q2: [
    "웨이팅",
    "소음",
    "반말",
    "더운 날씨",
    "냉난방 온도차",
    "자잘한 진동",
    "끈적한 바닥",
    "사이버렉카",
    "보이스피싱",
    "비좁은 좌석",
    "미세먼지",
    "낯선 향수 냄새",
    "직장 상사",
    "엄마",
    "모기",
    "와이파이",
  ],
  q3: [
    "편의점 진열대 사이",
    "지하 주차장",
    "옥상 모서리",
    "세탁소 스팀 옆",
    "도서관 구석",
    "매표소 대기열",
    "버스 맨 뒷좌석",
    "수거함 옆",
    "엘리베이터 앞",
    "지하 통로 끝",
    "자판기 앞",
    "공원 벤치 아래 그림자",
    "등산로",
    "둘레길",
    "침대 밑",
    "베란다 가운데",
  ],
  q4: [
    "냉장고",
    "야식",
    "다이어트",
    "채식",
    "과일",
    "배구",
    "축구",
    "당구",
    "농구",
    "극장",
    "OTT",
    "숏츠",
    "광고",
    "손가락",
    "북극",
    "허리",
  ],
  q5: [
    "약속 파기",
    "무단횡단",
    "쓰레기 불법투척",
    "환승연애",
    "줄 새치기",
    "욕설",
    "흡연 구역 외 흡연",
    "무단 촬영",
    "말 돌리기",
    "카트 방치",
    "자리 킵",
    "음식 남기기",
    "초면에 반말",
    "잠수이별",
    "가래침",
    "지각",
  ],
};

// Q7: 스타일 라벨/값 분리(값은 prompts 키와 일치)
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
    {
      id: 1,
      text: "당신은 무엇으로 환생하고 싶나요?",
      options: sampleN(POOLS.q1, 4).map((label) => ({ label, value: label })),
    },
    {
      id: 2,
      text: "평소 무엇이 가장 불편한가요?",
      options: sampleN(POOLS.q2, 4).map((label) => ({ label, value: label })),
    },
    {
      id: 3,
      text: "조금이라도 안정감을 느끼는 장소는?",
      options: sampleN(POOLS.q3, 4).map((label) => ({ label, value: label })),
    },
    {
      id: 4,
      text: "다음 중 평화와 가장 관련이 깊다고 생각되는 것은?",
      options: sampleN(POOLS.q4, 4).map((label) => ({ label, value: label })),
    },
    {
      id: 5,
      text: "당신이 정말 용납하기 힘든 것은?",
      options: sampleN(POOLS.q5, 4).map((label) => ({ label, value: label })),
    },
    {
      id: 6,
      text: "다음 중 문수림 작가가 쓴 책이 아닌 것은?",
      options: [
        "괜찮아 아빠도 쉽진 않더라",
        "20에서 30까지",
        "장르불문 관통하는 글쓰기",
        "아프니까 중년이다",
      ].map((label) => ({ label, value: label })),
    },
    {
      id: 7,
      text: "당신이 휴가철에 읽고 싶은 작가의 책은?",
      options: POOL_Q7,
    },
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

// --- 안전 인코딩/디코딩 ---
function encodeStoryBase64(text: string) {
  return typeof window === "undefined" ? "" : btoa(unescape(encodeURIComponent(text)));
}
function decodeStoryBase64(b64: string) {
  return typeof window === "undefined" ? "" : decodeURIComponent(escape(atob(b64)));
}

// --- 현재 스토리로 공유용 URL 만들기 (?s=...) ---
function buildShareUrlFromStory(story: string) {
  if (typeof window === "undefined" || !story) return "";
  const s = encodeURIComponent(encodeStoryBase64(story));
  return `${window.location.origin}/play?s=${s}`;
}

// --- 결과 공유(링크 중심) ---
async function shareResult(story: string) {
  const url = buildShareUrlFromStory(story);
  if (!url) return;
  try {
    await copyFallback(url);
  } catch {}
  if (navigator.share) {
    try {
      await navigator.share({ title: "랜덤서사박스 결과", url });
      return;
    } catch {}
  }
  alert("공유 링크를 클립보드에 복사했습니다. 원하는 앱에 붙여넣기 해주세요.");
}

export default function PlayPage() {
  const router = useRouter();

  // ✅ 생성 훅(네트워크/상태 외주)
  const { phase: genPhase, text: genText, error: genError, isSubmitting, generate } = useGeneration();

  // 페이지 자체 단계(질문 흐름 포함)
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [sessionQs, setSessionQs] = useState<QItem[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [story, setStory] = useState(""); // 공유 링크에서 넘어온 케이스 보관
  const [imageUrl, setImageUrl] = useState("");
  const [randomBanner, setRandomBanner] = useState("");
  const [loadingIdx, setLoadingIdx] = useState(0);

  // 로딩 멘트 회전: 글 생성 중일 때만
  useEffect(() => {
    if (phase !== "writing") return;
    setLoadingIdx(0);
    const id = setInterval(() => {
      setLoadingIdx((i) => (i + 1) % LOADING_LINES.length);
    }, 2000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const banners = Array.from({ length: 12 }, (_, i) => `/banners/adver${String(i + 1).padStart(2, "0")}.webp`);
    const idx = Math.floor(Math.random() * banners.length);
    setRandomBanner(banners[idx]);
  }, []);

  // 공유 링크로 들어온 경우 (?s=...) → 바로 결과 화면으로
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const sParam = sp.get("s");
    if (!sParam) return;
    try {
      const decoded = decodeStoryBase64(decodeURIComponent(sParam));
      if (decoded) {
        setStory(decoded); // 로컬 보관(훅 결과보다 우선 표시)
        setPhase("done");
        // writing 상태 아님: 로딩 멘트 타이머도 자동 정리됨
        setNotice("");
      }
    } catch {}
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

  const nextStep = async () => {
    if (!answers[step]) {
      setNotice("선택지를 골라주세요.");
      return;
    }
    if (step < sessionQs.length - 1) {
      setStep(step + 1);
      return;
    }

    // ✅ 마지막 문항 완료 → 글 생성 시작
    setPhase("writing");
    setNotice("이야기를 정리하는 중…");

    const words = answers.slice(0, 5); // Q1~Q5
    const style = answers[6]; // Q7
    const promptText = buildPrompt(style as "byungmat" | "msr" | "king" | "ephron", words);

    // 훅으로 네트워크 호출 위임(중복제출 자동 가드)
    await generate({ prompt: promptText, style, words });

    // 훅이 완료되어도 페이지 단계 전환은 여기서 제어
    setPhase("done");
    setNotice("");
  };

  // 표시할 스토리: 공유링크(story) 우선, 그 외엔 훅 결과(genText)
  const displayStory = story || genText;

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
                  <input
                    type="radio"
                    name={`q${currentQ.id}`}
                    checked={answers[step] === opt.value}
                    onChange={() => onSelect(opt.value)}
                    disabled={isSubmitting}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {notice && <p className="rsb-notice">{notice}</p>}
            <div className="rsb-actions">
              <button className="rsb-btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || isSubmitting}>이전</button>
              <button className="rsb-btn rsb-primary" onClick={nextStep} disabled={isSubmitting}>
                {step === sessionQs.length - 1 ? (isSubmitting ? "생성 중…" : "완료") : "다음"}
              </button>
            </div>
            <div className="rsb-progress">
              <div className="rsb-bar" style={{ width: `${sessionQs.length ? ((step + 1) / sessionQs.length) * 100 : 0}%` }} />
            </div>
          </section>
        )}

        {(phase === "writing" || phase === "done") && (
          <section className="rsb-result">
            {/* 1) 생성된 이야기 */}
            <article className="rsb-story whitespace-pre-line">
              {displayStory ? (
                displayStory.split("\n").map((raw, i) => {
                  const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw; // CRLF 대응
                  return line.trim() ? <p key={i}>{line}</p> : <br key={i} />;
                })
              ) : phase === "writing" ? (
                <p className="rsb-wip">{LOADING_LINES[loadingIdx]}</p>
              ) : (
                <p className="rsb-wip">이야기를 정리하는 중…</p>
              )}
            </article>

            {/* 에러 안내(훅에서 올라온 표면 메시지) */}
            {genError && (
              <p role="alert" className="rsb-notice" style={{ color: "crimson" }}>
                {genError}
              </p>
            )}

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
              <div className="mb-6 text-center">
                <p className="text-sm text-gray-500 mb-2">아래 배너는 자체 광고 배너입니다.</p>
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
                {/* 결과 전문만 복사 */}
                <button className="rsb-btn" onClick={() => copyFallback(displayStory)}>결과 복사</button>
                {/* 브라우저/앱 공유 — URL만 공유되는 환경 대비 */}
                <button className="rsb-btn" onClick={() => shareResult(displayStory)}>결과 공유</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
