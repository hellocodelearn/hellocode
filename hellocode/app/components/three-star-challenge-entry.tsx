"use client";

import { DotLottiePlayer } from "./DotLottiePlayer";

interface ThreeStarChallengeEntryProps {
  partId: string;
  animationIndex: number;
  stars: number;
  disabled?: boolean;
  onClick?: () => void;
}

export function ThreeStarChallengeEntry({
  partId,
  animationIndex,
  stars,
  disabled = false,
  onClick,
}: ThreeStarChallengeEntryProps) {
  const clampedIndex = Math.max(1, Math.min(animationIndex, 10));
  const animationSrc = `/robot_home_${clampedIndex}.lottie`;
  const filledStars = Math.max(0, Math.min(3, stars));
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      className={`flex flex-col items-center justify-center gap-1 transition-transform ${
        disabled ? "opacity-60 cursor-default" : "active:translate-y-0.5 cursor-pointer"
      }`}
      aria-label={`第 ${partId} 部分的三星挑战（暂未开放）`}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
    >
      {/* 动态角色：使用 .lottie 动画文件，尺寸略大于宝箱，不需要圆形底 */}
      <div
        className="flex items-center justify-center"
        style={{ width: 160, height: 160 }}
      >
        <DotLottiePlayer src={animationSrc} className="w-[160px] h-[160px]" />
      </div>

      {/* 底部三颗星：根据当前星数点亮，中间略低，两侧略高，形成向下的弧形 */}
      <div className="relative mt-1 h-5 w-20">
        {/* 左星（灰） */}
        <svg
          viewBox="0 0 24 24"
          className="absolute left-1 top-0 w-6 h-6"
          aria-hidden
        >
          <path
            d="M12 2.5 9.4 8.1 3.3 8.8 7.7 12.7 6.5 18.7 12 15.6 17.5 18.7 16.3 12.7 20.7 8.8 14.6 8.1 12 2.5Z"
            fill={filledStars >= 1 ? "#facc15" : "#e5e7eb"}
          />
        </svg>
        {/* 中间星（金色） */}
        <svg
          viewBox="0 0 24 24"
          className="absolute left-1/2 -translate-x-1/2 top-2 w-6 h-6"
          aria-hidden
        >
          <path
            d="M12 2.5 9.4 8.1 3.3 8.8 7.7 12.7 6.5 18.7 12 15.6 17.5 18.7 16.3 12.7 20.7 8.8 14.6 8.1 12 2.5Z"
            fill={filledStars >= 2 ? "#facc15" : "#e5e7eb"}
          />
        </svg>
        {/* 右星（灰） */}
        <svg
          viewBox="0 0 24 24"
          className="absolute right-1 top-0 w-6 h-6"
          aria-hidden
        >
          <path
            d="M12 2.5 9.4 8.1 3.3 8.8 7.7 12.7 6.5 18.7 12 15.6 17.5 18.7 16.3 12.7 20.7 8.8 14.6 8.1 12 2.5Z"
            fill={filledStars >= 3 ? "#facc15" : "#e5e7eb"}
          />
        </svg>
      </div>
    </button>
  );
}

