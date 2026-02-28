"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getQuestionsForLesson, getStage1LessonById, Question, SortQuestion } from "@/app/course-data";
import {
  addDiamonds,
  addXP,
  deductEnergy,
  getDiamonds,
  getEnergy,
  ENERGY_COST_PER_QUESTION,
  incrementLessonPlays,
  loadProgress,
  MAX_ENERGY,
  recordLessonCompletion,
  recordWrongQuestion,
  spendDiamondsForEnergyRefill,
  DIAMONDS_FOR_ENERGY_REFILL,
  getStreakDays,
  getCompletedDaysForWeek,
  shouldShowStreakPopupToday,
  markStreakPopupShown,
} from "@/app/user-progress";

type CheckState = "idle" | "correct" | "wrong";

const POSITIVE_MESSAGES: string[] = [
  "这一题拿下得太漂亮了！",
  "完全正确，你已经掌握这个知识点了。",
  "思路很清晰，就该这么写代码。",
  "干得好，继续保持这个状态。",
];

const NEGATIVE_MESSAGES_INCOMPLETE: string[] = [
  "先把每个空都填上试试，不怕错。",
  "还差一点点，再补全所有空位就更清楚了。",
  "别急，把代码写完整，我们一步步来看。",
];

const NEGATIVE_MESSAGES_WRONG: string[] = [
  "这次不太对，不过已经很接近了，再试一次。",
  "试着检查一下字符串和引号，肯定能做好。",
  "换个角度想想，你一定能找出正确答案。",
];

const pickRandom = (list: string[]): string =>
  list[Math.floor(Math.random() * list.length)];

