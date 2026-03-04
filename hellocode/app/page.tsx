"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getStage1LessonById, parts, Part } from "@/app/course-data";
import {
  IconStar,
  IconTrophy,
  IconFlame,
  IconGem,
  IconBattery,
  IconZap,
  IconFileText,
  IconCheckCircle,
} from "@/app/components/icons";
import {
  TreasureChestReadyIcon,
  TreasureChestClaimedIcon,
} from "@/app/components/treasure-chest-icon";
import { ThreeStarChallengeEntry } from "@/app/components/three-star-challenge-entry";
import {
  PLAYS_TO_CLEAR,
  UserProgress,
  createInitialProgress,
  getDiamonds,
  getEnergy,
  getLessonPlays,
  loadProgress,
  getStreakDays,
  hasPlayedToday,
  hasClaimedPartChest,
  claimPartChest,
  ENERGY_COST_PER_QUESTION,
  CHALLENGE_ENERGY_COST,
  MAX_ENERGY,
  spendDiamondsForEnergyRefill,
  DIAMONDS_FOR_ENERGY_REFILL,
  getChallengeStarsForPart,
  hasSeenOnboarding,
  markOnboardingSeen,
  getPreferredLanguage,
  setPreferredLanguage,
  isSuperSubscribed,
} from "@/app/user-progress";
import { useGameSounds } from "@/app/hooks/useGameSounds";
import { NewUserOnboarding } from "@/app/components/NewUserOnboarding";
//
function LanguageIcon({ lang }: { lang: "c" | "java" | "python" }) {
  if (lang === "java") {
    return (
      <svg viewBox="0 0 1024 1024" className="w-[16px] h-[16px]" aria-hidden>
        <path
          d="M725.952 170.048c-29.248 20.096-56.704 38.4-87.808 62.208-23.744 18.24-65.792 45.696-67.648 78.592-3.648 53.056 78.656 102.4 34.752 170.048-16.448 25.6-43.904 36.608-78.592 53.056-3.712-7.296 9.088-14.656 14.592-21.952 54.848-78.656-56.704-104.256-42.048-201.152 14.656-96.896 124.352-128 226.752-140.8z"
          fill="#FF1515"
        />
        <path
          d="M563.2 0c16.448 16.448 29.248 47.552 29.248 78.656 0 96.896-102.4 151.744-151.744 215.744-11.008 14.656-25.6 36.544-25.6 60.352 0 52.992 54.848 111.552 74.944 153.6C457.152 486.4 415.104 455.296 384 420.48 354.752 384 323.648 327.296 351.104 276.096c40.192-74.944 162.688-120.64 206.592-201.152 11.008-20.096 20.096-51.2 5.504-74.944z"
          fill="#FF1515"
        />
      </svg>
    );
  }
  if (lang === "python") {
    return (
      <svg viewBox="0 0 1024 1024" className="w-[16px] h-[16px]" aria-hidden>
        <path
          d="M420.693333 85.333333C353.28 85.333333 298.666667 139.946667 298.666667 207.36v71.68h183.04c16.64 0 30.293333 24.32 30.293333 40.96H207.36C139.946667 320 85.333333 374.613333 85.333333 442.026667v161.322666c0 67.413333 54.613333 122.026667 122.026667 122.026667h50.346667v-114.346667c0-67.413333 54.186667-122.026667 121.6-122.026666h224c67.413333 0 122.026667-54.229333 122.026666-121.642667V207.36C725.333333 139.946667 670.72 85.333333 603.306667 85.333333z m-30.72 68.693334c17.066667 0 30.72 5.12 30.72 30.293333s-13.653333 38.016-30.72 38.016c-16.64 0-30.293333-12.8-30.293333-37.973333s13.653333-30.336 30.293333-30.336z"
          fill="#3C78AA"
        />
        <path
          d="M766.250667 298.666667v114.346666a121.6 121.6 0 0 1-121.6 121.984H420.693333A121.6 121.6 0 0 0 298.666667 656.597333v160a122.026667 122.026667 0 0 0 122.026666 122.026667h182.613334A122.026667 122.026667 0 0 0 725.333333 816.64v-71.68h-183.082666c-16.64 0-30.250667-24.32-30.250667-40.96h304.64A122.026667 122.026667 0 0 0 938.666667 581.973333v-161.28a122.026667 122.026667 0 0 0-122.026667-122.026666zM354.986667 491.221333l-0.170667 0.170667c0.512-0.085333 1.066667-0.042667 1.621333-0.170667z m279.04 310.442667c16.64 0 30.293333 12.8 30.293333 37.973333a30.293333 30.293333 0 0 1-30.293333 30.293334c-17.066667 0-30.72-5.12-30.72-30.293334s13.653333-37.973333 30.72-37.973333z"
          fill="#FDD835"
        />
      </svg>
    );
  }
  // C 语言
  return (
    <svg viewBox="0 0 1024 1024" className="w-[16px] h-[16px]" aria-hidden>
      <path
        d="M896 1024H128a128 128 0 0 1-128-128V128a128 128 0 0 1 128-128h768a128 128 0 0 1 128 128v768a128 128 0 0 1-128 128z m0-896H128v768h768z m-256 64a64 64 0 0 1 0 128c-33.92-5.76-5.76 0-64 0a175.36 175.36 0 0 0-192 192c0 168.96 90.24 192 192 192 60.16 0 7.04 7.68 64 0a64 64 0 0 1 0 128c-372.48 14.72-384-199.04-384-320-3.84-211.84 121.6-320 384-320z"
        fill="#1296db"
      />
    </svg>
  );
}

function LessonListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...props}
    >
      <path
        d="M851.2 0H288C211.2 0 153.6 57.6 153.6 134.4v19.2C89.6 166.4 44.8 224 44.8 294.4c0 44.8 19.2 83.2 51.2 108.8C64 428.8 44.8 467.2 44.8 512S64 595.2 96 620.8C64 646.4 44.8 684.8 44.8 729.6c0 70.4 44.8 121.6 108.8 140.8v19.2C153.6 960 211.2 1024 288 1024h563.2c70.4 0 134.4-57.6 134.4-134.4V134.4C979.2 57.6 921.6 0 851.2 0zM153.6 800c-25.6-12.8-44.8-38.4-44.8-70.4 0-32 19.2-57.6 44.8-70.4V800zm0-217.6C128 569.6 108.8 544 108.8 512c0-32 19.2-57.6 44.8-70.4v140.8zm0-224c-25.6-6.4-44.8-38.4-44.8-64 0-32 19.2-57.6 44.8-70.4v134.4zM812.8 793.6H352v-64h460.8v64zm0-230.4H352v-64h460.8v64zm0-268.8H352v-64h460.8v64z"
        fill="currentColor"
      />
    </svg>
  );
}

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
  const { plays, isUnlocked, isCleared } = computeLessonState(progress, lessonId);
  const isTrophy = indexInPart === part.lessonIds.length - 1;
  const baseColor = part.color;
  const grayBg = "#e5e5e5";
  const grayBorder = "#cfcfcf";

  // 仅“当前在学”的关卡（已解锁且未通关）展示 5 段圆弧；已学过的不展示圆弧
  const isCurrentLesson = isUnlocked && !isCleared;

  // 0~1 之间的进度（每关玩 PLAYS_TO_CLEAR 次，默认 5 次）
  const ratio = Math.min(1, plays / PLAYS_TO_CLEAR);
  const segments = 5; // 视觉上 5 段小弧
  const filledSegments = Math.round(ratio * segments);

  const iconColor = "#ffffff";
  const discLight = isUnlocked ? baseColor : grayBg;
  const discDark = isUnlocked ? "#46a302" : grayBorder;

  // 入口与圆弧统一尺寸；圆盘略扁椭圆，整体更圆一些
  const nodeSize = 110;
  const discWidth = 76;
  const discHeight = 72;
  const center = nodeSize / 2; // 55
  const arcRadius = 42; // 圆弧包在椭圆外一圈
  const arcStrokeWidth = 6;
  const segDeg = 43;

  // 圆弧路径：与入口同 viewBox、同中心，取整避免 hydration 差异
  const arcPaths = Array.from({ length: segments }).map((_, i) => {
    const startAngle = ((-90 + i * 72) * Math.PI) / 180;
    const endAngle = ((-90 + i * 72 + segDeg) * Math.PI) / 180;
    const x1 = Number((center + arcRadius * Math.cos(startAngle)).toFixed(2));
    const y1 = Number((center + arcRadius * Math.sin(startAngle)).toFixed(2));
    const x2 = Number((center + arcRadius * Math.cos(endAngle)).toFixed(2));
    const y2 = Number((center + arcRadius * Math.sin(endAngle)).toFixed(2));
    const fill = i < filledSegments ? baseColor : grayBg;
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
      style={{ width: nodeSize, height: nodeSize }}
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
      <div className="relative flex items-center justify-center" style={{ width: nodeSize, height: nodeSize }}>
        {/* 5 段圆弧：与入口同尺寸同中心，仅当前在学关卡显示，带扩散收缩动效 */}
        {isCurrentLesson && (
          <div
            className="absolute inset-0 flex items-center justify-center animate-arc-pulse"
            style={{ width: nodeSize, height: nodeSize }}
            aria-hidden
          >
            <svg
              viewBox={`0 0 ${nodeSize} ${nodeSize}`}
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              suppressHydrationWarning
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
          </div>
        )}
        {/* 中间实心椭圆盘：更圆 + 阴影面积更小 + 两条宽高光从右上到左下穿过 */}
        <div
          className="relative rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: discWidth,
            height: discHeight,
            background: isUnlocked ? discLight : grayBg,
            borderBottom: isUnlocked ? `3px solid ${discDark}` : `3px solid ${grayBorder}`,
            boxShadow: isUnlocked ? `0 3px 0 ${discDark}` : "0 3px 0 rgba(148,163,184,0.6)",
          }}
        >
          {/* 两条很宽的高光：比按钮绿淡一些（非白），从右上角到左下角穿过 */}
          {isUnlocked && (
            <>
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "50%",
                  left: "50%",
                  width: "145%",
                  height: 12,
                  marginLeft: "-72.5%",
                  marginTop: -6,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 20%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.2) 80%, transparent 100%)",
                  transform: "rotate(-45deg)",
                  transformOrigin: "center center",
                }}
              />
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "50%",
                  left: "50%",
                  width: "145%",
                  height: 12,
                  marginLeft: "-72.5%",
                  marginTop: -6,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.14) 75%, transparent 100%)",
                  transform: "translateY(-38px) rotate(-45deg)",
                  transformOrigin: "center center",
                }}
              />
            </>
          )}
          {isTrophy ? (
            <IconTrophy className="w-[34px] h-[34px]" style={{ color: iconColor }} />
          ) : (
            <IconStar className="w-[34px] h-[34px]" style={{ color: iconColor }} />
          )}
        </div>
      </div>
    </button>
  );
}

