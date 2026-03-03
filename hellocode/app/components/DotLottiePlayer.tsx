"use client";

import { useEffect, useRef } from "react";

interface DotLottiePlayerProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

let hasRegisteredDotLottie = false;

export function DotLottiePlayer({
  src,
  loop = true,
  autoplay = true,
  className,
}: DotLottiePlayerProps) {
  const playerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function ensurePlayerAndPlay() {
      if (!hasRegisteredDotLottie) {
        try {
          await import("@dotlottie/player-component");
          hasRegisteredDotLottie = true;
        } catch {
          return;
        }
      }

      if (cancelled) return;

      const el = playerRef.current as any;
      if (!el) return;

      try {
        if (typeof el.seek === "function") {
          el.seek(0);
        }
        if (autoplay && typeof el.play === "function") {
          el.play();
        }
      } catch {
        // 忽略播放失败，避免在客户端报错
      }
    }

    void ensurePlayerAndPlay();

    return () => {
      cancelled = true;
    };
  }, [src, autoplay]);

  return (
    // @ts-ignore 自定义 Web Component
    <dotlottie-player
      ref={playerRef}
      src={src}
      loop={loop}
      autoplay={autoplay}
      class={className}
    />
  );
}