/** 排序题专用 UI（避免在条件分支内调用 Hooks） */
function OrderQuestionUI({
  question,
  lesson,
  onCorrect,
  onWrong,
  onContinue,
}: {
  question: import("@/app/course-data").OrderQuestion;
  lesson: import("@/app/course-data").Lesson;
  onCorrect: () => void;
  onWrong: () => void;
  onContinue: () => void;
}) {
  const [orderIds, setOrderIds] = useState<string[]>(() =>
    question.fragments.map((f) => f.id)
  );
  const [localCheckState, setLocalCheckState] = useState<CheckState>("idle");
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...orderIds];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrderIds(newOrder);
  };
  const moveDown = (index: number) => {
    if (index >= orderIds.length - 1) return;
    const newOrder = [...orderIds];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrderIds(newOrder);
  };
  const handleOrderCheck = () => {
    const correctOrder = question.correctOrder;
    const userOrder = orderIds.slice(0, correctOrder.length);
    const isCorrect =
      userOrder.length === correctOrder.length &&
      userOrder.every((id, i) => id === correctOrder[i]);
    if (isCorrect) {
      onCorrect();
      setLocalCheckState("correct");
      setLocalMessage(pickRandom(POSITIVE_MESSAGES));
    } else {
      onWrong();
      setLocalCheckState("wrong");
      setLocalMessage(pickRandom(NEGATIVE_MESSAGES_WRONG));
    }
  };
  return (
    <>
      <div className="flex-1 flex flex-col px-5 pb-32 overflow-y-auto no-scrollbar">
        <div className="mt-4 mb-1">
          <p className="text-xs text-slate-400 mb-1">
            第 1 阶段 · 第 {lesson.id} 部分
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
            {question.title}
          </h1>
        </div>
        <div className="flex items-end gap-4 mb-4">
          <div className="shrink-0 w-24 h-24 relative">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg border-b-4 border-sky-700 flex items-center justify-center">
              <img
                alt="练习助手机器人"
                className="w-16 h-16"
                src="/robot-mascot.svg"
              />
            </div>
          </div>
          <div className="relative p-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 mb-4 shadow-sm">
            <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
              {question.helperText ?? "点击上移/下移调整顺序！"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full">
          {orderIds.map((fragmentId, index) => {
            const fragment = question.fragments.find((f) => f.id === fragmentId);
            if (!fragment) return null;
            return (
              <div
                key={fragment.id}
                className="flex items-center justify-between gap-2 p-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-b-4 rounded-2xl shadow-sm"
              >
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200 font-mono flex-1">
                  {fragment.label}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600"
                    aria-label="上移"
                  >
                    <span className="material-symbols-outlined text-lg">
                      arrow_upward
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === orderIds.length - 1}
                    className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-600"
                    aria-label="下移"
                  >
                    <span className="material-symbols-outlined text-lg">
                      arrow_downward
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {localCheckState === "idle" ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1a2632] border-t-2 border-slate-100 dark:border-slate-800">
            <div className="flex justify-center items-center">
              <button
                type="button"
                onClick={handleOrderCheck}
                className="w-full bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 shadow-lg transition-all"
              >
                检查
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 right-0">
            <div
              className={`px-4 pt-4 pb-6 rounded-t-3xl shadow-lg flex flex-col gap-4 ${
                localCheckState === "correct"
                  ? "bg-[#d7ffb8] text-[#225500]"
                  : "bg-[#fee2e2] text-[#b91c1c]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">
                  {localCheckState === "correct" ? "check_circle" : "cancel"}
                </span>
                <span className="font-extrabold text-base">
                  {localCheckState === "correct" ? "真棒！" : "不太对"}
                </span>
              </div>
              {localMessage && (
                <p className="text-sm font-semibold leading-snug">
                  {localMessage}
                </p>
              )}
              <button
                type="button"
                onClick={onContinue}
                className="w-full font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 shadow-lg transition-all bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302]"
              >
                继续
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams<{ lessonId: string }>();
  const lessonId = params.lessonId;
  const lesson = getStage1LessonById(lessonId);

  const allQuestions: Question[] = useMemo(
    () => getQuestionsForLesson(lessonId),
    [lessonId]
  );

  const [startTimestamp] = useState(() => Date.now());
  const [roundQuestionIds, setRoundQuestionIds] = useState<string[]>(() =>
    allQuestions.map((q) => q.id)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestionId = roundQuestionIds[currentIndex];
  const question = useMemo(
    () => allQuestions.find((q) => q.id === currentQuestionId),
    [allQuestions, currentQuestionId]
  );

  // 本小关本次练习里，已经做对过的题（用于进度条，不会因为重刷错题而清零）
  const [masteredQuestionIds, setMasteredQuestionIds] = useState<string[]>([]);
  const [hasWrongInRound, setHasWrongInRound] = useState(false);
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [wrongRoundQuestionIds, setWrongRoundQuestionIds] = useState<string[]>([]);
  const [isFirstRound, setIsFirstRound] = useState(true);
  const [firstRoundWrongIds, setFirstRoundWrongIds] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);
  const [isRetryWrongRound, setIsRetryWrongRound] = useState(false);
  const [energy, setEnergy] = useState(20);
  const [showOutOfEnergyModal, setShowOutOfEnergyModal] = useState(false);
  const [energyRefillChoice, setEnergyRefillChoice] = useState<"super" | "diamonds">("super");
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [showSubscriptionOffer, setShowSubscriptionOffer] = useState(false);
  const [showDiamondClaim, setShowDiamondClaim] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [diamondDisplayCount, setDiamondDisplayCount] = useState(0);
  const diamondClaimInitialRef = useRef<number>(0);
  const searchParams = useSearchParams();
  const sessionMode = searchParams.get("mode") === "review" ? "review" : "learn";
  const DIAMONDS_REWARD = 15;

  useEffect(() => {
    if (!showDiamondClaim) return;
    diamondClaimInitialRef.current = getDiamonds(loadProgress());
    const t = setTimeout(() => {
      setDiamondDisplayCount(diamondClaimInitialRef.current + DIAMONDS_REWARD);
    }, 1000);
    return () => clearTimeout(t);
  }, [showDiamondClaim]);

  const blankIds = useMemo(
    () =>
      question && question.type === "sort" && "codeTemplate" in question
        ? question.codeTemplate
            .filter((p): p is { type: "blank"; id: string } => p.type === "blank")
            .map((p) => p.id)
        : [],
    [question]
  );

  const [filled, setFilled] = useState<Record<string, string | null>>(
    Object.fromEntries(blankIds.map((id) => [id, null]))
  );
  const [usedOptions, setUsedOptions] = useState<Record<string, string | null>>({});
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // 切换小关时，重置一轮练习；并同步能量
  useEffect(() => {
    setRoundQuestionIds(allQuestions.map((q) => q.id));
    setCurrentIndex(0);
    setMasteredQuestionIds([]);
    setHasWrongInRound(false);
    setShowReviewScreen(false);
    setShowResultScreen(false);
    setWrongRoundQuestionIds([]);
    setIsFirstRound(true);
    setFirstRoundWrongIds([]);
    setElapsedSeconds(null);
    setIsRetryWrongRound(false);
    setEnergy(getEnergy(loadProgress()));
  }, [lessonId, allQuestions]);

  const handleOptionClick = (optionId: string) => {
    setCheckState("idle");
    setMessage(null);

    const usedByBlankId = usedOptions[optionId];
    if (usedByBlankId) {
      // 再点一次，同步清除对应的空
      setFilled((prev) => ({ ...prev, [usedByBlankId]: null }));
      setUsedOptions((prev) => ({ ...prev, [optionId]: null }));
      return;
    }

    const targetBlankId = blankIds.find((id) => !filled[id]);
    if (!targetBlankId) return;

    setFilled((prev) => ({ ...prev, [targetBlankId]: optionId }));
    setUsedOptions((prev) => ({ ...prev, [optionId]: targetBlankId }));
  };

  const handleBlankClick = (blankId: string) => {
    setCheckState("idle");
    setMessage(null);

    const optionId = filled[blankId];
    if (!optionId) return;

    setFilled((prev) => ({ ...prev, [blankId]: null }));
    setUsedOptions((prev) => ({ ...prev, [optionId]: null }));
  };

  // 排序题「继续」逻辑（与填空题共用同一套：扣能量、下一题/结算）
  const handleOrderContinue = () => {
    const isLastQuestion = currentIndex === totalQuestions - 1;
    const willGoToPerfectResult =
      checkState === "correct" && isLastQuestion && !hasWrongInRound;
    if (!isRetryWrongRound && ENERGY_COST_PER_QUESTION > 0) {
      const current = getEnergy(loadProgress());
      if (current < ENERGY_COST_PER_QUESTION) {
        setEnergyRefillChoice("super");
        setShowOutOfEnergyModal(true);
        return;
      }
      deductEnergy(ENERGY_COST_PER_QUESTION);
      const next = getEnergy(loadProgress());
      setEnergy(next);
      if (next === 0 && !willGoToPerfectResult) {
        setEnergyRefillChoice("super");
        setShowOutOfEnergyModal(true);
      }
    }
    if (checkState === "correct") {
      setMasteredQuestionIds((prev) =>
        question && !prev.includes(question.id) ? [...prev, question.id] : prev
      );
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        if (hasWrongInRound) {
          setShowReviewScreen(true);
        } else {
          incrementLessonPlays(lessonId);
          setElapsedSeconds(
            Math.max(1, Math.round((Date.now() - startTimestamp) / 1000))
          );
          setShowResultScreen(true);
        }
      }
    } else {
      recordWrongQuestion(lessonId, question!.id);
      if (currentIndex === totalQuestions - 1) {
        setShowReviewScreen(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleCheck = () => {
    if (!question || question.type !== "sort" || !("correctByBlank" in question)) return;
    const sortQuestion = question as SortQuestion;
    if (blankIds.some((id) => !filled[id])) {
      setCheckState("wrong");
      setMessage(pickRandom(NEGATIVE_MESSAGES_INCOMPLETE));
      return;
    }

    let allCorrect = true;
    for (const blankId of blankIds) {
      const selected = filled[blankId];
      const correct = sortQuestion.correctByBlank[blankId];
      if (!selected || !correct) {
        allCorrect = false;
        break;
      }
      if (Array.isArray(correct)) {
        if (!correct.includes(selected)) {
          allCorrect = false;
          break;
        }
      } else if (selected !== correct) {
        allCorrect = false;
        break;
      }
    }

    if (!allCorrect) {
      setHasWrongInRound(true);
      setWrongRoundQuestionIds((prev) =>
        question && !prev.includes(question.id) ? [...prev, question.id] : prev
      );
      if (isFirstRound) {
        setFirstRoundWrongIds((prev) =>
          question && !prev.includes(question.id) ? [...prev, question.id] : prev
        );
      }
      setCheckState("wrong");
      setMessage(pickRandom(NEGATIVE_MESSAGES_WRONG));
      return;
    }

    setCheckState("correct");
    setMessage(pickRandom(POSITIVE_MESSAGES));
  };

  const totalQuestions = roundQuestionIds.length || 1;
  const progressPercent = Math.max(
    8,
    Math.min(
      100,
      (masteredQuestionIds.length / Math.max(1, allQuestions.length)) * 100
    )
  );

  const firstRoundTotal = allQuestions.length || 1;
  const firstRoundWrongCount = Math.min(
    firstRoundTotal,
    firstRoundWrongIds.length
  );
  const firstRoundCorrectCount = Math.max(
    0,
    Math.min(firstRoundTotal, firstRoundTotal - firstRoundWrongCount)
  );
  const firstRoundAccuracyPercent =
    firstRoundTotal === 0
      ? 100
      : Math.round((firstRoundCorrectCount / firstRoundTotal) * 100);

  // 经验值算法：基础 10 XP + 每道首轮做对题目 5 XP - 每道首轮做错题目 2 XP，最低 5 XP
  const baseXP = 10;
  const perCorrectXP = 5;
  const penaltyPerWrongXP = 2;
  let computedXP =
    baseXP +
    firstRoundCorrectCount * perCorrectXP -
    firstRoundWrongCount * penaltyPerWrongXP;
  if (computedXP < 5) computedXP = 5;

  const totalElapsedSeconds = elapsedSeconds ?? 0;
  const elapsedMinutes = Math.floor(totalElapsedSeconds / 60);
  const elapsedRemainSeconds = totalElapsedSeconds % 60;
  const formattedElapsedTime =
    elapsedMinutes > 0
      ? `${elapsedMinutes}:${elapsedRemainSeconds
          .toString()
          .padStart(2, "0")}`
      : `0:${elapsedRemainSeconds.toString().padStart(2, "0")}`;

  // 当切换到新题目时，重置本题的作答状态
  useEffect(() => {
    setFilled(Object.fromEntries(blankIds.map((id) => [id, null])));
    setUsedOptions({});
    setCheckState("idle");
    setMessage(null);
  }, [currentQuestionId, blankIds]);

  // 兜底：如果本关没有配置题目
  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-slate-100">
        <p className="text-lg font-semibold">该关卡暂未配置题目</p>
      </div>
    );
  }
  if (question.type !== "sort" && question.type !== "order") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-slate-100">
        <p className="text-lg font-semibold">该关卡暂未配置题目</p>
      </div>
    );
  }

  // 兜底：如果 lesson 找不到，就显示不存在
  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f8] dark:bg-[#101922] text-slate-900 dark:text-slate-100">
        <p className="text-lg font-semibold">该关卡不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f8] dark:bg-[#101922] font-sans text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden flex items-center justify-center">
      <div className="mx-auto max-w-md w-full min-h-screen relative flex flex-col shadow-2xl bg-white dark:bg-[#1a2632] overflow-hidden">
        {/* 顶部进度条和能量值（结算页不展示） */}
        {!showResultScreen && (
          <div className="px-5 pt-6 pb-2 w-full z-10 bg-white dark:bg-[#1a2632]">
            <div className="flex items-center gap-4">
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowExitConfirmModal(true)}
                type="button"
              >
                <span className="material-symbols-outlined text-3xl font-bold">
                  close
                </span>
              </button>

              <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-[#58cc02] shadow-[0_2px_0_rgba(0,0,0,0.2)_inset] transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute top-0.5 right-2 w-4 h-1.5 bg-white/40 rounded-full" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[#ff78ca]">
                <div className="relative w-8 h-5 bg-[#ff78ca] rounded-[4px] flex items-center justify-center after:content-[''] after:absolute after:-right-[2px] after:w-[2px] after:h-2 after:bg-[#ff78ca] after:rounded-r-sm">
                  <span className="material-symbols-outlined text-white text-[14px] font-bold fill-1">
                    bolt
                  </span>
                  <div className="absolute top-0.5 left-0.5 w-[60%] h-[3px] bg-white/30 rounded-full" />
                </div>
                <span className="font-extrabold text-xl leading-none">{energy}</span>
              </div>
            </div>
          </div>
        )}

        {showResultScreen ? (
          <>
            {/* 结算页 */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32 bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
              <div className="mb-6">
                <div className="w-32 h-32 rounded-full bg-[#0ea5e9] flex items-center justify-center shadow-lg">
                  <img
                    src="/robot-mascot.svg"
                    alt="通关助手机器人"
                    className="w-20 h-20"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-sky-600 dark:text-sky-300 mb-1">
                当之无愧代码之星！
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300 mb-5">
                本关卡中，你完成了 {allQuestions.length} 道编程挑战。
              </p>

              <div className="flex gap-3 mb-10 w-full">
                <div className="flex-1 rounded-2xl bg-[#fff7d1] px-3 py-2 flex flex-col items-center shadow-sm">
                  <span className="text-xs text-slate-500 mb-1">总经验</span>
                  <div className="flex items-center gap-1 font-extrabold text-[#f4b400]">
                    <span className="material-symbols-outlined text-base">
                      bolt
                    </span>
                    <span>{computedXP}</span>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl bg-[#e1f7ff] px-3 py-2 flex flex-col items-center shadow-sm">
                  <span className="text-xs text-slate-500 mb-1">首轮正确率</span>
                  <div className="font-extrabold text-[#1cb0f6] text-sm">
                    {firstRoundAccuracyPercent}%
                  </div>
                </div>
                <div className="flex-1 rounded-2xl bg-[#e9ddff] px-3 py-2 flex flex-col items-center shadow-sm">
                  <span className="text-xs text-slate-500 mb-1">通关用时</span>
                  <div className="font-extrabold text-[#7c3aed] text-sm">
                    {formattedElapsedTime}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部：领取经验 → 弹出订阅页 */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1a2632] border-t-2 border-slate-100 dark:border-slate-800">
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    recordLessonCompletion();
                    addXP(computedXP);
                    setShowResultScreen(false);
                    setShowSubscriptionOffer(true);
                  }}
                  className="w-full font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 shadow-lg transition-all bg-[#1cb0f6] hover:bg-[#1990d8] text-white border-[#1990d8]"
                >
                  领取经验
                </button>
              </div>
            </div>
          </>
        ) : showReviewScreen ? (
          <>
            {/* 中间提示内容 · 只刷错题 */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32 bg-gradient-to-b from-sky-50 to-white dark:from-slate-900 dark:to-slate-950">
              <div className="relative w-full max-w-xs">
                {/* 机器人主角 */}
                <div className="absolute -right-10 -top-24 w-28 h-28">
                  <div className="w-full h-full rounded-full bg-[#e0f2fe] shadow-lg flex items-center justify-center rotate-6">
                    <img
                      src="/robot-mascot.svg"
                      alt="练习助手机器人"
                      className="w-20 h-20"
                    />
                  </div>
                </div>

                {/* 对话气泡 */}
                <div className="px-6 py-4 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 shadow-md">
                  <p className="text-base font-semibold text-slate-700 dark:text-slate-100">
                    把错题再刷一遍吧，不用能量！
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-300">
                    这次只练你刚刚做错的题，一会儿就能拿下。
                  </p>
                </div>
              </div>
            </div>

            {/* 底部继续按钮 */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1a2632] border-t-2 border-slate-100 dark:border-slate-800">
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewScreen(false);
                    setHasWrongInRound(false);
                    setIsRetryWrongRound(true);
                    setRoundQuestionIds(
                      wrongRoundQuestionIds.length > 0
                        ? wrongRoundQuestionIds
                        : roundQuestionIds
                    );
                    setWrongRoundQuestionIds([]);
                    setCurrentIndex(0);
                    // 进入错题轮时，强制重置当前题目的作答状态和选项使用状态
                    setFilled(
                      Object.fromEntries(blankIds.map((id) => [id, null]))
                    );
                    setUsedOptions({});
                    setCheckState("idle");
                    setMessage(null);
                  }}
                  className="w-full font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 shadow-lg transition-all bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302]"
                >
                  继续
                </button>
              </div>
            </div>
          </>
        ) : question.type === "order" && lesson ? (
          <OrderQuestionUI
            question={question}
            lesson={lesson}
            onCorrect={() => {
              setCheckState("correct");
              setMessage(pickRandom(POSITIVE_MESSAGES));
            }}
            onWrong={() => {
              setHasWrongInRound(true);
              setWrongRoundQuestionIds((prev) =>
                question && !prev.includes(question.id) ? [...prev, question.id] : prev
              );
              if (isFirstRound) {
                setFirstRoundWrongIds((prev) =>
                  question && !prev.includes(question.id) ? [...prev, question.id] : prev
                );
              }
              setCheckState("wrong");
              setMessage(pickRandom(NEGATIVE_MESSAGES_WRONG));
            }}
            onContinue={handleOrderContinue}
          />
        ) : (
          (() => {
            const sortQ = question as SortQuestion;
            return (
          <>
            {/* 主体内容（填空题） */}
            <div className="flex-1 flex flex-col px-5 pb-32 overflow-y-auto no-scrollbar">
              <div className="mt-4 mb-1">
                <p className="text-xs text-slate-400 mb-1">
                  第 1 阶段 · 第 {lesson!.id} 部分
                </p>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
                  {sortQ.title}
                </h1>
              </div>

              <div className="flex items-end gap-4 mb-4">
                <div className="shrink-0 w-24 h-24 relative">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg border-b-4 border-sky-700 flex items-center justify-center">
                    <img
                      alt="练习助手机器人"
                      className="w-16 h-16"
                      src="/robot-mascot.svg"
                    />
                  </div>
                </div>

                <div className="relative p-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 mb-4 shadow-sm">
                  <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
                    {sortQ.helperText ?? "点击正确的代码片段。"}
                  </p>
                </div>
              </div>

              {/* 代码区域 */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 shadow-[0_4px_0_#e2e8f0] dark:shadow-[0_4px_0_#0f172a] mb-4 relative group">
                <div className="absolute -left-1 top-6 w-1 h-8 bg-slate-300 dark:bg-slate-600 rounded-r" />
                <div className="flex items-center flex-wrap gap-2 font-mono text-lg md:text-xl">
                  {sortQ.codeTemplate.map((piece, index) =>
                    piece.type === "text" ? (
                      <span
                        key={`text-${index}`}
                        className="text-slate-700 dark:text-slate-200 font-bold"
                      >
                        {piece.value}
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={piece.id}
                        onClick={() => handleBlankClick(piece.id)}
                        className={`h-12 min-w-[140px] px-4 bg-white dark:bg-slate-900 border-2 rounded-xl flex items-center justify-center relative transition-colors duration-200 ${
                          filled[piece.id]
                            ? "border-[#58cc02] bg-[#58cc02]/5"
                            : "border-dashed border-[#58cc02]/30 dark:border-slate-600 hover:bg-[#58cc02]/10 dark:hover:bg-green-900/20"
                        }`}
                      >
                        <span
                          className={`text-sm font-semibold ${
                            filled[piece.id]
                              ? "text-slate-800 dark:text-slate-100"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        >
                          {filled[piece.id]
                            ? sortQ.options.find(
                                (o) => o.id === filled[piece.id]
                              )?.label
                            : "点击填入"}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 选项按钮（点击填入空位） */}
              <div className="flex flex-wrap justify-center gap-3 w-full py-4 border-t-2 border-slate-100 dark:border-slate-800">
                {sortQ.options.map((opt) => {
                  const isUsed = !!usedOptions[opt.id];
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleOptionClick(opt.id)}
                      className={`px-5 py-3 border-2 border-b-4 rounded-2xl shadow-sm active:border-b-2 active:translate-y-[2px] transition-all font-mono text-lg font-bold ${
                        isUsed
                          ? "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500"
                          : "bg-white dark:bg-slate-700 border-[#58cc02]/20 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-[#58cc02]/10 dark:hover:bg-slate-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 底部操作栏 / 反馈弹窗 */}
            {checkState === "idle" && (
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1a2632] border-t-2 border-slate-100 dark:border-slate-800">
                <div className="px-4 py-3">
                  <button
                    type="button"
                    onClick={handleCheck}
                    disabled={!Object.values(filled).some((v) => v)}
                    className={`w-full font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 shadow-lg transition-all ${
                      Object.values(filled).some((v) => v)
                        ? "bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302]"
                        : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed active:translate-y-0 shadow-none"
                    }`}
                  >
                    检查
                  </button>
                </div>
              </div>
            )}

            {checkState !== "idle" && (
              <div className="absolute bottom-0 left-0 right-0">
                <div
                  className={`px-4 pt-4 pb-6 rounded-t-3xl shadow-lg flex flex-col gap-4 ${
                    checkState === "correct"
                      ? "bg-[#d7ffb8] text-[#225500]"
                      : "bg-[#fee2e2] text-[#b91c1c]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">
                      {checkState === "correct" ? "check_circle" : "cancel"}
                    </span>
                    <span className="font-extrabold text-base">
                      {checkState === "correct" ? "真棒！" : "不太对"}
                    </span>
                  </div>
                  {message && (
                    <p className="text-sm font-semibold leading-snug">
                      {message}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const isLastQuestion = currentIndex === totalQuestions - 1;
                      const willGoToPerfectResult =
                        checkState === "correct" && isLastQuestion && !hasWrongInRound;

                      if (!isRetryWrongRound && ENERGY_COST_PER_QUESTION > 0) {
                        const current = getEnergy(loadProgress());
                        if (current < ENERGY_COST_PER_QUESTION) {
                          setEnergyRefillChoice("super");
                          setShowOutOfEnergyModal(true);
                          return;
                        }
                        deductEnergy(ENERGY_COST_PER_QUESTION);
                        const next = getEnergy(loadProgress());
                        setEnergy(next);
                        // 若刚好扣到 0，只在不会直接进入结算页时弹出能量用尽提示
                        if (next === 0 && !willGoToPerfectResult) {
                          setEnergyRefillChoice("super");
                          setShowOutOfEnergyModal(true);
                        }
                      }
                      if (checkState === "correct") {
                        // 本题如果是首次做对，记入 mastered，用于进度条累计
                        setMasteredQuestionIds((prev) =>
                          question && !prev.includes(question.id)
                            ? [...prev, question.id]
                            : prev
                        );
                        if (currentIndex < totalQuestions - 1) {
                          setCurrentIndex((prev) => prev + 1);
                        } else {
                          // 一轮结束：有错题 -> 进入错题提示页；否则进入结算页
                          if (hasWrongInRound) {
                            setShowReviewScreen(true);
                          } else {
                            incrementLessonPlays(lessonId);
                            const seconds = Math.max(
                              1,
                              Math.round((Date.now() - startTimestamp) / 1000)
                            );
                            setElapsedSeconds(seconds);
                            setShowResultScreen(true);
                          }
                        }
                      } else if (checkState === "wrong") {
                        recordWrongQuestion(lessonId, question!.id);
                        if (currentIndex === totalQuestions - 1) {
                          // 本轮有错题，进入提示页
                          setShowReviewScreen(true);
                        } else {
                          setCurrentIndex((prev) => prev + 1);
                        }
                      }
                    }}
                    className={`mt-1 w-full text-center font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 shadow-lg transition-all ${
                      checkState === "correct"
                        ? "bg-[#58cc02] text-white hover:bg-[#46a302] border-[#46a302]"
                        : "bg-white/90 text-[#b91c1c] hover:bg-white border-[#fca5a5]"
                    }`}
                  >
                    {checkState === "correct" ? "继续" : "知道了"}
                  </button>
                </div>
              </div>
            )}
          </>
            );
          })()
        )}

        {/* 能量用完了：底部弹窗 */}
        {showOutOfEnergyModal && (
          <>
            <div
              className="absolute inset-0 bg-black/50 z-30"
              aria-hidden
              onClick={() => {}}
            />
            <div
              className="absolute left-0 right-0 bottom-0 z-40 bg-white dark:bg-[#1a2632] rounded-t-3xl shadow-2xl animate-slide-up pb-safe"
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
                      setEnergy(MAX_ENERGY);
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
                  onClick={() => {
                    setShowOutOfEnergyModal(false);
                    router.push("/");
                  }}
                  className="w-full text-center text-[#1cb0f6] font-bold text-sm py-2"
                >
                  退出单元练习
                </button>
              </div>
            </div>
          </>
        )}

        {/* 退出确认弹窗：点关闭时弹出，主角机器人 + 继续/退出 */}
        {showExitConfirmModal && (
          <>
            <div
              className="absolute inset-0 bg-black/50 z-30"
              aria-hidden
              onClick={() => setShowExitConfirmModal(false)}
            />
            <div
              className="absolute left-0 right-0 bottom-0 z-40 bg-white dark:bg-[#1a2632] rounded-t-3xl shadow-2xl animate-slide-up"
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-confirm-title"
            >
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600 mx-auto mt-3" />
              <div className="px-6 pt-4 pb-8">
                <div className="flex justify-center mb-4">
                  <img
                    src="/robot-mascot.svg"
                    alt=""
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <h2
                  id="exit-confirm-title"
                  className="text-center text-lg font-bold text-slate-800 dark:text-white mb-1"
                >
                  你确定吗?
                </h2>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
                  此单元中的所有进度将丢失
                </p>
                <button
                  type="button"
                  onClick={() => setShowExitConfirmModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#1990d8] text-white font-bold text-base mb-3"
                >
                  继续
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirmModal(false);
                    router.push("/");
                  }}
                  className="w-full text-center text-red-500 dark:text-red-400 font-bold text-sm py-2"
                >
                  退出
                </button>
              </div>
            </div>
          </>
        )}

        {/* 通关后先弹出的 7 天 Super 试用页，同款深色渐变 + 机器人，关闭后再展示结算页 */}
        {showSubscriptionOffer && (
          <div
            className="fixed inset-0 z-50 flex flex-col text-white"
            style={{
              background: "linear-gradient(180deg, #0f766e 0%, #155e75 35%, #1e3a8a 70%, #4c1d95 100%)",
            }}
          >
            <span
              className="absolute top-6 right-5 px-3 py-1 rounded-lg text-xs font-bold text-white"
              style={{
                background: "linear-gradient(90deg, #34d399 0%, #a78bfa 100%)",
              }}
            >
              SUPER
            </span>
            <div className="flex-1 flex flex-col items-center justify-center px-5 pt-14 pb-8 w-full max-w-md mx-auto">
              <h1 className="text-xl font-extrabold text-white text-center mb-6 w-full">
                免费领取 7 天 Super 体验
              </h1>
              {/* 气泡：独立一行，给足宽度避免竖排挤字 */}
              <div className="w-full mb-4 px-1">
                <div className="mx-auto rounded-2xl bg-sky-100 dark:bg-sky-900/80 border border-white/30 shadow-lg px-5 py-3 min-w-[200px] w-full max-w-[320px]">
                  <p className="text-sm text-slate-800 dark:text-slate-100 text-center leading-relaxed break-words">
                    放心好了，免费体验到期前，我们会提前{" "}
                    <span className="text-[#059669] font-bold">5天</span>{" "}
                    给你发送提醒哦！
                  </p>
                </div>
              </div>
              <div className="w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0 mb-4" style={{ background: "linear-gradient(135deg, #22d3ee 0%, #a78bfa 50%, #34d399 100%)" }}>
                <img
                  src="/robot-mascot.svg"
                  alt=""
                  className="w-16 h-16 object-contain"
                />
              </div>
              <p className="text-sm text-white/90 mb-10 text-center">
                可随时免费取消，无违约金
              </p>
            </div>
            <div className="px-5 pb-10">
              <button
                type="button"
                onClick={() => {
                  setShowSubscriptionOffer(false);
                  if (sessionMode === "review") router.push("/");
                  else {
                    setDiamondDisplayCount(getDiamonds(loadProgress()));
                    setShowDiamondClaim(true);
                  }
                }}
                className="w-full py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-base mb-3"
              >
                ¥0.00 领取体验
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubscriptionOffer(false);
                  if (sessionMode === "review") router.push("/");
                  else {
                    setDiamondDisplayCount(getDiamonds(loadProgress()));
                    setShowDiamondClaim(true);
                  }
                }}
                className="w-full text-center text-white/90 text-sm py-2"
              >
                不, 谢谢
              </button>
            </div>
          </div>
        )}

        {/* 连胜战绩弹窗：领取钻石后、一天只弹一次 */}
        {showStreakPopup && (() => {
          const p = loadProgress();
          const streak = getStreakDays(p);
          const weekCompleted = getCompletedDaysForWeek(p);
          const percent = Math.max(10, Math.min(95, 100 - streak * 3));
          const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];
          return (
            <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white dark:bg-[#101922] px-6">
              <div className="flex flex-col items-center flex-1 justify-center w-full max-w-sm">
                <span className="material-symbols-outlined text-6xl text-[#FF9800]" aria-hidden>
                  local_fire_department
                </span>
                <div className="text-5xl font-extrabold text-[#FF9800] mt-2 tabular-nums">{streak}</div>
                <p className="text-base text-slate-700 dark:text-slate-300 mt-1">连胜战绩</p>
                <div className="mt-8 w-full flex flex-col items-center">
                  <div className="flex justify-between w-full max-w-[280px] mb-2">
                    {weekLabels.map((label) => (
                      <span key={label} className="text-xs text-slate-600 dark:text-slate-400 w-8 text-center">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between w-full max-w-[280px] gap-1">
                    {weekCompleted.map((done, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0"
                        style={{
                          backgroundColor: done ? (i % 2 === 0 ? "#5AC8FA" : "#FF9800") : "#e5e5e5",
                        }}
                      >
                        {done ? "✓" : "😎"}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 text-center mt-6 px-2">
                  你成为了今天前
                  <span className="font-bold text-[#FF9800] mx-0.5">{percent}%</span>
                  最先延续连胜的优秀人士之一!
                </p>
              </div>
              <div className="w-full max-w-sm pb-10">
                <button
                  type="button"
                  onClick={() => {
                    markStreakPopupShown();
                    setShowStreakPopup(false);
                    router.push("/");
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#007AFF] hover:bg-[#0066d6] text-white font-bold text-base"
                >
                  我坚持，不放弃
                </button>
              </div>
            </div>
          );
        })()}

        {/* 钻石领取界面：右上角钻石系统，钻石飞入后数字+15 */}
        {showDiamondClaim && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white dark:bg-[#101922] px-6">
            {/* 右上角钻石系统（竞品同款） */}
            <div className="absolute top-0 left-0 right-0 flex justify-end pt-5 pr-5 z-10">
              <div className="flex items-center gap-1.5 text-[#1cb0f6]">
                <span className="material-symbols-outlined text-2xl">diamond</span>
                <span className="font-bold text-xl tabular-nums transition-all duration-300">
                  {diamondDisplayCount}
                </span>
              </div>
            </div>

            {/* 飞向右上角的钻石（固定定位，飞入后数字+15） */}
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="fixed material-symbols-outlined text-2xl text-[#1cb0f6] animate-diamond-fly-to-corner"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                diamond
              </span>
            ))}

            <div className="flex flex-col items-center flex-1 justify-center">
              {/* 宝箱 */}
              <div className="relative w-40 h-28 mb-6 flex items-end justify-center">
                <div
                  className="w-28 h-22 rounded-t-xl rounded-b-lg border-[3px] flex items-center justify-center shadow-xl"
                  style={{
                    borderColor: "#92400e",
                    background: "linear-gradient(180deg, #b45309 0%, #78350f 100%)",
                  }}
                >
                  <span className="material-symbols-outlined text-3xl text-amber-200/80">
                    redeem
                  </span>
                </div>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center">
                你已赚取 {DIAMONDS_REWARD} 颗宝石!
              </p>
            </div>
            <div className="w-full max-w-sm pb-10">
              <button
                type="button"
                onClick={() => {
                  addDiamonds(DIAMONDS_REWARD);
                  setShowDiamondClaim(false);
                  const p = loadProgress();
                  if (shouldShowStreakPopupToday(p)) {
                    setShowStreakPopup(true);
                  } else {
                    router.push("/");
                  }
                }}
                className="w-full py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#1990d8] text-white font-bold text-base"
              >
                继续
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

