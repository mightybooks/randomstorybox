'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const fullChoices = [
    "하마", "쇼핑몰", "손세정제", "가습기", "플랑크톤",
    "마이크", "무당", "무전기", "스파게티", "사다리",
    "경비행기", "드라이버", "모래", "우산", "식칼",
    "한약", "거북이", "수첩", "스탬플러", "비둘기",
    "바인더", "장마", "종이컵", "가위", "토끼",
    "책상", "버섯", "붓", "노트북", "칫솔",
    "샌들", "가방", "피망", "햄스터", "풍선",
    "침대", "휴지", "식기세척기", "물컵", "개구리",
    "버튼", "타이어휠", "요거트", "수갑", "개복치",
    "열쇠", "리모컨", "콘드로이친", "붕대", "무좀"
  ];

  const randomboxQuestions = [
    { q: "1. 당신은 바닷가에 도착했다. 가장 먼저 눈에 들어온 것은?" },
    { q: "2. 비 오는 날, 동료가 우산 대신 건넨 것은?" },
    { q: "3. 식당 테이블 위에 놓여있던 것은?" },
    { q: "4. 연극배우의 인생 배역은?" },
    { q: "5. 불이 났을 때 당신이 가장 먼저 챙긴 것은?" },
    { q: "6. 마우스가 고장난 날 밤, 당신이 본 영화의 장르는?", options: ["로맨스", "코믹", "액션", "스릴러", "공포"] },
    { q: "7. 사랑하는 이가 도시락을 줬습니다. 도시락을 본 당신의 마음속 풍경은?", options: ["수채화", "리얼한 사진", "일본 애니", "미쿡 카툰", "사이버펑크"] }
  ];

  const randomboxStatuses = [
    "기운을 긁어모으고 있습니다.",
    "다정함 1mg, 미소 0.5mg, 배려심 0.8mg, 사악함 1t..",
    "음, 펄펄 끓어오르기 시작했습니다.",
    "여기에 꼰대력과 거짓말로 간을 맞춥니다.",
    "제법 걸쭉하군요. 그럼, 붓을 적십니다.",
    "아.. 키보드에 적신다는 걸 붓에 적셨네? 다시.. 키보드를 적십니다.",
    "어? 뭐야? 키보드가 안되나??",
    "마우스로 일단 출력물을 보내드리겠습니다 ㅡㅡ;;",
    "에이, 좀, 모른 척 좀 해주세요.. 지금 몹시 부끄러우니까..",
    "그렇다고 그냥 가시란 말은 아니고요..",
    "그러지 말고 이리로 좀 와봐요, 네, 좀 가까이..",
    "오란다고 진짜 왔어요? 아, 부담되네.. 아니, 잠깐만요!",
    "아, 드디어 됐습니다! 됐어요, 됐어!",
    "제대로 삽됐습니다!!"
  ];

  const [randomboxCurrent, setCurrent] = useState(-1);
  const [randomboxAnswers, setAnswers] = useState<string[]>([]);
  const [warningVisible, setWarningVisible] = useState(false);
  const [storyFetched, setStoryFetched] = useState(false);
  const [randomboxStoryText, setRandomboxStoryText] = useState('');
  const [imageFetched, setImageFetched] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [questionOptions, setQuestionOptions] = useState<string[][]>([]);

  useEffect(() => {
    const shuffle = [...fullChoices];
    for (let i = shuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
    }
    const sliced = Array.from({ length: 6 }, (_, i) => shuffle.slice(i * 4, (i + 1) * 4));
    setQuestionOptions(sliced);
  }, []);

  function wait(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  async function runTypingStatus() {
    for (let i = 0; i < randomboxStatuses.length; i++) {
      if (imageFetched) break;
      setStatusText(randomboxStatuses[i]);
      await wait(1200);
    }
  }

  async function nextQuestion() {
    if (randomboxCurrent >= 0 && randomboxCurrent <= 6) {
      const radios = document.querySelector(`input[name="q${randomboxCurrent}"]:checked`) as HTMLInputElement;
      if (!radios) {
        setWarningVisible(true);
        setTimeout(() => setWarningVisible(false), 2000);
        return;
      }
      setAnswers(prev => [...prev, radios.value]);
    }

    const next = randomboxCurrent + 1;
    setCurrent(next);

    if (randomboxCurrent === 6) {
      console.log("🔥 현재 randomboxCurrent 값:", randomboxCurrent);

      const keywords = [...randomboxAnswers, (document.querySelector(`input[name="q5"]:checked`) as HTMLInputElement)?.value].slice(0, 5);
      const genre = (document.querySelector(`input[name="q5"]:checked`) as HTMLInputElement)?.value;

      try {
        const res = await fetch("/api/generate-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywords, genre }),
        });
        const data = await res.json();

        console.log("📦 OpenAI 응답 전체:", data);

        setRandomboxStoryText(data.story || "이야기 생성 실패");
        setStoryFetched(true);

        // ✅ 자동으로 7단계 진입
        setCurrent(7);
      } catch (err) {
        console.error("스토리 생성 실패:", err);
        setRandomboxStoryText("이야기 생성 실패");
        setStoryFetched(true);
      }
    }

    if (randomboxCurrent === 7) {
      const style = (document.querySelector(`input[name="q6"]:checked`) as HTMLInputElement)?.value;
      setStatusText("🖌 창작에 혼을 태우고 있어요...");

      await runTypingStatus();

      const waitUntilStory = () =>
        new Promise<void>(resolve => {
          const check = () => {
            if (storyFetched) resolve();
            else setTimeout(check, 300);
          };
          check();
        });

      await waitUntilStory();

      const fullPrompt = `${randomboxStoryText} (${style} 스타일)`;

      try {
        const imgRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: fullPrompt }),
        });
        const imgData = await imgRes.json();
        if (imgData.imageUrl) {
          setImageUrl(imgData.imageUrl);
        }
        setImageFetched(true);
      } catch (err) {
        console.error("이미지 생성 실패:", err);
        setImageFetched(true);
      }
    }
  }

  const q = randomboxQuestions[randomboxCurrent];
  const options = q?.options || questionOptions[randomboxCurrent] || [];

  return (
    <div className="randombox-container">
      {randomboxCurrent < 0 && (
        <div className="randombox-question" style={{ textAlign: "center" }}>
          <p>내면을 비추는 단어들이<br /><strong>당신만의 이야기가 된다면?</strong></p>
          <p>무의식을 들추는 신묘한 이야기</p>
          <p>즉흥적인 영감으로<br />즉석에서 바로 만들어 드립니다.</p>
        </div>
      )}

      {randomboxCurrent >= 0 && randomboxCurrent <= 6 && (
        <>
          <div className="randombox-question">{q.q}</div>
          {options.map((opt, idx) => (
            <label key={idx} className="randombox-option">
              <input type="radio" name={`q${randomboxCurrent}`} value={opt} /> {opt}
            </label>
          ))}
        </>
      )}

      {randomboxCurrent === 7 && (
        <>
          <h2>🌀 당신만의 기묘한 이야기</h2>
          <p>{randomboxStoryText}</p>
          {imageUrl && <img src={imageUrl} style={{ maxWidth: "100%", borderRadius: "12px", marginTop: "1rem" }} />}
        </>
      )}

      {warningVisible && <div id="randombox-warning">선택지를 고르세요!</div>}

      <button id="randombox-nextBtn" onClick={nextQuestion}>
        {randomboxCurrent < 0 ? "시작하기" : randomboxCurrent === 6 ? "마지막 질문" : randomboxCurrent === 7 ? "완료" : "다음"}
      </button>

      <div id="randombox-summary">
        {randomboxCurrent >= 6 && (
          <>
            <strong>🧩 선택한 단어:</strong> {randomboxAnswers.slice(0, 5).join(", ")}<br />
            <strong>🎬 장르:</strong> {randomboxAnswers[5]}
          </>
        )}
      </div>

      <div id="randombox-status-line">{statusText}</div>
    </div>
  );
}
