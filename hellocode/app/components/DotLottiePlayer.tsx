"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    if (hasRegisteredDotLottie) return;
    if (typeof window === "undefined") return;
    import("@dotlottie/player-component").then(() => {
      hasRegisteredDotLottie = true;
    }).catch(() => {
      // 忽略加载失败，避免在客户端报错
    });
  }, []);

  return (
    // @ts-ignore 自定义 Web Component
    <dotlottie-player
      src={src}
      loop={loop}
      autoplay={autoplay}
      class={className}
    />
  );
}


