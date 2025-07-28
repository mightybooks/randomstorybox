// app/api/generate-story/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { keywords, genre } = await req.json();

  const prompt = `다음 키워드를 포함한 ${genre} 장르의 짧은 이야기(500자 이내)를 만들어줘: ${keywords.join(', ')}`;

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
  const story = data.choices?.[0]?.message?.content || '스토리 생성 실패';

  return NextResponse.json({ story });
}
