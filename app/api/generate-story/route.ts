import { NextResponse } from "next/server";
import { prompts } from "@/lib/prompts";
import { z } from "zod";

/** ── 입력 검증 스키마 (두 형태 모두 허용) ───────────────────────────── */
const Style = z.enum(["byungmat", "msr", "king", "ephron"]);
const WithPrompt = z.object({
  prompt: z.string().min(10),
  style: Style,
  words: z.array(z.string()).length(5),
});
const WithoutPrompt = z.object({
  style: Style,
  words: z.array(z.string()).length(5),
});

/** 단어 셔플 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 템플릿에 단어 치환 */
function fillTemplate(template: string, words: string[]) {
  return template
    .replace(/{단어1}/g, words[0])
    .replace(/{단어2}/g, words[1])
    .replace(/{단어3}/g, words[2])
    .replace(/{단어4}/g, words[3])
    .replace(/{단어5}/g, words[4])
    .replace(/{X1}/g, words[0])
    .replace(/{X2}/g, words[1])
    .replace(/{X3}/g, words[2])
    .replace(/{X4}/g, words[3])
    .replace(/{X5}/g, words[4]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1) {prompt,style,words} 형태 우선 검증
    const withPromptParsed = WithPrompt.safeParse(body);

    // 2) 없으면 {style,words} 형태로 받아 프롬프트 생성
    let prompt: string;
    let style: z.infer<typeof Style>;
    let words: string[];

    if (withPromptParsed.success) {
      ({ prompt, style, words } = withPromptParsed.data);
    } else {
      const noPromptParsed = WithoutPrompt.safeParse(body);
      if (!noPromptParsed.success) {
        return NextResponse.json(
          { message: "검증에 실패했습니다.", issues: noPromptParsed.error.issues },
          { status: 422 }
        );
      }
      style = noPromptParsed.data.style;
      words = noPromptParsed.data.words;

      const template = prompts[style as keyof typeof prompts];
      if (!template) {
        return NextResponse.json({ message: "유효하지 않은 style 값입니다." }, { status: 400 });
      }
      words = shuffle(words);
      prompt = fillTemplate(template, words);
    }

    // 3) OpenAI 호출 준비
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: "서버 설정 오류: OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 4) OpenAI 호출 (타임아웃 20s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { message: "OpenAI 호출 실패", status: res.status, detail: errText || undefined },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ message: "OpenAI 응답이 비어있습니다." }, { status: 500 });
    }

    // 5) 정상 응답
    return NextResponse.json(
      {
        result: content,
        usedPrompt: prompt,     // (옵션) 디버그용
        shuffledWords: words,   // (옵션) 디버그용
        meta: { model: "gpt-4o-mini" },
      },
      { status: 200 }
    );
  } catch (e: any) {
    if (e?.name === "AbortError") {
      return NextResponse.json({ message: "OpenAI 응답 대기 시간이 초과되었습니다." }, { status: 504 });
    }
    // Zod 에러 방어 (혹시 위에서 놓친 경우)
    if (e?.name === "ZodError") {
      return NextResponse.json({ message: "검증에 실패했습니다.", issues: e.issues }, { status: 422 });
    }
    console.error("스토리 생성 오류:", e);
    return NextResponse.json({ message: "서버 오류" }, { status: 500 });
  }
}
