"use client";

import { useState } from "react";

type Phase = "idle" | "asking" | "writing" | "done";

type QOption = { label: string; value: string };
type QItem = { id: number; text: string; options: QOption[] };

// ----------------------
// 1) 질문별 대규모 단어 풀 (원하는 만큼 늘려도 됨)
// ----------------------
const POOLS = {
  q1: ["고양이", "바람", "돌멩이", "지하철 안내방송", "비둘기", "변기", "군화", "낙엽", "미나리", "신호등", "우산", "맘모스", "분리수거 라벨", "골목 자판기", "텀블러", "귤껍질"],
  q2: ["웨이팅", "소음", "반말", "더운 날씨", "냉난방 온도차", "자잘한 진동", "끈적한 바닥", "사이버렉카", "보이스피싱", "비좁은 좌석", "미세먼지", "낯선 향수 냄새", "직장 상사", "엄마", "모기", "와이파이"],
  q3: ["편의점 진열대 사이", "지하 주차장", "옥상 모서리", "세탁소 스팀 옆", "도서관 구석", "매표소 대기열", "버스 맨 뒷좌석", "수거함 옆", "엘리베이터 앞", "지하 통로 끝", "자판기 앞", "공원 벤치 아래 그림자", "등산로", "둘레길", "침대 밑", "베란다 가운데"],
  q4: ["냉장고", "야식", "다이어트", "채식", "과일", "배구", "축구", "당구", "농구", "극장", "OTT", "숏츠", "광고", "손가락", "북극", "허리"],
  q5: ["약속 파기", "무단횡단", "쓰레기 불법투척", "환승연애", "줄 새치기", "욕설", "흡연 구역 외 흡연", "무단 촬영", "말 돌리기", "카트 방치", "자리 킵", "음식 남기기", "초면에 반말", "잠수이별", "가래침", "지각"],
};

// Q7은 스타일과 연결해야 하므로 라벨/값 분리(값은 고정 키)
const POOL_Q7: QOption[] = [
  { label: "무라카미 소라치의 진혼", value: "byungmat" },
  { label: "문수림의 20에서 30까지", value: "msr" },
  { label: "스티븐 킹의 미스트", value: "king" },
  { label: "노라 에프런의 유브 갓 메일", value: "ephron" },
];

// ----------------------
// 2) 유틸: 풀에서 N개 랜덤 샘플
// ----------------------
function sampleN<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

// ----------------------
// 3) 세션용 질문 생성 (매 세션 1회만 뽑아서 고정)
// ----------------------
function buildSessionQuestions(): QItem[] {
  return [
    { id: 1, text: "당신은 무엇으로 환생하고 싶나요?", options: sampleN(POOLS.q1, 4).map(label => ({ label, value: label })) },
    { id: 2, text: "평소 무엇이 가장 불편한가요?", options: sampleN(POOLS.q2, 4).map(label => ({ label, value: label })) },
    { id: 3, text: "조금이라도 안정감을 느끼는 장소는?", options: sampleN(POOLS.q3, 4).map(label => ({ label, value: label })) },
    { id: 4, text: "다음 중 평화와 가장 관련이 깊다고 생각되는 것은?", options: sampleN(POOLS.q4, 4).map(label => ({ label, value: label })) },
    { id: 5, text: "당신이 정말 용납하기 힘든 것은?", options: sampleN(POOLS.q5, 4).map(label => ({ label, value: label })) },
    { id: 6, text: "헤어진 연인에게 권하고 싶은 영화 장르는?", options: ["로맨틱 코미디", "스릴러", "호러", "반전 드라마"].map(label => ({ label, value: label })) },
    { id: 7, text: "당신이 휴가철에 읽고 싶은 작가의 책은?", options: POOL_Q7 }, // Q7은 그대로 4개
  ];
}

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);

  // 세션마다 고정되는 질문 세트
  const [sessionQs, setSessionQs] = useState<QItem[]>([]);
  const [answers, setAnswers] = useState<string[]>(Array(sessionQs.length).fill(""));
  const [notice, setNotice] = useState("");
  const [story, setStory] = useState("");

const start = () => {
  const newQs = buildSessionQuestions();
  setSessionQs(newQs);
  setPhase("asking");
  setStep(0);
  setAnswers(Array(newQs.length).fill(""));
  setStory("");
  setNotice("");
};
  
  const currentQ = sessionQs[step];

  const onSelect = (value: string) => {
    const next = [...answers];
    next[step] = value; // value 저장(라벨=값인 질문은 동일)
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

    // 완료 → 글 생성
    setPhase("writing");
    setNotice("이야기를 정리하는 중…");

    const words = answers.slice(0, 5); // Q1~Q5 선택값(=label=value)
    const style = answers[6]; // Q7은 이미 value가 'byungmat'|'msr'|'king'|'ephron'

    fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style, words }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.result) {
          setStory(data.result);
          setPhase("done");
          setNotice("");
        } else {
          setStory("생성 실패… 다시 시도해 주세요.");
          setPhase("done");
          setNotice("");
        }
      })
      .catch(() => {
        setStory("API 호출 실패… 다시 시도해 주세요.");
        setPhase("done");
        setNotice("");
      });
  };

  return (
    <main className="app rsb">
      <div className="card">
        <header className="header">
          <h1 className="title">문수림의 랜덤서사박스</h1>
          <p className="subtitle">진지한데 엉뚱한 단편 서사 생성기</p>
        </header>

        {phase === "idle" && (
          <div className="center">
            <button className="btn primary" onClick={start}>
              시작하기
            </button>
          </div>
        )}

        {phase === "asking" && (
          <section>
            <div className="qhead">
              <span className="qno">Q{step + 1}</span>
              <span className="qtext">{currentQ.text}</span>
            </div>

            <div className="options">
              {currentQ.options.map((opt) => (
                <label key={opt.label} className={`option ${answers[step] === opt.value ? "active" : ""}`}>
                  <input
                    type="radio"
                    name={`q${currentQ.id}`}
                    checked={answers[step] === opt.value}
                    onChange={() => onSelect(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {notice && <p className="notice">{notice}</p>}

            <div className="actions">
              <button className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                이전
              </button>
              <button className="btn primary" onClick={nextStep}>
                {step === sessionQs.length - 1 ? "완료" : "다음"}
              </button>
            </div>

            <div className="progress">
               <div 
                 className="bar"
                 style={{
                  width: `${sessionQs.length ? ((step + 1) / sessionQs.length) * 100 : 0}%`
                }}
              />
            </div>
          </section>
        )}

        {(phase === "writing" || phase === "done") && (
          <section className="result">
            <article className="story">
              {story ? story.split("\n").map((line, i) => <p key={i}>{line}</p>) : <p style={{ color: "#6d5c4c" }}>이야기를 정리하는 중…</p>}
            </article>

            {phase === "done" && (
              <div className="actions center">
                <button className="btn" onClick={start}>
                  다시 만들기
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
