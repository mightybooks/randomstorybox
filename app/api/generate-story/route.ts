import { prompts } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const { style, words } = await req.json(); 
    // style: 'byungmat' | 'msr' | 'king' | 'ephron'
    // words: ["버스", "창문", "우산", "사과", "종이컵"]

    if (!style || !words || !Array.isArray(words) || words.length !== 5) {
      return new Response(
        JSON.stringify({ error: "style과 words(5개 배열)를 모두 보내야 합니다." }),
        { status: 400 }
      );
    }

    // 단어 셔플
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    // 선택한 스타일 프롬프트 불러오기
    const template = prompts[style as keyof typeof prompts];
    if (!template) {
      return new Response(JSON.stringify({ error: "유효하지 않은 style 값입니다." }), {
        status: 400
      });
    }

    // 단어 치환
    const prompt = template
      .replace(/{단어1}/g, shuffled[0])
      .replace(/{단어2}/g, shuffled[1])
      .replace(/{단어3}/g, shuffled[2])
      .replace(/{단어4}/g, shuffled[3])
      .replace(/{단어5}/g, shuffled[4])
      .replace(/{X1}/g, shuffled[0])
      .replace(/{X2}/g, shuffled[1])
      .replace(/{X3}/g, shuffled[2])
      .replace(/{X4}/g, shuffled[3])
      .replace(/{X5}/g, shuffled[4]);

    // OpenAI API 호출
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8 // 창의성 약간 높임
      })
    });

    const data = await r.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return new Response(JSON.stringify({ error: "OpenAI 응답이 비어있습니다." }), {
        status: 500
      });
    }

    return new Response(
      JSON.stringify({
        result: data.choices[0].message.content,
        usedPrompt: prompt, // 디버그용
        shuffledWords: shuffled // 디버그용
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("스토리 생성 오류:", error);
    return new Response(JSON.stringify({ error: "서버 오류" }), { status: 500 });
  }
}
