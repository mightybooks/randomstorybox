// app/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문수림의 랜덤서사박스 | 진지한데 엉뚱한 단편 서사 생성기",
  description:
    "질문에 답하면, 사용자 맞춤으로 짧은 이야기가 완성됩니다. 이미지는 라이브러리에서 랜덤 매칭. 그림 상단/글 하단 레이아웃로 깔끔하게.",
  keywords:
    "랜덤서사박스, 랜덤 스토리, 병맛소설, 인터랙티브 글쓰기, 문수림, 수림스튜디오",
  alternates: { canonical: "https://randomstorybox.vercel.app/" },
  openGraph: {
    type: "website",
    title: "문수림의 랜덤서사박스",
    description:
      "질문에 답하면, 사용자 맞춤으로 짧은 이야기가 완성됩니다. 이미지는 라이브러리에서 랜덤 매칭.",
    url: "https://randomstorybox.vercel.app/",
    siteName: "문수림의 랜덤서사박스",
  },
  twitter: {
    card: "summary_large_image",
    title: "문수림의 랜덤서사박스",
    description:
      "질문에 답하면, 사용자 맞춤으로 짧은 이야기가 완성됩니다.",
  },
};

export default function Landing() {
  return (
    <main className="landing">
      <section className="landing-card">
        <h1 className="landing-title">문수림의 랜덤서사박스</h1>
        <p className="landing-sub">희노애락과 병맛이 함께 하는 이야기 박스</p>

        <p className="mt-4 landing-body">
          몇 가지 질문으로 당신만의 짧은 이야기를 생성해 드립니다.
        </p>

       <div className="mt-8 landing-body text-left">
          <p>
            안녕하세요, 소설가이자 출판사업가로 수림스튜디오를 운영중인 문수림입니다.<br/>
            이번에 제가 개발한 랜덤서사박스는<br/>
            GPT-5모델을 활용한 바이브코딩으로 웹개발을 하고, <br/>
            GPT-4o API로 이야기를 생성하는 앱입니다.
          </p>
          <p className="mt-4">
            누구나 AI와 직접 대화를 하고 이야기를 생성할 수는 있지만,<br/>
            평소에 전혀 생각해본 적 없는 소재들을 연결해<br/> 
            글을 써보는 경우는 극히 드물죠.
          </p>
          <p className="mt-4">
            문수림의 랜덤서사박스는 기존의 심리테스트 앱과는 달리<br/>
            사용자가 직접 선택한 단어를 기반으로<br/>
            정해진 답을 반복해서 보여주는 것이 아닌,<br/>
            매번 새롭게 이야기를 창조해내는 신개념 인터렉티브 글쓰기 생성 앱입니다.
          </p>
            <p className="mt-4">
            그럼, 당신만을 위해 만들어지는 하나뿐인 이야기를 마음껏 즐겨보시길 바랍니다.
            <br />
            (단, 동일IP로는 1일 2회만 이야기 생성이 가능합니다.<br/>
            이야기는 어디까지나 전적으로 '랜덤'으로 생성됩니다.<br/>)
          </p>
        </div>

        <div className="mt-8">
          <Link href="/play" className="btn primary">시작하기</Link>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} surim studio, 문수림.
      </footer>
    </main>
  );
}
