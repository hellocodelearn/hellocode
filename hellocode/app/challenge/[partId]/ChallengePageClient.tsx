"use client";

import { useRouter, useParams } from "next/navigation";
import { parts } from "@/app/course-data";
import {
  CHALLENGE_ENERGY_COST,
  getChallengeStarsForPart,
  getEnergy,
  loadProgress,
  deductEnergy,
} from "@/app/user-progress";
import { IconBattery, IconX } from "@/app/components/icons";
import { DotLottiePlayer } from "@/app/components/DotLottiePlayer";
import { PrimaryButton } from "@/app/components/PrimaryButton";

export default function ChallengePageClient() {
  const router = useRouter();
  const params = useParams<{ partId: string }>();
  const partId = params.partId;
  const part = parts.find((p) => p.id === partId) ?? parts[0];
  const partIndex = parts.findIndex((p) => p.id === part.id);

  const progress = loadProgress();
  const stars = getChallengeStarsForPart(progress, part.id);
  const nextStar = Math.min(3, stars + 1);
  const energy = getEnergy(progress);

  const xpForNextStar =
    nextStar === 1 ? 10 : nextStar === 2 ? 20 : 40;

  const animationIndex = Math.max(1, Math.min(10, partIndex + 1));

  const handleStartChallenge = () => {
    const latest = loadProgress();
    const latestEnergy = getEnergy(latest);
    if (latestEnergy < CHALLENGE_ENERGY_COST) {
      alert("能量不足，挑战需要 15 点能量。");
      router.push("/");
      return;
    }
    deductEnergy(CHALLENGE_ENERGY_COST);
    router.push(`/challenge/${part.id}/prepare`);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#3c3c3c] flex flex-col px-4 pt-safe">
      {/* 顶部 Header：左 X，中间标题，右侧粉色体力胶囊 */}
      <header className="pt-4 pb-2 flex items-center justify-between">
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600"
          onClick={() => router.back()}
        >
          <IconX className="w-5 h-5" />
        </button>
        <div className="text-sm font-extrabold text-slate-500">
          第 {partIndex + 1} 部分
        </div>
        <div className="flex items-center gap-1 rounded-full bg-[#ffe0ea] px-2 py-0.5 text-[#ff78ca] text-xs font-bold">
          <IconBattery className="w-3.5 h-3.5" />
          <span>{energy}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* 星星进度：中间高，两边低，呈弧形 */}
        <div className="relative h-8 w-full flex items-center justify-center mt-2 mb-4">
          <div className="relative h-8 w-28">
            {/* 左星 */}
            <svg
              viewBox="0 0 24 24"
              className="absolute left-0 top-2 w-7 h-7"
              aria-hidden
            >
              <path
                d="M12 2.5 9.4 8.1 3.3 8.8 7.7 12.7 6.5 18.7 12 15.6 17.5 18.7 16.3 12.7 20.7 8.8 14.6 8.1 12 2.5Z"
                fill={stars >= 1 ? "#FFC800" : "#E5E5E5"}
              />
            </svg>
            {/* 中星 */}
            <svg
              viewBox="0 0 24 24"
              className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-8"
              aria-hidden
            >
              <path
                d="M12 2.5 9.4 8.1 3.3 8.8 7.7 12.7 6.5 18.7 12 15.6 17.5 18.7 16.3 12.7 20.7 8.8 14.6 8.1 12 2.5Z"
                fill={stars >= 2 ? "#FFC800" : "#E5E5E5"}
              />
            </svg>
            {/* 右星 */}
            <svg
              viewBox="0 0 24 24"
              className="absolute right-0 top-2 w-7 h-7"
              aria-hidden
            >
              <path
                d="M12 2.5 9.4 8.1 3.3 8.8 7.7 12.7 6.5 18.7 12 15.6 17.5 18.7 16.3 12.7 20.7 8.8 14.6 8.1 12 2.5Z"
                fill={stars >= 3 ? "#FFC800" : "#E5E5E5"}
              />
            </svg>
          </div>
        </div>

        {/* 吉祥物 + 主文案（两行，大字号） */}
        <div className="flex flex-col items-center mt-2 mb-5">
          <div className="w-32 h-32 mb-3">
            <DotLottiePlayer
              src={`/robot_home_${animationIndex}.lottie`}
              className="w-32 h-32"
            />
          </div>
          <p className="text-center leading-snug text-slate-800 font-extrabold text-[18px]">
            <span className="block mb-1">在时限内答对所有问题，</span>
            <span className="block">就能拿到第 {nextStar} 颗星！</span>
          </p>
        </div>

        {/* 数据卡片：当前等级 / 最多可获得经验 */}
        <div className="w-full max-w-xs rounded-2xl border border-slate-200 bg-slate-50/60 py-2 px-3 flex text-xs mb-6">
          <div className="flex-1 flex flex-col items-center justify-center border-r border-slate-200">
            <div className="text-[11px] text-slate-500 mb-1">当前等级</div>
            <div className="text-sm font-extrabold text-[#58CC02]">
              {nextStar} / 3
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-[11px] text-slate-500 mb-1">最多可获得</div>
            <div className="text-sm font-extrabold text-[#58CC02]">
              {xpForNextStar}{" "}
              <span className="text-sm font-extrabold text-[#58CC02]">
                经验
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 底部 CTA：和其他页面一样的绿色底部按钮 */}
      <footer className="pb-6">
        <PrimaryButton
          onClick={handleStartChallenge}
          label={
            <span className="flex items-center justify-center gap-2">
              <span>挑战只需要 {CHALLENGE_ENERGY_COST}</span>
              <IconBattery className="w-4 h-4" />
            </span>
          }
        />
      </footer>
    </div>
  );
}

