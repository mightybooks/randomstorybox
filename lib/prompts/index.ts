import type { PromptArgs } from "./types";
import byungmat from "./authors/byungmat";
import msr from "./authors/msr";
import king from "./authors/king";
import ephron from "./authors/ephron";


const templates: Record<string, (args: PromptArgs) => string> = {
byungmat,
msr,
king,
ephron,
};


export function buildPrompt(style: keyof typeof templates, words: string[]) {
const args: PromptArgs = { words };
const render = templates[style] ?? msr;


// 단어 치환 처리 (예전 방식 유지)
return render(args)
.replaceAll("{단어1}", words[0])
.replaceAll("{단어2}", words[1])
.replaceAll("{단어3}", words[2])
.replaceAll("{단어4}", words[3])
.replaceAll("{단어5}", words[4]);
}