/** 部分中间的宝箱节点：未解锁=灰白不可点；解锁未领=彩色可点；已领取=彩色+动效 */
function TreasureChestNode({
  part,
  progress,
  isUnlockable,
  onClaim,
}: {
  part: Part;
  progress: UserProgress;
  isUnlockable: boolean;
  onClaim: () => void;
}) {
  const [justClaimed, setJustClaimed] = useState(false);
  const claimed = hasClaimedPartChest(progress, part.id);
  const canClick = isUnlockable && !claimed;
  const isLocked = !isUnlockable;

  // 普通关卡外圈是 96px，这里放大到 1.2 倍
  const sizePx = 96 * 1.2;
  const sizeStyle = { width: sizePx, height: sizePx };

  const chestSizeClass = "w-[115px] h-[115px]";

  let ChestIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  if (claimed || justClaimed) {
    ChestIcon = TreasureChestClaimedIcon;
  } else {
    ChestIcon = TreasureChestReadyIcon;
  }

  return (
    <div className="flex justify-center">
      <button
        type="button"
        disabled={!canClick}
        aria-label={isLocked ? "完成前面关卡后可领取" : claimed ? "已领取" : "领取钻石"}
        onClick={() => {
          if (!canClick) return;
          if (claimPartChest(part.id)) {
            setJustClaimed(true);
            onClaim();
            setTimeout(() => setJustClaimed(false), 1500);
          }
        }}
        className={`relative inline-flex items-center justify-center transition-transform ${
          canClick ? "cursor-pointer" : "cursor-default"
        } bg-transparent border-none shadow-none p-0`}
        style={sizeStyle}
      >
        <ChestIcon
          className={`${chestSizeClass} transition-transform duration-300 ${
            isLocked ? "grayscale opacity-60" : ""
          } ${justClaimed ? "animate-chest-claim" : ""}`}
        />
      </button>
    </div>
  );
}

