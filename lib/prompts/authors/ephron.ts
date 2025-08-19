import type { PromptArgs, TemplateRenderer } from "../types";
import { COMMON_BLOCK } from "../common";


const ephron: TemplateRenderer = ({ words }) => `
[노라 에프런 스타일 로맨틱 코미디]
다음 5개 단어를 사용하라: ${words.join(", ")}


목표:
- 경쾌하고 따뜻한 톤의 로맨틱 코미디.
- 오해·우연·해프닝을 사건의 기점으로 사용.
- 센스 있는 대사와 속마음 독백.
- 결말은 해소 없이 암시로 마무리.


구조 (총 1200자, 6단락):
(1) 가벼운 도입. {단어1}
(2) 사소한 사건 발생, 짧은 대사·독백. {단어2}
(3) 사건 확대, 상대 등장, 유쾌한 신경전. {단어3}
(4) 분위기 전환, 호감의 조짐. {단어4}
(5) 감정적 클라이맥스. {단어5}
(6) 결말은 주지 않고 다음을 암시.


문체 규칙(로코):
- 대사/내적 독백 40% 이상.
- 감정적 클라이맥스에서 멈추고 암시로 남긴다.
${COMMON_BLOCK}`;


export default ephron;
