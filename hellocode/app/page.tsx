"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStage1LessonById, parts, Part } from "@/app/course-data";
import {
  PLAYS_TO_CLEAR,
  UserProgress,
  createInitialProgress,
  getDiamonds,
  getEnergy,
  getLessonPlays,
  loadProgress,
  ENERGY_COST_PER_QUESTION,
  MAX_ENERGY,
  spendDiamondsForEnergyRefill,
  DIAMONDS_FOR_ENERGY_REFILL,
} from "@/app/user-progress";
//
function computeLessonState(
  progress: UserProgress,
  lessonId: string
): { plays: number; isUnlocked: boolean; isCleared: boolean } {
  const idNum = Number(lessonId);
  const plays = getLessonPlays(progress, lessonId);
  const isCleared = plays >= PLAYS_TO_CLEAR;
  if (idNum === 1) {
    return { plays, isUnlocked: true, isCleared };
  }
  const prevId = String(idNum - 1);
  const prevCleared = getLessonPlays(progress, prevId) >= PLAYS_TO_CLEAR;
  return { plays, isUnlocked: prevCleared, isCleared };
}

function CheckpointNode({
  lessonId,
  part,
  indexInPart,
  progress,
  onShowOutOfEnergy,
  onSelectLesson,
}: {
  lessonId: string;
  part: Part;
  indexInPart: number;
  progress: UserProgress;
  onShowOutOfEnergy?: () => void;
  onSelectLesson?: (lessonId: string, event: React.MouseEvent) => void;
}) {
  const { plays, isUnlocked } = computeLessonState(progress, lessonId);
  const isTrophy = indexInPart === part.lessonIds.length - 1;
  const baseColor = part.color;
  const grayBg = "#e5e5e5";
  const grayBorder = "#cfcfcf";

  // 0~1 之间的进度（每关玩 PLAYS_TO_CLEAR 次，默认 5 次）
  const ratio = Math.min(1, plays / PLAYS_TO_CLEAR);
  const segments = 5; // 视觉上 5 段小弧
  const filledSegments = Math.round(ratio * segments);

  const iconColor = "#ffffff";
  const discLight = isUnlocked ? baseColor : grayBg;
  const discDark = isUnlocked ? "#46a302" : grayBorder;

  // 5 段圆弧：上上版的间隔和厚度（弧长约 43°，厚 6px，半径 38），用 SVG 画成真圆弧
  const arcRadius = 38;
  const arcStrokeWidth = 6;
  const segDeg = 43; // 每段弧的角度（72° 一等分，剩余为间隙，对应上上版约 28px 弧长）
  const cx = 48;
  const cy = 48;

  const arcPaths = Array.from({ length: segments }).map((_, i) => {
    const startAngle = ((-90 + i * 72) * Math.PI) / 180;
    const endAngle = ((-90 + i * 72 + segDeg) * Math.PI) / 180;
    const x1 = cx + arcRadius * Math.cos(startAngle);
    const y1 = cy + arcRadius * Math.sin(startAngle);
    const x2 = cx + arcRadius * Math.cos(endAngle);
    const y2 = cy + arcRadius * Math.sin(endAngle);
    const fill = isUnlocked && i < filledSegments ? baseColor : grayBg;
    return { d: `M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 0 1 ${x2} ${y2}`, fill };
  });

  return (
    <button
      type="button"
      disabled={!isUnlocked}
      aria-disabled={!isUnlocked}
      className={`relative inline-flex items-center justify-center ${
        !isUnlocked ? "cursor-default opacity-60" : "cursor-pointer"
      }`}
      style={{ width: 96, height: 96 }}
      onClick={(e) => {
        if (!isUnlocked) return;
        if (
          ENERGY_COST_PER_QUESTION > 0 &&
          getEnergy(loadProgress()) < ENERGY_COST_PER_QUESTION
        ) {
          onShowOutOfEnergy?.();
          return;
        }
        onSelectLesson?.(lessonId, e);
      }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
        {/* 5 段圆弧：SVG 真弧，间隔和厚度与上上版一致 */}
        <svg
          viewBox="0 0 96 96"
          className="absolute"
          style={{ width: 96, height: 96 }}
          aria-hidden
        >
          {arcPaths.map(({ d, fill }, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={fill}
              strokeWidth={arcStrokeWidth}
              strokeLinecap="round"
            />
          ))}
        </svg>
        {/* 中间实心圆盘 */}
        <div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: 60,
            height: 60,
            background: `linear-gradient(145deg, ${discLight} 0%, ${discLight} 40%, ${discDark} 100%)`,
            borderBottom: `6px solid ${discDark}`,
            boxShadow: isUnlocked
              ? "0 6px 0 rgba(15,23,42,0.18)"
              : "0 4px 0 rgba(148,163,184,0.6)",
          }}
        >
          <div
            className="absolute -top-1 left-4 w-8 h-3 rounded-full bg-white/35"
            style={{ transform: "rotate(-20deg)" }}
          />
          <span className="material-symbols-outlined text-[30px]" style={{ color: iconColor }}>
            {isTrophy ? "emoji_events" : "star"}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress>(createInitialProgress());
  const [showOutOfEnergyModal, setShowOutOfEnergyModal] = useState(false);
  const [energyRefillChoice, setEnergyRefillChoice] = useState<"super" | "diamonds">("super");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [popupAnchor, setPopupAnchor] = useState<{ centerX: number; bottom: number } | null>(null);

  useEffect(() => {
    if (pathname !== "/") return;
    const id = setTimeout(() => setProgress(loadProgress()), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const selectedPart = selectedPartId
    ? parts.find((p) => p.id === selectedPartId) ?? null
    : null;
  const selectedLesson = selectedLessonId ? getStage1LessonById(selectedLessonId) : undefined;
  const selectedState =
    selectedLessonId != null ? computeLessonState(progress, selectedLessonId) : null;
  const isReview = Boolean(selectedState?.isCleared);
  const rewardXp = selectedLessonId ? (isReview ? 15 : 20) : 0;
  const unitIndex = selectedState ? Math.min(selectedState.plays + 1, PLAYS_TO_CLEAR) : 1;

  return (
    <div className="h-screen bg-[#f5f7fb] text-[#3c3c3c] dark:bg-[#131f24] dark:text-slate-100 flex flex-col overflow-hidden">
      {/* 顶部状态栏（固定） */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-[#f5f7fb] dark:bg-[#131f24]">
        <div className="mx-auto max-w-md px-4 pt-3 pb-2 flex items-center justify-between">
          {/* 进度 / 货币 / 能量（与局内同步） */}
          <div className="flex items-center gap-3 text-[13px] font-semibold">
            <div className="flex items-center gap-1">
              <span className="text-[18px] rounded-md bg-white/70 px-1 shadow-sm">
                🇪🇸
              </span>
              <span>1</span>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <span className="material-symbols-outlined text-[18px] leading-none">
                local_fire_department
              </span>
              <span>1</span>
            </div>

            <div className="flex items-center gap-1 text-[#1cb0f6]">
              <span className="material-symbols-outlined text-[18px] leading-none">
                diamond
              </span>
              <span>{getDiamonds(progress)}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[#ff78ca]">
              <div className="relative w-8 h-5 bg-[#ff78ca] rounded-[4px] flex items-center justify-center after:content-[''] after:absolute after:-right-[2px] after:w-[2px] after:h-2 after:bg-[#ff78ca] after:rounded-r-sm">
                <span className="material-symbols-outlined text-white text-[14px] font-bold fill-1">
                  bolt
                </span>
                <div className="absolute top-0.5 left-0.5 w-[60%] h-[3px] bg-white/30 rounded-full" />
              </div>
              <span className="font-extrabold text-xl leading-none">
                {getEnergy(progress)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 中间可滚动区域 */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md px-4 pt-[80px] pb-[96px]">
          {parts.map((part) => (
            <section key={part.id} className="mb-8">
              {/* 部分卡片 */}
              <div
                className="text-white rounded-3xl px-4 py-3 mb-4 flex items-center justify-between shadow-md"
                style={{ backgroundColor: part.color }}
              >
                <div className="text-[13px] leading-snug">
                  <div className="font-extrabold">第 1 阶段 · {part.title}</div>
                  <div className="mt-1 text-[15px] font-extrabold">
                    C 语言 · {part.lessonIds[0]} - {part.lessonIds[part.lessonIds.length - 1]} 关
                  </div>
                </div>
                <button className="ml-4 w-10 h-10 rounded-2xl bg-black/15 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[22px] text-white">
                    menu
                  </span>
                </button>
              </div>

              {/* 路线节点（简单纵向排列，左右略微错位） */}
              <div className="space-y-4">
                {part.lessonIds.map((lessonId, idx) => (
                  <div
                    key={lessonId}
                    className={`flex justify-center ${
                      idx % 2 === 0 ? "-translate-x-4" : "translate-x-4"
                    }`}
                  >
                    <CheckpointNode
                      lessonId={lessonId}
                      part={part}
                      indexInPart={idx}
                      progress={progress}
                      onShowOutOfEnergy={() => {
                        setEnergyRefillChoice("super");
                        setShowOutOfEnergyModal(true);
                      }}
                      onSelectLesson={(id, ev) => {
                        const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
                        setPopupAnchor({
                          centerX: rect.left + rect.width / 2,
                          bottom: rect.bottom,
                        });
                        setSelectedLessonId(id);
                        setSelectedPartId(part.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* 学习弹窗：在关卡下方，向上尖角对准该关卡；点击其他区域关闭 */}
      {selectedLessonId && selectedPart && selectedLesson && selectedState && popupAnchor && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 bg-transparent cursor-default"
            aria-label="关闭弹窗"
            onClick={() => {
              setSelectedLessonId(null);
              setSelectedPartId(null);
              setPopupAnchor(null);
            }}
          />
          <div
            className="fixed z-40 w-[min(calc(100vw-2rem),20rem)]"
            style={{
              left: popupAnchor.centerX,
              top: popupAnchor.bottom + 8,
              transform: "translateX(-50%)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="开始学习"
          >
            {/* 向上的尖角，对准上方关卡 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[12px]"
              style={{ borderBottomColor: selectedPart.color }}
            />
            <div
              className="rounded-3xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: selectedPart.color }}
            >
              <div className="px-5 pt-4 pb-2 text-white">
                <div className="text-[18px] font-extrabold leading-snug truncate">
                  {selectedLesson.title}
                </div>
                {!isReview && (
                  <div className="mt-1 text-[13px] font-semibold text-white/90">
                    第 {unitIndex}/{PLAYS_TO_CLEAR} 单元
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => {
                  const mode = isReview ? "review" : "learn";
                  const url = `/lesson/${selectedLessonId}?mode=${mode}&rewardXp=${rewardXp}&unit=${unitIndex}`;
                  setSelectedLessonId(null);
                  setSelectedPartId(null);
                  setPopupAnchor(null);
                  router.push(url);
                }}
                className="w-full rounded-2xl bg-white text-slate-800 font-extrabold text-base py-3.5 shadow-[0_6px_0_rgba(0,0,0,0.15)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
              >
                <span>{isReview ? "开始复习" : "开始"}</span>
                <span className="font-extrabold" style={{ color: selectedPart.color }}>
                  +{rewardXp}
                </span>
                <span className="text-slate-500 font-bold">经验</span>
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* 能量不足：底部弹窗（与局内同一套） */}
      {showOutOfEnergyModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30"
            aria-hidden
            onClick={() => setShowOutOfEnergyModal(false)}
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-40 bg-white dark:bg-[#1a2632] rounded-t-3xl shadow-2xl animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="out-of-energy-title"
          >
            <div className="px-5 pt-5 pb-8">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="out-of-energy-title"
                  className="text-xl font-extrabold text-slate-800 dark:text-white"
                >
                  能量用完了！
                </h2>
                <div className="flex items-center gap-1 text-[#1cb0f6]">
                  <span className="material-symbols-outlined text-[20px]">
                    diamond
                  </span>
                  <span className="font-bold text-lg">
                    {getDiamonds(loadProgress())}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => setEnergyRefillChoice("super")}
                  className={`flex-1 rounded-2xl p-4 border-2 text-center shadow-lg transition-all ${
                    energyRefillChoice === "super"
                      ? "border-[#0ea5e9] bg-gradient-to-br from-[#58cc02] via-[#7c3aed] to-[#ff78ca] text-white"
                      : "border-slate-200 dark:border-slate-600 bg-gradient-to-br from-[#58cc02] via-[#7c3aed] to-[#ff78ca] text-white opacity-50 saturate-0"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-xs font-bold">SUPER</span>
                    <span className="material-symbols-outlined text-base">
                      check_circle
                    </span>
                  </div>
                  <div className="flex justify-center mb-1">
                    <span className="material-symbols-outlined text-4xl text-white/90">
                      bolt
                    </span>
                  </div>
                  <div className="text-sm font-bold">无限能量</div>
                  <div className="text-xs font-semibold opacity-90">
                    订阅 SUPER
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setEnergyRefillChoice("diamonds")}
                  disabled={getDiamonds(loadProgress()) < DIAMONDS_FOR_ENERGY_REFILL}
                  className={`flex-1 rounded-2xl p-4 border-2 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    energyRefillChoice === "diamonds"
                      ? "border-[#0ea5e9] bg-slate-100 dark:bg-slate-700 ring-2 ring-[#0ea5e9]/30"
                      : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 opacity-50"
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <span className="material-symbols-outlined text-3xl text-slate-400">
                      bolt
                    </span>
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300 ml-0.5">
                      +{MAX_ENERGY}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    恢复能量
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="material-symbols-outlined text-[14px]">
                      diamond
                    </span>
                    <span>{DIAMONDS_FOR_ENERGY_REFILL}</span>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (energyRefillChoice === "diamonds" && spendDiamondsForEnergyRefill()) {
                    setProgress(loadProgress());
                    setShowOutOfEnergyModal(false);
                  } else if (energyRefillChoice === "super") {
                    setShowOutOfEnergyModal(false);
                  }
                }}
                disabled={energyRefillChoice === "diamonds" && getDiamonds(loadProgress()) < DIAMONDS_FOR_ENERGY_REFILL}
                className="w-full py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#1990d8] text-white font-extrabold text-base uppercase tracking-wider mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {energyRefillChoice === "diamonds" ? (
                  <>
                    <span className="material-symbols-outlined text-xl">
                      diamond
                    </span>
                    <span>{DIAMONDS_FOR_ENERGY_REFILL}</span>
                  </>
                ) : (
                  "订阅 SUPER HELLOCODE"
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowOutOfEnergyModal(false)}
                className="w-full text-center text-[#1cb0f6] font-bold text-sm py-2"
              >
                关闭
              </button>
            </div>
          </div>
        </>
      )}

      {/* 底部 Tab 栏：仅主页 + 订阅页，选中项浅蓝底+蓝框 */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white dark:bg-[#111827]">
        <div className="mx-auto max-w-md flex items-center justify-around py-2">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 px-4 rounded-xl transition-colors text-gray-600 dark:text-gray-400 ${
              pathname === "/"
                ? "bg-[#e0f7ff] dark:bg-[#0c4a6e]/30 border-2 border-[#0ea5e9]"
                : "hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">home</span>
            <span className="text-xs font-medium">主页</span>
          </Link>

          <Link
            href="/subscribe"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 px-4 rounded-xl transition-colors text-gray-600 dark:text-gray-400 ${
              pathname === "/subscribe"
                ? "bg-[#e0f7ff] dark:bg-[#0c4a6e]/30 border-2 border-[#0ea5e9]"
                : "hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <Image
              src="/robot-mascot.svg"
              alt="订阅"
              width={28}
              height={28}
              className="object-contain"
              style={{ transform: "scaleX(-1) rotate(-8deg)" }}
            />
            <span className="text-xs font-medium">订阅</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}