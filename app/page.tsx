'use client';

import { useState } from 'react';

const questions = [
  '당신이 좋아하는 색깔은?',
  '최근에 본 인상적인 영화는?',
  '어릴 적 꿈은 무엇이었나요?',
  '지금 떠오르는 단어 하나를 적어보세요.',
  '당신을 웃게 만드는 것은 무엇인가요?',
  '무인도에 가져가고 싶은 것은?',
  '지금 가장 하고 싶은 일은?',
];

const wordPool = [
  '무당', '식기세척기', '하마', '콘드로이친', '가습기',
  '고무장갑', '신호등', '해초', '냉장고', '연필깎이',
  '구름다리', '초코송이', '두루마리', '라면봉지', '테이프',
  '양파즙', '회전목마', '솜사탕', '사이다', '보조배터리',
  '달고나', '쓰레받기', '호루라기', '장난감총', '달력',
  '마사지건', '귤껍질', '전기장판', '유산균', '박하사탕',
  '풍선껌', '젤리빈', '스케이트', '딱풀', '물티슈',
  '드라이기', '자석', '치약', '베개', '고무줄',
  '반창고', '커튼', '귓불', '해바라기씨', '시금치',
  '도라에몽', '솜뭉치', '해시계', '뚝배기', '소화기'
];

export default function Home() {
  const [randomboxCurrent, setRandomboxCurrent] = useState(-1);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [genre, setGenre] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFetched, setImageFetched] = useState(false);
  const [statusText, setStatusText] = useState('');

  const nextQuestion = () => {
    if (randomboxCurrent < 6) {
      setRandomboxCurrent((prev) => prev + 1);
    } else if (randomboxCurrent === 6) {
      const selected = Array.from(
        document.querySelectorAll<HTMLInputElement>('input[name="randombox-word"]:checked')
      ).map((input) => input.value);

      const genreInput = document.querySelector<HTMLInputElement>('input[name="randombox-genre"]:checked');

      if (selected.length !== 5 || !genreInput) {
        alert('단어 5개와 장르를 선택해주세요!');
        return;
      }

      setSelectedWords(selected);
      setGenre(genreInput.value);
      setRandomboxCurrent(7);
      generateImage(selected.join(', ') + ' 장르: ' + genreInput.value);
    }
  };

  const generateImage = async (prompt: string) => {
    try {
      setStatusText('🖼️ 이미지를 준비하고 있어요...');
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const imgData = await res.json();
      console.log('🔥 이미지 응답 확인:', imgData);

      if (imgData.imageUrl) {
        setImageUrl(imgData.imageUrl);
        setImageFetched(true);
      } else {
        setStatusText('❌ 이미지 생성에 실패했어요!');
      }
    } catch (e) {
      console.error('🚨 이미지 생성 에러:', e);
      setStatusText('❌ 이미지 생성 중 에러 발생');
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>🌀 당신만의 기묘한 이야기</h1>

      {randomboxCurrent < 0 && <p>질문을 시작해볼까요?</p>}

      {randomboxCurrent >= 0 && randomboxCurrent < 7 && (
        <>
          <p>{questions[randomboxCurrent]}</p>
          {randomboxCurrent < 6 ? (
            <ul>
              {Array.from({ length: 5 }, (_, i) => wordPool[Math.floor(Math.random() * wordPool.length)]).map(
                (word) => (
                  <li key={word}>
                    <label>
                      <input type="checkbox" name="randombox-word" value={word} /> {word}
                    </label>
                  </li>
                )
              )}
            </ul>
          ) : (
            <div>
              <label><input type="radio" name="randombox-genre" value="코믹" /> 코믹</label>
              <label><input type="radio" name="randombox-genre" value="감성" /> 감성</label>
              <label><input type="radio" name="randombox-genre" value="액션" /> 액션</label>
            </div>
          )}
        </>
      )}

      {randomboxCurrent === 7 && (
        <div style={{ marginTop: '2rem' }}>
          <p>{statusText}</p>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Generated Story Image"
              style={{ maxWidth: '100%', borderRadius: '12px', marginTop: '1rem' }}
            />
          ) : (
            <p style={{ color: '#b00' }}>❌ 이미지가 없습니다.</p>
          )}
          <p><strong>✅ 선택한 단어:</strong> {selectedWords.join(', ')}</p>
          <p><strong>📖 장르:</strong> {genre}</p>
        </div>
      )}

      {randomboxCurrent < 7 && (
        <button id="randombox-nextBtn" onClick={nextQuestion}>
          {randomboxCurrent < 0
            ? '시작하기'
            : randomboxCurrent === 6
            ? '마지막 질문'
            : '다음'}
        </button>
      )}
    </main>
  );
}
