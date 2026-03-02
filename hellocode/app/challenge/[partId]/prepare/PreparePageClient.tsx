"use client";

import { useRouter, useParams } from "next/navigation";
import { parts } from "@/app/course-data";
import {
  getChallengeStarsForPart,
  loadProgress,
} from "@/app/user-progress";
import { IconX } from "@/app/components/icons";
import { PrimaryButton } from "@/app/components/PrimaryButton";
import Image from "next/image";

export default function PreparePageClient() {
  const router = useRouter();
  const params = useParams<{ partId: string }>();
  const partId = params.partId;
  const part = parts.find((p) => p.id === partId) ?? parts[0];

  const progress = loadProgress();
  const stars = getChallengeStarsForPart(progress, part.id);
  const nextStar = Math.min(3, stars + 1);

  const timerColor = "#a4579d";

  // 不同等级对应的挑战总时间
  const totalSeconds =
    nextStar === 1 ? 60 : nextStar === 2 ? 105 : 150;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // 布局用的节点（包含 0 节点，但 0 不渲染出来）
  const layoutSegments =
    nextStar === 1
      ? [0, 5, 10]
      : nextStar === 2
      ? [0, 5, 10, 20]
      : [0, 10, 20, 40];

  // 准备页还没开始答题，进度始终为 0
  const progressPercent = 0;

  const handleContinue = () => {
    router.push(`/challenge/${part.id}/play`);
  };

  return (
    <div className="min-h-screen bg-white text-[#3c3c3c] flex flex-col px-4">
      {/* 顶部：左 X，中间进度条，右侧倒计时图标 + 文本 */}
      <header className="pt-4 pb-2 flex items-center">
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600"
          onClick={() => router.back()}
        >
          <IconX className="w-5 h-5" />
        </button>

        {/* 进度条：节点均分，最后一个节点刚好在条的最右侧 */}
        <div className="flex-1 px-3">
          <div className="relative h-6">
            {/* 灰色底条 */}
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
            {/* 紫色进度条：从左侧填充到当前节点 */}
            <div
              className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: timerColor,
              }}
            />
            {/* 节点：按数量均分，包含 0 节点但不显示 0 的圆形和数字 */}
            <div className="absolute inset-0 flex items-center justify-between">
              {layoutSegments.map((value) =>
                value === 0 ? (
                  // 0 节点：占位，不画圆和数字
                  <div key="segment-0" className="w-0 h-0" />
                ) : (
                  <div
                    key={value}
                    className="w-6 h-6 rounded-full bg-[#dcdcdc] flex items-center justify-center text-[11px] font-bold text-white"
                  >
                    {value}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* 倒计时图标 + 时间文案（此页不真正计时，只展示对应等级的总时长） */}
        <div className="ml-2 flex items-center gap-1 text-xs font-extrabold text-[#a4579d]">
          <svg
            viewBox="0 0 1024 1024"
            className="w-7 h-7"
            aria-hidden
          >
            <path
              d="M511.926857 0.804571A511.707429 511.707429 0 0 0 0.731429 512 511.707429 511.707429 0 0 0 512 1023.049143 511.707429 511.707429 0 0 0 1023.049143 512 511.707429 511.707429 0 0 0 511.926857 0.804571z"
              fill="#a4579d"
            />
            <path
              d="M709.851429 637.220571L533.211429 535.04v-278.674286a42.642286 42.642286 0 0 0-85.211429 0v298.203429c0 15.798857 19.602286 29.037714 32.402286 36.352 3.510857 5.339429 13.238857 10.166857 19.163428 13.531428L675.254857 710.948571c20.406857 11.702857 42.422857 4.754286 54.198857-15.579428 11.702857-20.333714 0.804571-46.372571-19.602285-58.148572z"
              fill="#ffffff"
            />
          </svg>
          <span>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* 中间：对白气泡 + 吉祥物 */}
      <main className="flex-1 flex flex-col items-center mt-6">
        {/* 对话气泡 */}
        <div className="relative max-w-xs rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-3 mb-6">
          <p className="text-sm leading-relaxed text-slate-700">
            你有{" "}
            <span className="font-extrabold text-[#58CC02]">
              {minutes} 分 {seconds} 秒
            </span>
            的时间完成挑战。3、2、1，开始咯！
          </p>
          {/* 气泡小尾巴 */}
          <div className="absolute left-10 -bottom-2 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45" />
        </div>

        {/* 吉祥物：这里用占位插画，可以后续换成 robot lottie 或 svg */}
        <div className="w-40 h-40 flex items-end justify-center mb-4">
          <Image
            src="/robot-mascot.svg"
            alt="challenge mascot"
            width={160}
            height={160}
            className="object-contain"
          />
        </div>
      </main>

      {/* 底部绿色按钮：继续 */}
      <footer className="pb-6">
        <PrimaryButton label="继续" onClick={handleContinue} />
      </footer>
    </div>
  );
}