/** 宝箱是否可点击：只有宝箱之前的关卡全部通关后才可领取 */
function isPartChestUnlockable(progress: UserProgress, part: Part): boolean {
  const ids = part.lessonIds;
  const mid = Math.floor(ids.length / 2);
  return ids
    .slice(0, mid)
    .every((lessonId) => getLessonPlays(progress, lessonId) >= PLAYS_TO_CLEAR);
}

/** 将某部分的关卡列表变为「前半 + 宝箱 + 后半」的路径节点（中间插宝箱） */
type PathNode =
  | { type: "lesson"; lessonId: string; indexInPart: number }
  | { type: "chest"; partId: string };

function getPartPathNodes(part: Part): PathNode[] {
  const ids = part.lessonIds;
  const mid = Math.floor(ids.length / 2);
  const nodes: PathNode[] = [];
  for (let i = 0; i < mid; i++) {
    nodes.push({ type: "lesson", lessonId: ids[i], indexInPart: i });
  }
  nodes.push({ type: "chest", partId: part.id });
  for (let i = mid; i < ids.length; i++) {
    nodes.push({ type: "lesson", lessonId: ids[i], indexInPart: i });
  }
  return nodes;
}

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress>(createInitialProgress());
  const [showOutOfEnergyModal, setShowOutOfEnergyModal] = useState(false);
  const [energyRefillChoice, setEnergyRefillChoice] = useState<"super" | "diamonds">("super");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [popupAnchor, setPopupAnchor] = useState<{ centerX: number; bottom: number } | null>(
    null
  );
  const prevProgressRef = useRef<UserProgress | null>(null);
  const { playStar } = useGameSounds();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    const id = setTimeout(() => {
      const latest = loadProgress();
      setProgress(latest);
      if (!hasSeenOnboarding(latest)) {
        setShowOnboarding(true);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  // 回到首页时，如果某个部分的挑战星星数量较上一次有提升，播放一次星星音效
  useEffect(() => {
    if (pathname !== "/") return;
    const prev = prevProgressRef.current;
    if (!prev) {
      prevProgressRef.current = progress;
      return;
    }
    let hasStarIncreased = false;
    for (const part of parts) {
      const before = getChallengeStarsForPart(prev, part.id);
      const now = getChallengeStarsForPart(progress, part.id);
      if (now > before) {
        hasStarIncreased = true;
        break;
      }
    }
    prevProgressRef.current = progress;
    if (hasStarIncreased) {
      playStar();
    }
  }, [pathname, progress, playStar]);

  const selectedPart = selectedPartId
    ? parts.find((p) => p.id === selectedPartId) ?? null
    : null;
  const selectedLesson = selectedLessonId ? getStage1LessonById(selectedLessonId) : undefined;
  const selectedState =
    selectedLessonId != null ? computeLessonState(progress, selectedLessonId) : null;
  const isReview = Boolean(selectedState?.isCleared);
  const rewardXp = selectedLessonId ? (isReview ? 15 : 20) : 0;
  const unitIndex = selectedState ? Math.min(selectedState.plays + 1, PLAYS_TO_CLEAR) : 1;
  const preferredLang = getPreferredLanguage(progress);

  return (
    <div className="h-screen bg-[#f5f7fb] text-[#3c3c3c] dark:bg-[#131f24] dark:text-slate-100 flex flex-col overflow-hidden">
      {/* 顶部状态栏（固定） */}
      <header className="fixed left-0 right-0 z-20 bg-white dark:bg-[#111827] pt-safe">
        <div className="mx-auto max-w-md px-3 pb-2">
          {/* 顶部统计条：白色半透明底，无圆形胶囊边框 */}
          <div className="h-9 bg-white/80 dark:bg-[#111827]/90 flex items-center px-3 gap-4 text-[13px] font-semibold">
            {/* 语言等级 */}
            <div className="flex-1 flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center rounded-md bg-[#e5f5ff] px-1.5 py-0.5 shadow-sm">
                <LanguageIcon lang={preferredLang} />
              </span>
              <span className="ml-0.5 text-[16px] font-extrabold leading-none">1</span>
            </div>

            {/* 连胜火焰 */}
            <div
              className={`flex-1 flex items-center justify-center gap-1.5 ${
                hasPlayedToday(progress) ? "text-[#FF9800]" : "text-gray-400"
              }`}
            >
              <IconFlame className="w-[18px] h-[18px]" />
              <span className="text-[16px] font-extrabold leading-none">
                {getStreakDays(progress)}
              </span>
            </div>

            {/* 钻石 */}
            <div className="flex-1 flex items-center justify-center gap-1.5 text-[#1cb0f6]">
              <IconGem className="w-[18px] h-[18px]" />
              <span className="text-[16px] font-extrabold leading-none">
                {getDiamonds(progress)}
              </span>
            </div>

            {/* 能量 */}
            <div className="flex-1 flex items-center justify-end gap-1.5 text-[#ff78ca]">
              <IconBattery className="w-[17px] h-[17px] text-[#ff78ca]" />
              <span className="text-[16px] font-extrabold leading-none">
                {isSuperSubscribed(progress) ? "MAX" : getEnergy(progress)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 中间可滚动区域（隐藏原生滚动条） */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto max-w-md px-4 pt-[80px] pb-[96px] bg-white">
          {parts.map((part, partIndex) => (
            <section key={part.id} className="mb-8">
              {/* 部分卡片：第 1 阶段 · 第 X 部分，下方为标题 */}
              <div
                className="relative text-white rounded-3xl px-5 py-4 mb-4 flex items-center justify-between"
                style={{
                  backgroundColor: part.color,
                  boxShadow: "0 4px 0 #46a302",
                }}
              >
                <div className="leading-snug min-w-0 flex-1">
                  <div className="text-[14px] font-extrabold text-white/95">
                    第 1 阶段 · 第 {partIndex + 1} 部分
                  </div>
                  <div className="mt-1 text-[18px] font-extrabold text-white leading-snug">
                    {part.title}
                  </div>
                </div>
                <div className="ml-4 h-full flex items-center pl-4 border-l-2 border-[#46a302]">
                  <button className="w-9 h-9 flex-shrink-0 rounded-2xl bg-black/10 flex items-center justify-center shadow-inner">
                    <LessonListIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* 路线节点：前半关卡 + 中间宝箱 + 后半关卡 */}
              <div className="space-y-5">
                {getPartPathNodes(part).map((node, idx) => {
                  const rowOffsetClass = idx % 2 === 0 ? "-translate-x-6" : "translate-x-6";
                  const isLeftRow = idx % 2 === 0;
                  if (node.type === "lesson") {
                    return (
                      <div
                        key={node.lessonId}
                        className={`flex justify-center ${rowOffsetClass}`}
                      >
                        <CheckpointNode
                          lessonId={node.lessonId}
                          part={part}
                          indexInPart={node.indexInPart}
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
                    );
                  }

                  // 宝箱行：确保宝箱落在蛇形路径的延长线上，挑战关卡在另一侧对称位置
                  const challengeStars = getChallengeStarsForPart(progress, part.id);
                  const isChallengeMaxed = challengeStars >= 3;
                  return (
                    <div
                      key={`chest-${node.partId}`}
                      className="relative h-32 w-full flex items-center justify-center"
                    >
                      {/* 容器限制宽度，方便做左右对称 */}
                      <div className="relative w-full max-w-[280px] h-full">
                        {/* 宝箱：根据当前行的奇偶决定位置（与蛇形方向对称） */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ${
                            isLeftRow ? "right-0 translate-x-8" : "left-0 -translate-x-8"
                          }`}
                        >
                          <TreasureChestNode
                            part={part}
                            progress={progress}
                            isUnlockable={isPartChestUnlockable(progress, part)}
                            onClaim={() => setTimeout(() => setProgress(loadProgress()), 0)}
                          />
                          {/* 宝箱下方的文字标签（可选） */}
                          {/* <div className="text-center text-[11px] font-bold text-slate-400 mt-[-10px]">
                            阶段奖赏
                          </div> */}
                        </div>

                        {/* 三星挑战：永远在宝箱的对面 */}
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ${
                            isLeftRow ? "left-0 -translate-x-8" : "right-0 translate-x-8"
                          }`}
                        >
                          <ThreeStarChallengeEntry
                            partId={part.id}
                            animationIndex={partIndex + 1}
                            stars={challengeStars}
                            disabled={isChallengeMaxed}
                            onClick={() => {
                              const latest = loadProgress();
                              const energy = getEnergy(latest);
                              if (energy < CHALLENGE_ENERGY_COST) {
                                setEnergyRefillChoice("super");
                                setShowOutOfEnergyModal(true);
                                return;
                              }
                              router.push(`/challenge/${part.id}`);
                            }}
                          />
                          {/* <div className="text-center text-[11px] font-bold text-amber-500 mt-[-2px]">
                            限时挑战
                          </div> */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* 新手引导：选科目（仅新用户第一次进入首页时弹出） */}
      {showOnboarding && (
        <NewUserOnboarding
          onDone={(lang) => {
            markOnboardingSeen();
            setPreferredLanguage(lang);
            setShowOnboarding(false);
            // 完成新手引导后，直接进入第 1 部分第 1 单元，附带语言参数
            if (parts.length > 0 && parts[0].lessonIds.length > 0) {
              const firstLessonId = parts[0].lessonIds[0];
              const url = `/lesson/${firstLessonId}?mode=learn&rewardXp=20&unit=1&lang=${lang}`;
              router.push(url);
            }
          }}
        />
      )}

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
                  const url = `/lesson/${selectedLessonId}?mode=${mode}&rewardXp=${rewardXp}&unit=${unitIndex}&lang=${preferredLang}`;
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
      {showOutOfEnergyModal && !isSuperSubscribed(loadProgress()) && (
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
                  <IconGem className="w-5 h-5 text-[#1cb0f6]" />
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
                    <IconCheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex justify-center mb-1">
                    <IconZap className="w-10 h-10 text-white/90" />
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
                    <IconZap className="w-8 h-8 text-slate-400" />
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-300 ml-0.5">
                      +{MAX_ENERGY}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    恢复能量
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <IconGem className="w-3.5 h-3.5" />
                    <span>{DIAMONDS_FOR_ENERGY_REFILL}</span>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (
                    energyRefillChoice === "diamonds" &&
                    spendDiamondsForEnergyRefill()
                  ) {
                    setProgress(loadProgress());
                    setShowOutOfEnergyModal(false);
                  } else if (energyRefillChoice === "super") {
                    // 主页能量用尽时，引导到订阅页，由订阅页发起真正的内购
                    setShowOutOfEnergyModal(false);
                    window.location.href = "/subscribe";
                  }
                }}
                disabled={
                  energyRefillChoice === "diamonds" &&
                  getDiamonds(loadProgress()) < DIAMONDS_FOR_ENERGY_REFILL
                }
                className="w-full py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#1990d8] text-white font-extrabold text-base uppercase tracking-wider mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {energyRefillChoice === "diamonds" ? (
                  <>
                    <IconGem className="w-5 h-5" />
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
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white dark:bg-[#111827] safe-area-pb">
        <div className="mx-auto max-w-md flex items-center justify-around py-2">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 px-4 rounded-xl transition-colors text-gray-600 dark:text-gray-400 ${
              pathname === "/"
                ? "bg-[#e0f7ff] dark:bg-[#0c4a6e]/30 border-2 border-[#0ea5e9]"
                : "hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <svg className="w-[32px] h-[32px]" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M206.7 705.9v145.6c0 49.8 40.4 90.2 90.2 90.2h375.3V612.4c0-31.1 25.4-56.5 56.5-56.5s56.5 25.4 56.5 56.5v329.3h35.1c49.8 0 90.2-40.4 90.2-90.2V552.1c47.1 0 69.4-58 34.5-89.6L615.5 164.2c-32.3-29.2-81.5-29.2-113.8 0L172.2 462.5c-34.9 31.6-12.5 89.6 34.5 89.6v58.2" fill="#FF7801" />
              <path d="M750.9 957.4h-55.1V608.1c0-20.1-16.4-36.5-36.5-36.5s-36.5 16.4-36.5 36.5v349.3H227.6c-60.8 0-110.2-49.4-110.2-110.2V701.6c0-11 9-20 20-20s20 9 20 20v145.6c0 38.7 31.5 70.2 70.2 70.2h355.3V608.1c0-42.2 34.3-76.5 76.5-76.5s76.5 34.3 76.5 76.5v309.3H751c38.7 0 70.2-31.5 70.2-70.2V527.9h20c20 0 27.5-15.4 29.3-20.1 1.8-4.7 6.6-21.2-8.2-34.6L532.7 174.8a64.717 64.717 0 0 0-87 0L116.3 473.1c-14.8 13.4-10.1 29.9-8.2 34.6 1.8 4.7 9.3 20.1 29.3 20.1h20V606c0 11-9 20-20 20s-20-9-20-20v-41c-21.1-6-38.4-21.6-46.7-42.9-10.7-27.8-3.4-58.7 18.7-78.7l329.5-298.3c19.3-17.5 44.3-27.1 70.3-27.1s51 9.6 70.3 27.1L889 443.4c22.1 20 29.4 50.9 18.7 78.7-8.2 21.3-25.6 36.9-46.7 42.9v282.2c0.1 60.8-49.3 110.2-110.1 110.2z" fill="currentColor" />
              <path d="M284 703.9c-11 0-20-9-20-20V569.7c0-11 9-20 20-20s20 9 20 20v114.2c0 11-8.9 20-20 20z" fill="#FBFFFD" />
              <path d="M261.2 731.8a22.8 21.1 0 1 0 45.6 0 22.8 21.1 0 1 0-45.6 0Z" fill="#FBFFFD" />
              <path d="M171.4 198.2m-27.2 0a27.2 27.2 0 1 0 54.4 0 27.2 27.2 0 1 0-54.4 0Z" fill="#FF7801" />
              <path d="M230.2 151m-17.7 0a111 0-20-9-20-20s9-20 20-20h103.7c11 0 20 9 20 20s-9 20-20.1 20z" fill="#FF7801" />
              <path d="M887.1 264.8c-11 0-20-9-20-20V138c0-11 9-20 20-20s20 9 20 20v106.8c0 11.1-9 20-20 20z" fill="#FF7801" />
            </svg>
          </Link>

          <Link
            href="/subscribe"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 px-4 rounded-xl transition-colors text-gray-600 dark:text-gray-400 ${
              pathname === "/subscribe"
                ? "bg-[#e0f7ff] dark:bg-[#0c4a6e]/30 border-2 border-[#0ea5e9]"
                : "hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <svg className="w-[32px] h-[32px]" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M232.1 863.5H806l85.9-458.7-225 153L519 175.5 374 557.2 147.8 404.8z" fill="#FFC500" />
              <path d="M519.4 287.2l110.2 285 18.2 47 41.6-28.3 145.5-99-62.1 331.6H265.4l-61.1-332.4 147.2 99.2 41.8 28.2 17.9-47.1 108.2-284.2m-0.4-111.7L374 557.2 147.8 404.8l84.3 458.7H806l85.9-458.7-225 153.1L519 175.5z" fill="#D8A001" />
              <path d="M519.9 115.1m-53.2 0a53.2 53.2 0 1 0 106.4 0 53.2 53.2 0 1 0-106.4 0Z" fill="#D8A001" />
              <path d="M904.4 369.1m-35.6 0a35.6 35.6 0 1 0 71.2 0 35.6 35.6 0 1 0-71.2 0Z" fill="#D8A001" />
              <path d="M136.9 369.1m-35.6 0a35.6 35.6 0 1 0 71.2 0 35.6 35.6 0 1 0-71.2 0Z" fill="#D8A001" />
              <path d="M288.1 925.6H747" fill="#FFC500" />
              <path d="M747 945.6H288.1c-11 0-20-9-20-20s9-20 20-20H747c11 0 20 9 20 20s-9 20-20 20z" fill="#D8A001" />
            </svg>
          </Link>
        </div>
      </nav>
    </div>
  );
}