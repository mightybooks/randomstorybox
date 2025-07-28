// app/api/generate-image/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      console.warn('⚠️ 잘못된 프롬프트 입력:', prompt);
      return NextResponse.json({ error: 'Prompt is missing or invalid' }, { status: 400 });
    }

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
        size: '512x512', // 이미지 사이즈 명확히 지정
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI 응답 실패:', errorText);
      return NextResponse.json(
        { error: 'OpenAI image generation failed', details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();

    // 응답 유효성 확인
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) {
      console.error('⚠️ OpenAI 응답에는 imageUrl이 없음:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'No image URL found in OpenAI response' },
        { status: 500 }
      );
    }

    console.log('✅ 이미지 생성 성공:', imageUrl);
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('🚨 서버 내부 에러:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
