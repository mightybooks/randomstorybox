import { prompts } from "@/lib/prompts";

export async function POST(req: Request) {
  const { style, words } = await req.json(); // style = 'byungmat' 등, words = [..]
  
  // 단어 셔플
  const shuffled = words.sort(() => Math.random() - 0.5);
  
  // 선택한 스타일 프롬프트 불러오기
  const template = prompts[style];
  
  // 단어 치환
  const prompt = template
    .replace("{단어1}", shuffled[0])
    .replace("{단어2}", shuffled[1])
    .replace("{단어3}", shuffled[2])
    .replace("{단어4}", shuffled[3])
    .replace("{단어5}", shuffled[4])
    .replace("{X1}", shuffled[0])
    .replace("{X2}", shuffled[1])
    .replace("{X3}", shuffled[2])
    .replace("{X4}", shuffled[3])
    .replace("{X5}", shuffled[4]);

  // 이제 prompt를 OpenAI API에 그대로 전달
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await r.json();
  return new Response(JSON.stringify({ result: data.choices[0].message.content }));
}
