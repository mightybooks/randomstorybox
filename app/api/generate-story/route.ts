// app/api/generate-story/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { keywords, genre } = await req.json();

  const prompt = `
당신은 즉흥적으로 기묘하고 엉뚱한 이야기들을 창작하는 이야기꾼입니다.
다음 단어들을 모두 활용해 ${genre} 장르의 짧은 이야기를 써주세요.

- 단어 목록: ${keywords.map((w) => `"${w}"`).join(", ")}
- 글의 분량은 1000자 내외
- 각 단어는 인물, 사건, 배경, 오브제로 자연스럽게 등장해야 합니다
- 이야기는 기승전결 구조를 따르지 않아도 좋지만, 전개가 예측 불가능하고 독특해야 합니다
- 너무 설명적이거나 뻔한 교훈은 피해주세요
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
      max_tokens: 800,
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
