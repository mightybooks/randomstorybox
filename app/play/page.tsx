"use client";

import { useMemo, useState, useEffect } from "react";

type Phase = "idle" | "asking" | "writing" | "drawing" | "done";

// ✅ 질문 (보기 텍스트와 styleMap 키가 정확히 일치해야 합니다)
const QUESTIONS = [
  { id: 1, text: "당신은 무엇으로 환생하고 싶나요?", options: ["고양이", "바람", "돌멩이", "지하철 안내방송"] },
  { id: 2, text: "평소 무엇이 가장 불편한가요?", options: ["웨이팅", "소음", "반말", "더운 날씨"] },
  { id: 3, text: "조금이라도 안정감을 느끼는 장소는?", options: ["편의점 진열대 사이", "지하 주차장", "옥상 모서리", "세탁소 스팀 옆"] },
  { id: 4, text: "법관이라면 어떤 주제의 법을 만들까요?", options: ["퇴근보장법", "소음 선제 차단법", "말 과장 금지법", "건조주의보 유급휴가법"] },
  { id: 5, text: "당신이 정말 용납하기 힘든 것은?", options: ["약속 파기", "무단횡단", "쓰레기불법투척", "환승연애"] },
  { id: 6, text: "당신이 평소 즐기는 영화 장르는?", options: ["로맨틱 코미디", "스릴러", "호러", "반전 드라"] },
  { id: 7, text: "당신이 휴가철에 읽고 싶은 작가의 책은?", options: ["무라카미 소라치의 진혼", "문수림의 20에서 30까지", "스티븐 킹의 미스트", "노라 에프런의 유브 갓 메일"] },
];

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(""));
  const [notice, setNotice] = useState("");
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const currentQ = useMemo(() => QUESTIONS[step], [step]);

  const start = () => {
    setPhase("asking");
    setStep(0);
    setAnswers(Array(QUESTIONS.length).fill(""));
    setStory("");
    setImageUrl("");
    setNotice("");
  };

  const onSelect = (choice: string) => {
    const next = [...answers];
    next[step] = choice;
    setAnswers(next);
    setNotice("");
  };

  // 7번 질문 → style 매핑 (보기 텍스트와 100% 동일해야 함)
  const styleMap: Record<string, string> = {
    "무라카미 소라치의 진혼": "byungmat",
    "문수림의 20에서 30까지": "msr",
    "스티븐 킹의 미스트": "king",
    "노라 에프런의 유브 갓 메일": "ephron",
  };

  const nextStep = () => {
    if (!answers[step]) {
      setNotice("선택지를 골라주세요.");
      return;
    }

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }

    // 마지막 질문 완료 → 글 생성
    setPhase("writing");
    setNotice("이야기를 정리하는 중… (writing)");

    const words = answers.slice(0, 5); // Q1~Q5
    const style = styleMap[answers[6]]; // Q7

    if (!style) {
      setStory("스타일 매핑에 실패했습니다. Q7 보기 텍스트를 확인해 주세요.");
      setPhase("done");
      setNotice("");
      return;
    }

    fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style, words }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.result) {
          setStory(data.result);
          setPhase("drawing");
          setNotice("그림을 그리고 있어요… (drawing)");

          // 데모용 이미지 (원하면 이미지 API로 교체)
          setTimeout(() => {
            const rnd = Math.floor(Math.random() * 10000);
            setImageUrl(`https://picsum.photos/seed/${rnd}/1200/720`);
          }, 900);
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

  // 이미지 로드 완료되면 done
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setPhase("done");
    img.onerror = () => setPhase("done");
  }, [imageUrl]);

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
                <label key={opt} className={`option ${answers[step] === opt ? "active" : ""}`}>
                  <input
                    type="radio"
                    name={`q${currentQ.id}`}
                    checked={answers[step] === opt}
                    onChange={() => onSelect(opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>

            {notice && <p className="notice">{notice}</p>}

            <div className="actions">
              <button className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                이전
              </button>
              <button className="btn primary" onClick={nextStep}>
                {step === QUESTIONS.length - 1 ? "완료" : "다음"}
              </button>
            </div>

            <div className="progress">
              <div className="bar" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
            </div>
          </section>
        )}

        {(phase === "writing" || phase === "drawing" || phase === "done") && (
          <section className="result">
            {/* 이미지 상단 */}
            <div className="imgbox">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="생성 이미지" />
              ) : (
                <div className="center" style={{ color: "#8a7d70" }}>
                  이미지 생성 중…
                </div>
              )}
            </div>

            {/* 글 하단 */}
            <article className="story">
              {story ? (
                story.split("\n").map((line, i) => <p key={i}>{line}</p>)
              ) : (
                <p style={{ color: "#6d5c4c" }}>이야기를 정리하는 중…</p>
              )}
            </article>

            {/* 상태 라벨 */}
            {phase !== "done" && <p className="status">{notice}</p>}

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
