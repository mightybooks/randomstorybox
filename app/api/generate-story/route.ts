// app/api/generate-story/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { keywords, genre } = await req.json();

const prompt = `
당신은 즉흥적으로 기묘하고 감각적인 이야기들을 창작하는 이야기꾼입니다. 
다음 조건을 모두 지켜 ${genre} 장르의 독특한 이야기를 써주세요:

- 다 단어들을 모두 활용해 주세요: ${(keywords as string[]).map((w: string) => `"${w}"`).join(", ")}
- 글 분량은 공백 포함 1000자 내외로 작성하세요. 반드시 900자 이상이어야 합니다.
- 각 단어는 단순히 등장만 하지 말고, 이야기의 감정 흐름이나 세계관을 구성하는 핵심 일부로 녹아들게 하세요.
- 환상성과 감각적 묘사를 적극 활용해, 독자가 그림을 그리듯 장면을 상상할 수 있게 하세요.
- 문장과 문장은 유기적으로 연결되어야 하며, 감정의 흐름이 점진적으로 이어지도록 하세요.
- 전개는 예측 불가능하고 독특해야 합니다. 단, 과도한 추상보다는 구체적 이미지 중심으로 써 주세요.
- 너무 설명적이거나 뻔한 교훈은 피하고, 열린 결말이나 여운을 남기는 마무리를 하세요.

절대로 아래와 같은 문장으로 끝맺지 마세요:
- “이야기는 끝나지 않았다.”
- “나는 생활로 돌아갔다.”
- “이 모든 것은 꿈이었을까?”
- 또는 기타 GPT가 자주 쓰는 습관적인 결말 표현들
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 1200,
    }),
  });

  const data = await response.json();
if (!response.ok) {
  console.error("🛑 GPT 응답 에러:", data);
}
const story =
  data?.choices?.[0]?.message?.content?.trim() ??
  `스토리 생성 실패 (응답 없음): ${JSON.stringify(data)}`;

  return NextResponse.json({ story });
}
