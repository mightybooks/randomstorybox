// app/api/generate-story/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { keywords, genre } = await req.json();

const prompt = `
당신은 즉흥적으로 기묘하고 엉뚱한 이야기들을 창작하는 이야기꾼입니다.
다음 단어들을 모두 활용해 ${genre} 장르의 독특한 이야기를 써주세요.

- 단어 목록: ${(keywords as string[]).map((w: string) => `"${w}"`).join(", ")}
- 글의 분량은 1000자에 가깝게 작성해 주세요 (최소 900자 이상)
- 각 단어는 단순 나열이 아니라, 이야기의 감정선이나 세계관의 중요한 일부로 자연스럽게 녹아들어야 합니다
- 환상성과 감각적 묘사를 활용해, 독자가 그림을 그리듯 상상할 수 있게 써 주세요
- 이야기는 기승전결 구조를 따르지 않아도 좋지만, 전개가 예측 불가능하고 독특해야 합니다
- 너무 설명적이거나 뻔한 교훈은 피해주세요
- 이 모든 지침을 충실히 따르고, 분량은 절대 600자 이하가 되지 않도록 써 주세요.
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
