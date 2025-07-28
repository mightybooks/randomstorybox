// app/api/generate-image/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log('🖼️ 이미지 생성 요청 도착:', prompt);

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

    // 에러 응답 처리
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI 응답 실패:', errorText);
      return NextResponse.json({ error: 'OpenAI image generation failed', details: errorText }, { status: 500 });
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url || '';
    console.log('🔥 OpenAI 전체 응답:', JSON.stringify(data, null, 2));
    console.log('✅ 이미지 생성 성공:', imageUrl);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('🚨 서버 내부 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
