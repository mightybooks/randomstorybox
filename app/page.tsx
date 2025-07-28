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

  const writingMessages = [
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

  const drawingMessages = [
    "붓을 꺼내 들었습니다...",
    "캔버스에 첫 획을 긋는 중...",
    "색을 고르고 있습니다...",
    "광원은 어디서 올까요...?",
    "디테일을 조금 더...",
    "살짝만 더 채색할게요...",
    "완성이 가까워졌습니다!",
    "마지막 터치...",
    "이제 진짜 거의 다 왔어요...!"
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
  const [stage, setStage] = useState<'writing' | 'drawing' | 'done'>('writing');

  useEffect(() => {
    const shuffle = [...fullChoices];
    for (let i = shuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
    }
    const sliced = Array.from({ length: 6 }, (_, i) => shuffle.slice(i * 4, (i + 1) * 4));
    setQuestionOptions(sliced);
  }, []);

  useEffect(() => {
    let active = true;
    let index = 0;
    const messages = stage === 'writing' ? writingMessages : drawingMessages;

    async function cycleMessages() {
      while (active && stage !== 'done') {
        setStatusText(messages[index % messages.length]);
        await new Promise(res => setTimeout(res, 1200));
        index++;
      }
    }

    cycleMessages();
    return () => { active = false; };
  }, [stage]);

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

    if (next === 7) {
      setCurrent(7);
      const keywords = randomboxAnswers.slice(0, 5);
      const genre = randomboxAnswers[5];

      fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, genre }),
      })
        .then(async (res) => {
          const data = await res.json();
          setRandomboxStoryText(data.story || "이야기 생성 실패");
          setStoryFetched(true);
          setStage('drawing');

          const style = randomboxAnswers[6];
          const prompt = `A surreal illustration of ${keywords.join(", ")}, in the style of ${style}`;

          fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          })
            .then(async (res) => {
              const imgData = await res.json();
              if (imgData.imageUrl) setImageUrl(imgData.imageUrl);
              setImageFetched(true);
              setStage('done');
              setCurrent(8);
            })
            .catch((err) => {
              console.error("🚨 이미지 요청 에러:", err);
              setImageFetched(true);
              setStatusText("🛑 이미지 생성에 실패했습니다.");
              setStage('done');
              setCurrent(8);
            });

          setTimeout(() => {
            if (!imageFetched) {
              setImageFetched(true);
              setStatusText("🕒 이미지 응답이 지연되고 있어요. 잠시 후 다시 확인해 주세요!");
              setStage('done');
              setCurrent(8);
            }
          }, 15000);
        })
        .catch((err) => {
          console.error("🔥 이야기 생성 실패:", err);
          setRandomboxStoryText("이야기 생성 실패");
          setStoryFetched(true);
          setStage('done');
          setCurrent(8);
        });
      return;
    }

    setCurrent(next);
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
          <button id="randombox-startBtn" onClick={() => setCurrent(0)}>시작하기</button>
        </div>
      )}

{randomboxCurrent >= 0 && randomboxCurrent <= 6 && (
  <div className="randombox-question-section">
    <div className="randombox-question">{q.q}</div>
    {options.map((opt, idx) => (
      <label key={idx} className="randombox-option">
        <input type="radio" name={`q${randomboxCurrent}`} value={opt} /> {opt}
      </label>
    ))}
    <button id="randombox-nextBtn" onClick={nextQuestion}>다음</button>
  </div>
)}

     {randomboxCurrent === 7 && (
  <div className="randombox-question">
    <h2 className="text-xl font-bold mb-2">🖌️ 그림 스타일 선택 완료!</h2>
    {stage === 'writing' && <><p>✍️ 지금 당신만의 이야기를 쓰는 중입니다...</p></>}
    {stage === 'drawing' && <><p>🖼️ 이야기가 완성되었습니다! 이제 그림을 그리는 중이에요...</p></>}
    {stage === 'done' && <><p>🎉 모든 생성이 완료되었습니다!</p><p>이제 이야기와 그림이 아래에 표시됩니다.</p></>}
    <p>{statusText}</p>
    <div id="randombox-summary">
      <strong>🧩 표출:</strong> {randomboxAnswers.slice(0, 5).join(", ")}<br />
      <strong>🎬 소망:</strong> {randomboxAnswers[5]}<br />
      <strong>🖼 심연:</strong> {randomboxAnswers[6]}
    </div>

    {/* ✅ 여기에 버튼 추가 */}
    {stage !== 'done' && (
      <button onClick={nextQuestion} className="randombox-nextBtn" style={{ marginTop: "1.5rem" }}>
        👉 다음
      </button>
    )}
  </div>
)}

{randomboxCurrent === 8 && (
  <div className="randombox-result">
    <h2>🌀 당신만의 기묘한 이야기</h2>
    
    {imageUrl ? (
      <img
        src={imageUrl}
        style={{ maxWidth: "100%", borderRadius: "12px", marginTop: "1rem" }}
        alt="AI 생성 이미지"
      />
    ) : (
      <p style={{ marginTop: "1rem" }}>🖼️ 이미지를 준비하고 있어요...</p>
    )}
    
    <p>{randomboxStoryText}</p>

    {/* 🔗 공유하기 섹션 */}
    <div className="randombox-share" style={{ marginTop: "2rem" }}>
      <h3 className="text-lg font-semibold">🔗 공유하기</h3>
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.origin);
            alert("✅ 링크가 복사되었습니다! 친구에게 보내보세요.");
          }}
        >
          🧪 랜덤서사박스 새로 해보기 링크 공유
        </button>

        <button
          onClick={() => {
            const shareText = `✨ 내가 만든 이야기:\n\n${randomboxStoryText}\n\n📷 그림: ${imageUrl}`;
            navigator.clipboard.writeText(shareText);
            alert("✅ 결과물이 복사되었습니다! SNS나 메신저에 붙여넣어보세요.");
          }}
        >
          🌈 내 이야기 결과물 공유
        </button>
       </div>

      <button
  onClick={() => {
    setCurrent(-1);
    setAnswers([]);
    setStoryFetched(false);
    setRandomboxStoryText('');
    setImageFetched(false);
    setImageUrl('');
    setStage('writing');
  }}
>
  🔄 다시 해보기
</button>
      
    </div>
  </div>
)}
    </div>
  );
}

