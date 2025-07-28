// app/api/generate-image/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      response_format: 'url',
    }),
  });

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url || '';

  return NextResponse.json({ imageUrl });
}
