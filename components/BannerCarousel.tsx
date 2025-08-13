"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/**
 * BannerCarousel
 * - For 800x800 .webp banners (adver01 ~ adver12)
 * - Drop files in /public/banners/adver01.webp ... adver12.webp
 * - Responsive square (keeps 1:1 using CSS aspect-square)
 * - Autoplay, pause on hover/focus, keyboard arrows, swipe on touch
 * - Optional links per slide
 */
export default function BannerCarousel({
  images = Array.from({ length: 12 }, (_, i) => `/banners/adver${String(i + 1).padStart(2, "0")}.webp`),
  links = [], // e.g., ["/promo/alpha", "https://...", null, ...]
  intervalMs = 4000,
  showArrows = true,
  showDots = true,
  className = "",
}: {
  images?: string[];
  links?: (string | null | undefined)[];
  intervalMs?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIdx(((next % images.length) + images.length) % images.length),
    [images.length]
  );

  const next = useCallback(() => go(idx + 1), [go, idx]);
  const prev = useCallback(() => go(idx - 1), [go, idx]);

  // autoplay
  useEffect(() => {
    if (!playing) return;
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, intervalMs);
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [idx, playing, intervalMs, next]);

  const pause = () => setPlaying(false);
  const play = () => setPlaying(true);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key.toLowerCase() === " ") setPlaying(p => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  // swipe (basic)
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    startX.current = null;
  };

  const Active = (
    <div className="relative w-full h-full">
      <Image
        key={idx}
        src={images[idx]}
        alt={`banner-${idx + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        priority={idx === 0}
        loading={idx === 0 ? "eager" : "lazy"}
        className="object-cover select-none"
        unoptimized={false}
      />
    </div>
  );

  const wrapIfLink = (node: React.ReactNode) => {
    const href = links[idx];
    if (!href) return node;
    const external = /^https?:\/\//i.test(String(href));
    return (
      <a
        href={String(href)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-label={`광고 배너 ${idx + 1}로 이동`}
      >
        {node}
      </a>
    );
  };

  return (
    <div
      className={`group relative mx-auto aspect-square w-full max-w-[800px] overflow-hidden rounded-2xl shadow-md ${className}`}
      onMouseEnter={pause}
      onMouseLeave={play}
      onFocus={pause}
      onBlur={play}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="프로모션 배너"
    >
      {/* slides */}
      {wrapIfLink(Active)}

      {/* arrows */}
      {showArrows && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition-opacity hover:bg-black/50 focus:outline-none"
            aria-label="이전 배너"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition-opacity hover:bg-black/50 focus:outline-none"
            aria-label="다음 배너"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* play/pause */}
      <button
        type="button"
        onClick={() => setPlaying(p => !p)}
        className="absolute bottom-2 right-2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm hover:bg-black/50"
        aria-label={playing ? "일시정지" : "재생"}
      >
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>

      {/* dots */}
      {showDots && (
        <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`${i + 1}번 배너로 이동`}
              onClick={() => go(i)}
              className={`h-2 w-2 rounded-full transition-opacity ${
                i === idx ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Usage (example):
 *
 * import BannerCarousel from "@/components/BannerCarousel";
 *
 * export default function Page() {
 *   return (
 *     <section className="p-4">
 *       <BannerCarousel
 *         // default expects /public/banners/adver01.webp ... adver12.webp
 *         links={["/promo/ad1", null, "/promo/ad3", "https://ext.site", /* ... */]}
 *         intervalMs={5000}
 *         className="w-full"
 *       />
 *     </section>
 *   );
 * }
 */
