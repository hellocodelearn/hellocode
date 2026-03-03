"use client";

import { useRef, useCallback } from "react";

type SoundKey = "complete" | "diamond" | "failure" | "star" | "success";

function createAudio(src: string): HTMLAudioElement | null {
  try {
    const audio = new Audio(src);
    audio.preload = "auto";
    return audio;
  } catch {
    return null;
  }
}

export function useGameSounds() {
  const refs = useRef<Partial<Record<SoundKey, HTMLAudioElement | null>>>({});

  const play = useCallback((key: SoundKey) => {
    if (typeof window === "undefined") return;

    if (!refs.current[key]) {
      // 音频放在 public/sounds 下，文件名为 `${key}.wav`
      refs.current[key] = createAudio(`/sounds/${key}.wav`);
    }
    const audio = refs.current[key];
    if (!audio) return;

    try {
      audio.currentTime = 0;
      // 忽略可能的自动播放失败（如浏览器策略）
      void audio.play();
    } catch {
      // ignore
    }
  }, []);

  return {
    playComplete: () => play("complete"),
    playDiamond: () => play("diamond"),
    playFailure: () => play("failure"),
    playStar: () => play("star"),
    playSuccess: () => play("success"),
  };
}

