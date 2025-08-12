'use client'

import { useMemo, useState, useEffect } from 'react'

// ✅ 새 질문 5개 샘플 (원본 데이터로 손쉽게 교체 가능)
const QUESTIONS = [
  {
    id: 1,
    text: '당신은 무엇으로 환생하고 싶나요?',
    options: ['고양이', '바람', '돌멩이', '지하철 안내방송'],
  },
  {
    id: 2,
    text: '평소 무엇이 가장 불편한가요?',
    options: ['줄 서기', '소음', '예의 없는 말투', '춥고 건조한 공기'],
  },
  {
    id: 3,
    text: '조금이라도 안정감을 느끼는 장소는?',
    options: ['편의점 진열대 사이', '지하 주차장', '옥상 모서리', '세탁소 스팀 옆'],
  },
  {
    id: 4,
    text: '법관이라면 어떤 주제의 법을 만들까요?',
    options: ['퇴근보장법', '소음 선제 차단법', '말 과장 금지법', '건조주의보 유급휴가법'],
  },
  {
    id: 5,
    text: '당신이 정말 용납하기 힘든 것은?',
    options: ['감정 과장', '약속 파기', '씹던 껌 붙이기', '끝말잇기 편법'],
  },
]

type Phase = 'idle' | 'asking' | 'writing' | 'drawing' | 'done'

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [step, setStep] = useState(0) // 0~4 index for QUESTIONS
  const [answers, setAnswers] = useState<string[]>(Array(QUESTIONS.length).fill(''))
  const [notice, setNotice] = useState('')
  const [story, setStory] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const currentQ = useMemo(() => QUESTIONS[step], [step])

  const start = () => {
    setPhase('asking')
    setStep(0)
    setAnswers(Array(QUESTIONS.length).fill(''))
    setStory('')
    setImageUrl('')
    setNotice('')
  }

  const onSelect = (choice: string) => {
    const next = [...answers]
    next[step] = choice
    setAnswers(next)
    setNotice('')
  }

  const nextStep = () => {
    if (!answers[step]) {
      setNotice('선택지를 골라주세요.')
      return
    }
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
      return
    }
    // 마지막 질문을 마치면 글 생성 → 이미지 생성 순으로 진행
    setPhase('writing')
    setNotice('이야기를 정리하는 중… (writing)')

    // 🔧 여기에서 실제 story API 호출
    // fetch('/api/generate-story', { method: 'POST', body: JSON.stringify({ answers }) })
    //   .then(r => r.json())
    //   .then(data => { setStory(data.story); setPhase('drawing') })
    //   .catch(() => { setStory('생성 실패… 다시 시도해 주세요.'); setPhase('done') })

    // Demo: 가짜 지연으로 흐름만 재현
    setTimeout(() => {
      const stub = makeStubStory(answers)
      setStory(stub)
      setPhase('drawing')
      setNotice('그림을 그리고 있어요… (drawing)')

      // 🔧 여기에서 실제 이미지 생성 API 호출
      // fetch('/api/generate-image', { method: 'POST', body: JSON.stringify({ story }) })
      //   .then(r => r.json())
      //   .then(data => { setImageUrl(data.url) })

      setTimeout(() => {
        // 랜덤 플레이스홀더 (교체 예정)
        const rnd = Math.floor(Math.random() * 10000)
        setImageUrl(`https://picsum.photos/seed/${rnd}/1200/720`)
      }, 900)
    }, 900)
  }

  // 이미지 로드 완료되면 done
  useEffect(() => {
    if (!imageUrl) return
    const img = new Image()
    img.src = imageUrl
    img.onload = () => setPhase('done')
    img.onerror = () => setPhase('done')
  }, [imageUrl])

  return (
    <main className="wrap">
      <div className="card">
        <header className="header">
          <h1 className="title">문수림의 랜덤서사박스</h1>
          <p className="subtitle">진지한데 엉뚱한 단편 서사 생성기</p>
        </header>

        {phase === 'idle' && (
          <div className="center">
            <button className="btn primary" onClick={start}>시작하기</button>
          </div>
        )}

        {phase === 'asking' && (
          <section className="ask">
            <div className="qhead">
              <span className="qno">Q{step + 1}</span>
              <span className="qtext">{currentQ.text}</span>
            </div>

            <div className="options">
              {currentQ.options.map((opt) => (
                <label key={opt} className={`option ${answers[step] === opt ? 'active' : ''}`}>
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
                {step === QUESTIONS.length - 1 ? '완료' : '다음'}
              </button>
            </div>

            <div className="progress">
              <div className="bar" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} />
            </div>
          </section>
        )}

        {(phase === 'writing' || phase === 'drawing' || phase === 'done') && (
          <section className="result">
            {/* 이미지 상단 */}
            <div className="imgbox">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="생성 이미지" />
              ) : (
                <div className="img-skeleton">이미지 생성 중…</div>
              )}
            </div>

            {/* 글 하단 */}
            <article className="story">
              {story ? (
                story.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))
              ) : (
                <p className="typing">이야기를 정리하는 중…</p>
              )}
            </article>

            {/* 상태 라벨 */}
            {phase !== 'done' && <p className="status">{notice}</p>}

            {phase === 'done' && (
              <div className="actions center">
                <button className="btn" onClick={start}>다시 만들기</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────
// 데모용 스텁 스토리 (실제 프롬프트-응답으로 교체)
function makeStubStory(a: string[]) {
  const [w1, w2, w3, w4, w5] = a
  return [
    `오늘의 화자는 ${w1}로 환생하는 상상을 하다, ${w2}에 대한 불편을 떠올린다.`,
    `${w3} 같은 장소에서 겨우 숨 고르며, 머릿속으로 ‘${w4}’를 입안에서 굴려 본다.`,
    `그러다 이상하게도, 용납하기 힘든 건 결국 '${w5}'라는 사실을 깨닫는다.`,
    `아무도 그걸 정확히 말하지 않았지만, 우리는 이미 알고 있었다.`,
  ].join('\n')
}
