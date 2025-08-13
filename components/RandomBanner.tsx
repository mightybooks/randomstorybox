"use client";

import Image from "next/image";

export default function RandomBanner() {
  // adver01.webp ~ adver12.webp 경로 배열 생성
  const banners = Array.from(
    { length: 12 },
    (_, i) => `/banners/adver${String(i + 1).padStart(2, "0")}.webp`
  );

  // 무작위 선택
  const randomIndex = Math.floor(Math.random() * banners.length);
  const selectedBanner = banners[randomIndex];

  return (
    <div className="w-full max-w-[800px] mx-auto mt-8">
      <Image
        src={selectedBanner}
        alt={`광고 배너 ${randomIndex + 1}`}
        width={800}
        height={800}
        className="rounded-lg shadow-md"
      />
    </div>
  );
}
