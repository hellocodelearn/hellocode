"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getQuestionsForLesson,
  getQuestionsForLessonJava,
  getQuestionsForLessonPython,
  getStage1LessonById,
  Question,
  SortQuestion,
  ChoiceQuestion,
  TrueFalseQuestion,
} from "@/app/course-data";
import {
  IconCheckCircle,
  IconXCircle,
  IconX,
  IconZap,
  IconGem,
  IconFlame,
} from "@/app/components/icons";
import { ChoiceOptions, OrderQuestionBody } from "@/app/components/question-templates";
import {
  TreasureChestClaimedIcon,
  TreasureChestReadyIcon,
} from "@/app/components/treasure-chest-icon";
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
  getDailyCompletedUnits,
  incrementDailyCompletedUnits,
  getDailyXP,
  saveProgress,
  getDailyHighAccuracyUnits,
  incrementDailyHighAccuracyUnits,
  getDailyCompletedParts,
  getPreferredLanguage,
  isSuperSubscribed,
  setSuperSubscribed,
} from "@/app/user-progress";
import { getMonthPrimaryColor } from "@/app/theme";
import { useGameSounds } from "@/app/hooks/useGameSounds";
import {
  isIOSPlatform,
  restoreSuper,
  subscribeSuper,
} from "@/app/lib/subscription";

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
  const [orderIds, setOrderIds] = useState<string[]>(() => {
    const ids = question.fragments.map((f) => f.id);
    // 打乱初始顺序，避免一上来就是正确答案
    const shuffled = [...ids];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [localCheckState, setLocalCheckState] = useState<CheckState>("idle");
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (dragIndex == null || dragIndex === index) return;
    setOrderIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
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
              {question.helperText ?? "点击右侧拖动条调整顺序！"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <OrderQuestionBody
            question={question}
            orderIds={orderIds}
            activeIndex={dragIndex}
            disabled={localCheckState !== "idle"}
            onDragStart={handleDragStart}
            onDragOver={(e) => handleDragOver(e)}
            onDrop={handleDrop}
          />
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
                {localCheckState === "correct" ? (
                  <IconCheckCircle className="w-5 h-5 text-[#225500]" />
                ) : (
                  <IconXCircle className="w-5 h-5 text-[#b91c1c]" />
                )}
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

/** 单选题 UI：选一个选项后点检查，对/错后点继续 */
function ChoiceQuestionUI({
  question,
  lesson,
  onCorrect,
  onWrong,
  onContinue,
}: {
  question: ChoiceQuestion;
  lesson: import("@/app/course-data").Lesson;
  onCorrect: () => void;
  onWrong: () => void;
  onContinue: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localCheckState, setLocalCheckState] = useState<CheckState>("idle");
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const handleCheck = () => {
    if (!selectedId) {
      setLocalCheckState("wrong");
      setLocalMessage("请先选择一个选项。");
      return;
    }
    if (selectedId === question.correctId) {
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
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
            {question.title}
          </h1>
        </div>
        <div className="flex items-end gap-4 mb-4">
          <div className="shrink-0 w-24 h-24 relative">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg border-b-4 border-sky-700 flex items-center justify-center">
              <img alt="练习助手机器人" className="w-16 h-16" src="/robot-mascot.svg" />
            </div>
          </div>
          <div className="relative p-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 mb-4 shadow-sm">
            <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
              {question.helperText ?? "选出一个正确答案。"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <ChoiceOptions
            question={question}
            selectedId={selectedId}
            disabled={localCheckState !== "idle"}
            onSelect={(id) => {
              if (localCheckState !== "idle") return;
              setSelectedId(id);
            }}
          />
        </div>

        {localCheckState === "idle" ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1a2632] border-t-2 border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCheck}
              className="w-full bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 shadow-lg transition-all"
            >
              检查
            </button>
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
                {localCheckState === "correct" ? (
                  <IconCheckCircle className="w-5 h-5 text-[#225500]" />
                ) : (
                  <IconXCircle className="w-5 h-5 text-[#b91c1c]" />
                )}
                <span className="font-extrabold text-base">
                  {localCheckState === "correct" ? "真棒！" : "不太对"}
                </span>
              </div>
              {localMessage && (
                <p className="text-sm font-semibold leading-snug">{localMessage}</p>
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

/** 判断题 UI：选对/错后点检查，再点继续 */
function TrueFalseQuestionUI({
  question,
  lesson,
  onCorrect,
  onWrong,
  onContinue,
}: {
  question: TrueFalseQuestion;
  lesson: import("@/app/course-data").Lesson;
  onCorrect: () => void;
  onWrong: () => void;
  onContinue: () => void;
}) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [localCheckState, setLocalCheckState] = useState<CheckState>("idle");
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const handleCheck = () => {
    if (selected === null) {
      setLocalCheckState("wrong");
      setLocalMessage("请先选择对或错。");
      return;
    }
    if (selected === question.correct) {
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
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">
            {question.title}
          </h1>
        </div>
        <div className="flex items-end gap-4 mb-4">
          <div className="shrink-0 w-24 h-24 relative">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg border-b-4 border-sky-700 flex items-center justify-center">
              <img alt="练习助手机器人" className="w-16 h-16" src="/robot-mascot.svg" />
            </div>
          </div>
          <div className="relative p-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 mb-4 shadow-sm">
            <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
              {question.helperText ?? "判断该说法是否正确。"}
            </p>
          </div>
        </div>
        <div className="flex gap-4 w-full">
          <button
            type="button"
            onClick={() => {
              if (localCheckState !== "idle") return;
              setSelected(true);
            }}
            className={`flex-1 py-5 rounded-2xl border-2 border-b-4 font-extrabold text-lg transition-all ${
              localCheckState !== "idle"
                ? question.correct === true
                  ? "bg-[#d7ffb8] border-[#58cc02] border-b-[#46a302] text-[#225500]"
                  : selected === true
                    ? "bg-[#fee2e2] border-red-400 border-b-red-600 text-red-800"
                    : "bg-slate-100 dark:bg-slate-700 border-slate-200 text-slate-500"
                : selected === true
                  ? "bg-[#58cc02]/15 border-[#58cc02] border-b-[#46a302] text-slate-800 dark:text-slate-100"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            对
          </button>
          <button
            type="button"
            onClick={() => {
              if (localCheckState !== "idle") return;
              setSelected(false);
            }}
            className={`flex-1 py-5 rounded-2xl border-2 border-b-4 font-extrabold text-lg transition-all ${
              localCheckState !== "idle"
                ? question.correct === false
                  ? "bg-[#d7ffb8] border-[#58cc02] border-b-[#46a302] text-[#225500]"
                  : selected === false
                    ? "bg-[#fee2e2] border-red-400 border-b-red-600 text-red-800"
                    : "bg-slate-100 dark:bg-slate-700 border-slate-200 text-slate-500"
                : selected === false
                  ? "bg-[#58cc02]/15 border-[#58cc02] border-b-[#46a302] text-slate-800 dark:text-slate-100"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            错
          </button>
        </div>

        {localCheckState === "idle" ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1a2632] border-t-2 border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCheck}
              className="w-full bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 shadow-lg transition-all"
            >
              检查
            </button>
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
                {localCheckState === "correct" ? (
                  <IconCheckCircle className="w-5 h-5 text-[#225500]" />
                ) : (
                  <IconXCircle className="w-5 h-5 text-[#b91c1c]" />
                )}
                <span className="font-extrabold text-base">
                  {localCheckState === "correct" ? "真棒！" : "不太对"}
                </span>
              </div>
              {localMessage && (
                <p className="text-sm font-semibold leading-snug">{localMessage}</p>
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

export default function LessonPageClient() {
  const router = useRouter();
  const params = useParams<{ lessonId: string }>();
  const lessonId = params.lessonId;
  const lesson = getStage1LessonById(lessonId);
  const monthPrimaryColor = getMonthPrimaryColor();
  const { playComplete, playDiamond, playFailure, playStar, playSuccess } = useGameSounds();
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const progressForLang = loadProgress();
  const preferredLang = getPreferredLanguage(progressForLang);
  const lang: "c" | "java" | "python" =
    langParam === "java"
      ? "java"
      : langParam === "python"
      ? "python"
      : preferredLang;

  const allQuestions: Question[] = useMemo(() => {
    if (lang === "java") return getQuestionsForLessonJava(lessonId);
    if (lang === "python") return getQuestionsForLessonPython(lessonId);
    return getQuestionsForLesson(lessonId);
  }, [lessonId, lang]);

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
  const [showTaskMissionPopup, setShowTaskMissionPopup] = useState(false);
  const [taskProgressAnimated, setTaskProgressAnimated] = useState(false);
  const [firstTaskType, setFirstTaskType] = useState<"xp" | "units">("xp");
  const [showDiamondClaim, setShowDiamondClaim] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [diamondDisplayCount, setDiamondDisplayCount] = useState(0);
  const diamondClaimInitialRef = useRef<number>(0);
  const sessionMode = searchParams.get("mode") === "review" ? "review" : "learn";
  const DIAMONDS_REWARD = 15;
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState<boolean>(() =>
    isSuperSubscribed(loadProgress())
  );
  const isIOS = isIOSPlatform();

  // 每局结束后的广告视频（在订阅弹窗之前播放）
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adDuration, setAdDuration] = useState<number | null>(null);
  const [adRemainingSeconds, setAdRemainingSeconds] = useState(0);
  const [adSkippable, setAdSkippable] = useState(false);
  const adVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleSuperSubscribe = async () => {
    if (isSuperUser || isSubscribing) {
      setShowSubscriptionOffer(false);
      setShowOutOfEnergyModal(false);
      return;
    }
    setIsSubscribing(true);
    try {
      const ok = await subscribeSuper();
      if (ok) {
        setSuperSubscribed(true);
        setIsSuperUser(true);
        setEnergy(MAX_ENERGY);
        setShowOutOfEnergyModal(false);
        setShowSubscriptionOffer(false);
        if (sessionMode === "review") {
          router.push("/");
        } else {
          playStar();
          setShowTaskMissionPopup(true);
        }
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSuperRestore = async () => {
    if (!isIOS || isRestoring || isSuperUser) return;
    setIsRestoring(true);
    try {
      const ok = await restoreSuper();
      if (ok) {
        setSuperSubscribed(true);
        setIsSuperUser(true);
        setEnergy(MAX_ENERGY);
        setShowOutOfEnergyModal(false);
        setShowSubscriptionOffer(false);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  useEffect(() => {
    if (!showAdOverlay) return;

    setAdSkippable(false);
    setAdDuration(null);
    setAdRemainingSeconds(0);

    const videoEl = adVideoRef.current;
    if (videoEl) {
      try {
        videoEl.currentTime = 0;
        void videoEl.play();
      } catch {
        // ignore autoplay errors
      }
    }
  }, [showAdOverlay]);

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

  // 特别任务弹窗内进度条动画：先渲染为 0%，再在下一帧填充到目标值
  useEffect(() => {
    if (!showTaskMissionPopup) {
      setTaskProgressAnimated(false);
      return;
    }
    const id = window.setTimeout(() => {
      setTaskProgressAnimated(true);
    }, 40);
    return () => window.clearTimeout(id);
  }, [showTaskMissionPopup]);

  // 特别任务：第一行任务类型每日随机一次，并持久化在 progress.specialFirstTaskType
  useEffect(() => {
    if (!showTaskMissionPopup) return;
    const progress = loadProgress();
    if (progress.specialFirstTaskType === "xp" || progress.specialFirstTaskType === "units") {
      setFirstTaskType(progress.specialFirstTaskType);
      return;
    }
    const chosen: "xp" | "units" = Math.random() < 0.5 ? "xp" : "units";
    progress.specialFirstTaskType = chosen;
    saveProgress(progress);
    setFirstTaskType(chosen);
  }, [showTaskMissionPopup]);

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
          playComplete();
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
      playFailure();
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
      playFailure();
      setMessage(pickRandom(NEGATIVE_MESSAGES_WRONG));
      return;
    }

    setCheckState("correct");
    playSuccess();
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
  const supportedTypes = ["sort", "order", "choice", "true_false"];
  if (!supportedTypes.includes(question.type)) {
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
    <div className="min-h-screen bg-[#f5f7f8] dark:bg-[#101922] font-sans text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden flex items-center justify-center pt-safe">
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
                <IconX className="w-8 h-8 font-bold" />
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
                  <IconZap className="w-[14px] h-[14px] text-white font-bold" />
                  <div className="absolute top-0.5 left-0.5 w-[60%] h-[3px] bg-white/30 rounded-full" />
                </div>
                <span className="font-extrabold text-xl leading-none">
                  {isSuperUser ? "MAX" : energy}
                </span>
              </div>
            </div>
          </div>
        )}

        {showResultScreen ? (
          <>
            {/* 结算页 */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32 bg-gradient-to-b from-sky-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
              <div className="mb-6 mt-4">
                <div className="w-32 h-32 rounded-full bg-[#1cb0f6] flex items-center justify-center shadow-lg">
                  <img
                    src="/robot-mascot.svg"
                    alt="通关助手机器人"
                    className="w-20 h-20"
                  />
                </div>
              </div>
              <h1 className="text-[24px] font-extrabold text-[#1cb0f6] mb-1">
                当之无愧代码之星！
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300 mb-5">
                本关卡中，你完成了 {allQuestions.length} 道编程挑战。
              </p>

              <div className="flex gap-3 mb-12 w-full">
                {/* 总经验 */}
                <div className="flex-1">
                  <div className="rounded-2xl bg-[#FFD93B] px-3 pt-2 pb-2.5 flex flex-col items-stretch shadow-sm">
                    <span className="text-xs font-bold text-white mb-1">
                      总经验
                    </span>
                    <div className="rounded-xl bg-white flex items-center justify-center py-1.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-[#F4B400] text-sm">
                        <svg
                          viewBox="0 0 1024 1024"
                          className="w-4 h-4"
                          aria-hidden
                        >
                          <path
                            d="M377.9 114.1h358.3l-136.4 268 231.5 0.3-485.1 559.3 139.5-356.4H222.6z"
                            fill="#FED928"
                          />
                        </svg>
                        <span>{computedXP}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 稳扎稳打（首轮正确率） */}
                <div className="flex-1">
                  <div className="rounded-2xl bg-[#78C800] px-3 pt-2 pb-2.5 flex flex-col items-stretch shadow-sm">
                    <span className="text-xs font-bold text-white mb-1">
                      稳扎稳打
                    </span>
                    <div className="rounded-xl bg-white flex items-center justify-center py-1.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-[#57CB02] text-sm">
                        <svg
                          viewBox="0 0 1024 1024"
                          className="w-4 h-4"
                          aria-hidden
                        >
                          <path
                            d="M494.22 906.81c-208.41 0-377.29-168.88-377.29-377.29s168.88-377.28 377.29-377.28c75.46 0 147.32 21.56 208.41 61.09 7.19 7.19 10.78 17.97 3.59 28.74-7.19 7.19-17.97 7.19-25.16 3.59-53.89-39.52-118.57-57.49-186.84-57.49-186.85 0-337.76 154.51-337.76 341.35 0 186.85 154.51 341.36 341.36 341.36 186.84 0 341.36-154.51 341.36-341.36 0-64.68-21.56-129.35-57.49-186.84-7.19-7.19-3.59-17.97 3.59-25.16 7.18-7.19 17.96-3.59 25.15 3.59 39.53 61.09 61.09 132.95 61.09 208.41-0.02 208.4-168.89 377.29-377.3 377.29z"
                            fill="#57CB02"
                          />
                          <path
                            d="M494.22 619.35c-50.31 0-89.83-39.53-89.83-89.83s39.53-89.83 89.83-89.83 89.83 39.53 89.83 89.83-39.53 89.83-89.83 89.83z m0-143.73c-28.75 0-53.9 25.15-53.9 53.89 0 28.75 25.15 53.9 53.9 53.9 28.74 0 53.89-25.15 53.89-53.9 0-28.74-25.15-53.89-53.89-53.89z"
                            fill="#57CB02"
                          />
                          <path
                            d="M494.22 547.49c-3.59 0-10.78 0-14.38-3.59-7.19-7.19-7.19-17.97 0-25.16L763.7 234.88V170.2c0-7.19 0-10.78 3.6-14.37l71.86-71.86c7.19-3.59 14.37-3.59 21.56-3.59 7.19 3.59 10.78 10.78 10.78 17.96v53.9h53.9c7.19 0 17.96 3.59 17.96 10.78 0 7.19 0 14.37-3.59 21.56l-71.86 71.86c-3.59 0-10.78 3.6-14.37 3.6h-64.68L508.59 543.89c-3.59 3.6-10.78 3.6-14.37 3.6z"
                            fill="#57CB02"
                          />
                        </svg>
                        <span>{firstRoundAccuracyPercent}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 熟练快手（通关用时） */}
                <div className="flex-1">
                  <div className="rounded-2xl bg-[#1CB0F6] px-3 pt-2 pb-2.5 flex flex-col items-stretch shadow-sm">
                    <span className="text-xs font-bold text-white mb-1">
                      熟练快手
                    </span>
                    <div className="rounded-xl bg-white flex items-center justify-center py-1.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-[#1cb0f6] text-sm">
                        <svg
                          viewBox="0 0 1024 1024"
                          className="w-4 h-4"
                          aria-hidden
                        >
                          <path
                            d="M511.936 0.832l15.936 0.256A511.744 511.744 0 0 1 1023.04 512l-0.256 15.936a511.744 511.744 0 0 1-510.72 495.104l-16-0.256A511.744 511.744 0 0 1 0.704 512l0.256-15.936A511.744 511.744 0 0 1 512 0.832z m-23.04 214.72A42.624 42.624 0 0 0 448 256.384v298.24c0 15.744 19.584 28.992 32.384 36.288 3.52 5.376 13.248 10.176 19.2 13.568l175.68 106.496c20.416 11.648 42.432 4.736 54.208-15.616 11.712-20.352 0.768-46.336-19.648-58.112L533.184 535.04V256.384a42.624 42.624 0 0 0-44.352-40.832z"
                            fill="#1CB0F6"
                          />
                        </svg>
                        <span>{formattedElapsedTime}</span>
                      </div>
                    </div>
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
                    incrementDailyCompletedUnits();
                    if (firstRoundAccuracyPercent >= 90) {
                      incrementDailyHighAccuracyUnits();
                    }
                    addXP(computedXP);
                    setShowResultScreen(false);
                    const progress = loadProgress();
                    if (isSuperSubscribed(progress)) {
                      if (sessionMode === "review") {
                        router.push("/");
                      } else {
                        playStar();
                        setShowTaskMissionPopup(true);
                      }
                    } else {
                      setShowAdOverlay(true);
                    }
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
              playSuccess();
              setCheckState("correct");
              setMessage(pickRandom(POSITIVE_MESSAGES));
            }}
            onWrong={() => {
              playFailure();
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
        ) : question.type === "choice" && lesson ? (
          <ChoiceQuestionUI
            question={question}
            lesson={lesson}
            onCorrect={() => {
              playSuccess();
              setCheckState("correct");
              setMessage(pickRandom(POSITIVE_MESSAGES));
            }}
            onWrong={() => {
              playFailure();
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
        ) : question.type === "true_false" && lesson ? (
          <TrueFalseQuestionUI
            question={question}
            lesson={lesson}
            onCorrect={() => {
              playSuccess();
              setCheckState("correct");
              setMessage(pickRandom(POSITIVE_MESSAGES));
            }}
            onWrong={() => {
              playFailure();
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
                    {checkState === "correct" ? (
                      <IconCheckCircle className="w-5 h-5 text-[#225500]" />
                    ) : (
                      <IconXCircle className="w-5 h-5 text-[#b91c1c]" />
                    )}
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
        {showOutOfEnergyModal && !isSuperUser && (
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
                      setEnergy(MAX_ENERGY);
                      setShowOutOfEnergyModal(false);
                    } else if (energyRefillChoice === "super") {
                      void handleSuperSubscribe();
                    }
                  }}
                  disabled={
                    (energyRefillChoice === "diamonds" &&
                      getDiamonds(loadProgress()) < DIAMONDS_FOR_ENERGY_REFILL) ||
                    (energyRefillChoice === "super" && isSubscribing)
                  }
                  className="w-full py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#1990d8] text-white font-extrabold text-base uppercase tracking-wider mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {energyRefillChoice === "diamonds" ? (
                    <>
                      <IconGem className="w-5 h-5" />
                      <span>{DIAMONDS_FOR_ENERGY_REFILL}</span>
                    </>
                  ) : isSubscribing ? (
                    "处理中..."
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

        {/* 每局结束后：在订阅弹窗之前播放的全屏广告视频 */}
        {showAdOverlay && !isSuperUser && (
          <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
            <video
              ref={adVideoRef}
              src="/ADS/ad1.mp4"
              className="w-full h-full object-contain bg-black"
              autoPlay
              playsInline
              onLoadedMetadata={(e) => {
                const d = e.currentTarget.duration;
                if (!Number.isNaN(d) && d > 0) {
                  const seconds = Math.ceil(d);
                  setAdDuration(seconds);
                  setAdRemainingSeconds(seconds);
                }
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                if (Number.isNaN(v.duration) || v.duration <= 0) return;
                const remaining = Math.max(
                  0,
                  Math.ceil(v.duration - v.currentTime)
                );
                setAdRemainingSeconds(remaining);
                if (remaining <= 0 && !adSkippable) {
                  setAdSkippable(true);
                }
              }}
              onEnded={(e) => {
                const v = e.currentTarget;
                try {
                  v.pause();
                } catch {
                  // ignore
                }
                setAdRemainingSeconds(0);
                setAdSkippable(true);
              }}
            />
            <button
              type="button"
              disabled={!adSkippable}
              onClick={() => {
                if (!adSkippable) return;
                const v = adVideoRef.current;
                if (v) {
                  try {
                    v.pause();
                  } catch {
                    // ignore
                  }
                }
                setShowAdOverlay(false);
                setShowSubscriptionOffer(true);
              }}
              className={`absolute left-4 top-3 pt-safe rounded-full flex items-center justify-center w-12 h-12 border-2 ${
                adSkippable
                  ? "border-white bg-black/60"
                  : "border-white/40 bg-black/60"
              }`}
            >
              {adSkippable ? (
                <svg
                  viewBox="0 0 1024 1024"
                  className="w-4 h-4"
                  aria-hidden
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M266.208 265.376a31.968 31.968 0 0 1 45.184 0L496 449.92l184.608-184.576a31.968 31.968 0 0 1 45.184 0l0.832 0.832a31.968 31.968 0 0 1 0 45.184L542.08 496l184.576 184.608a32 32 0 0 1 2.688 42.176l-2.688 3.008-0.832 0.832a31.968 31.968 0 0 1-45.184 0L496 542.08l-184.608 184.576a31.968 31.968 0 0 1-45.184 0l-0.832-0.832a31.968 31.968 0 0 1 0-45.184L449.92 496 265.376 311.392a32 32 0 0 1-2.688-42.176l2.688-3.008z"
                    fill="#C2C7CC"
                  />
                </svg>
              ) : (
                <span className="text-xs font-bold text-white">
                  {adRemainingSeconds}
                </span>
              )}
            </button>
          </div>
        )}

        {/* 通关后先弹出的 7 天 Super 试用页，同款深色渐变 + 机器人，关闭后再展示任务弹窗 */}
        {showSubscriptionOffer && !isSuperUser && (
          <div
            className="fixed inset-0 z-50 flex flex-col text-white pt-safe"
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
            {isIOS && (
              <button
                type="button"
                onClick={handleSuperRestore}
                className="absolute top-6 right-24 text-xs text-white/70 underline-offset-2 hover:text-white"
              >
                {isRestoring ? "恢复中..." : "恢复购买"}
              </button>
            )}
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
                  void handleSuperSubscribe();
                }}
                disabled={isSubscribing}
                className="w-full py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-base mb-3 disabled:opacity-60 disabled:cursor-wait"
              >
                {isSubscribing ? "处理中..." : "¥0.00 领取体验"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubscriptionOffer(false);
                  if (sessionMode === "review") router.push("/");
                  else {
                    playStar();
                    setShowTaskMissionPopup(true);
                  }
                }}
                className="w-full text-center text-white/90 text-sm py-2"
              >
                不, 谢谢
              </button>
            </div>
          </div>
        )}

        {/* 特别任务弹窗：在订阅页之后、领取宝石页之前 */}
        {showTaskMissionPopup && (() => {
          const progress = loadProgress();
          const unitsToday = getDailyCompletedUnits(progress);
          const xpToday = getDailyXP(progress);
          const highAccToday = getDailyHighAccuracyUnits(progress);
          const partsToday = getDailyCompletedParts(progress);

          const xpTask = {
            title: "获取 20 经验",
            current: xpToday,
            target: 20,
            completed: xpToday >= 20,
            rewardDiamonds: 25,
          } as const;
          const unitTask = {
            title: "完成 2 个单元",
            current: unitsToday,
            target: 2,
            completed: unitsToday >= 2,
            rewardDiamonds: 25,
          } as const;
          const highAccuracyTask = {
            title: "1 个单元至少答对 90%",
            current: highAccToday,
            target: 1,
            completed: highAccToday >= 1,
            rewardDiamonds: 50,
          } as const;
          const partTask = {
            title: "学完一个部分",
            current: partsToday,
            target: 1,
            completed: partsToday >= 1,
            rewardDiamonds: 100,
          } as const;

          // 第一行在「经验 / 单元」里随机，其余两行固定顺序：第二行为 90% 单元，第三行为学完一个部分
          const firstTask = firstTaskType === "xp" ? xpTask : unitTask;
          const tasks = [firstTask, highAccuracyTask, partTask] as const;

          return (
            <div className="fixed inset-0 z-[58] flex flex-col items-center justify-center bg-white dark:bg-[#101922] px-6">
              <div className="flex flex-col items-center flex-1 justify-center w-full max-w-sm">
                <p
                  className="text-[24px] font-extrabold mb-6 text-center"
                  style={{ color: monthPrimaryColor }}
                >
                  +1 个特别任务点数!
                </p>

                {/* 任务列表卡片 */}
                <div className="w-full rounded-3xl bg-white dark:bg-[#0f172a] shadow-[0_8px_0_rgba(15,23,42,0.12)] border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {tasks.map((task, index) => {
                    const progressRatio = Math.min(1, task.current / task.target);
                    const animatedWidth = task.completed
                      ? progressRatio * 100
                      : taskProgressAnimated
                      ? progressRatio * 100
                      : 0;
                    const isLast = index === tasks.length - 1;
                    const ChestIcon = task.completed
                      ? TreasureChestClaimedIcon
                      : TreasureChestReadyIcon;
                    return (
                      <div
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        className={`px-4 py-3 flex items-center gap-3 ${
                          !isLast ? "border-b border-slate-100 dark:border-slate-800" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {task.title}
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${animatedWidth}%`,
                                backgroundColor: monthPrimaryColor,
                              }}
                            />
                          </div>
                          <div className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {Math.min(task.current, task.target)} / {task.target}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="flex flex-col items-center gap-1">
                            <ChestIcon className="w-9 h-9" />
                            {task.completed && (
                              <div className="flex items-center gap-1 text-xs font-extrabold text-[#1cb0f6] animate-pulse">
                                <span>+{task.rewardDiamonds}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* 底部特别任务条目（无阴影） */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        三月特别任务
                      </div>
                      <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                        1 / 25
                      </div>
                    </div>
                    {/* 黄色指针星星图标 */}
                    <svg
                      viewBox="0 0 1029 1024"
                      className="w-10 h-10 flex-shrink-0"
                      aria-hidden
                    >
                      <path
                        d="M571.904 153.6S542.72 153.6 517.12 286.72s-133.12 163.84-168.96 225.28c-26.112 44.544 5.12 174.08-25.6 240.64s-78.336 122.88-70.144 143.36c8.704 20.48 16.896 52.224 253.44-81.408l239.104 105.984S803.84 911.36 798.72 855.04s-34.816-214.528-34.816-214.528L926.72 465.92s51.2-79.36-43.52-93.184c-94.72-14.336-200.192-30.72-200.192-30.72L571.904 153.6z"
                        fill="#FFC800"
                      />
                      <path
                        d="M655.36 184.32s-56.32 5.12-81.92 125.952-133.12 148.992-168.96 204.8c-26.112 40.448 5.12 158.208-25.6 218.624S300.544 844.8 308.736 863.744c8.704 18.432 16.896 47.616 253.44-73.728l239.104 96.256s58.88-8.192 53.76-59.392-34.816-195.072-34.816-195.072l162.816-158.72s51.2-72.192-43.52-84.992c-94.72-12.8-200.192-27.648-200.192-27.648L655.36 184.32z"
                        fill="#FFC800"
                      />
                      <path
                        d="M813.568 897.024c-6.656 0-13.312-1.024-19.968-3.584l6.656-19.456c13.312 4.608 27.648 2.048 38.912-7.168 10.752-9.216 15.872-23.04 13.312-37.376l-31.232-181.248c-3.584-19.456 3.072-39.424 17.408-53.76l131.584-128c11.264-10.752 14.848-26.112 10.24-40.96-4.608-14.848-16.896-25.088-32.256-27.136l-33.28-4.608 3.072-20.48 33.28 4.608c23.04 3.584 41.472 18.944 48.64 40.96 7.168 22.016 1.536 45.568-15.36 61.952l-131.584 128c-9.216 9.216-13.824 22.528-11.264 35.328l31.232 181.248c3.584 21.504-4.096 42.496-20.48 56.32-11.264 10.752-24.576 15.36-38.912 15.36zM738.816 360.448c-7.168-5.632-13.312-12.8-17.408-21.504L640 174.592c-5.632-11.264-15.36-18.944-27.136-21.504-12.288-2.56-25.088 0.512-34.304 8.192l-13.312-15.872c13.824-11.776 33.28-16.384 51.712-12.288 17.92 3.584 33.28 15.872 41.472 32.256l81.408 164.864c2.56 5.632 6.656 10.24 11.776 13.824l-12.8 16.384zM221.184 362.496c-1.024-5.632 3.072-10.752 8.704-11.776l39.936-6.144c5.632-1.024 10.752 3.072 11.776 8.704 1.024 5.632-3.072 10.752-8.704 11.776l-39.936 6.144c-5.632 0.512-10.752-3.072-11.776-8.704z"
                        fill="#020202"
                      />
                      <path
                        d="M285.184 930.816c-13.312 0-27.136-4.096-38.4-12.8-20.48-14.848-30.208-39.424-26.112-64l33.792-198.656c2.56-14.336-2.56-29.184-12.8-39.936L97.792 475.136c-19.968-19.456-25.6-49.664-12.8-75.776 9.728-19.456 29.184-32.768 50.688-35.84l33.28-4.608c5.632-1.024 10.752 3.072 11.776 8.704 1.024 5.632-3.072 10.752-8.704 11.776L138.24 384c-16.384 2.56-31.232 12.8-36.864 28.672-6.656 17.408-2.56 35.328 10.752 48.128L256 601.088c15.36 14.848 22.528 36.864 18.944 57.856L240.64 857.6c-3.072 17.408 3.584 33.792 17.92 44.032s31.744 11.776 47.104 3.584l178.176-93.696c18.944-10.24 41.984-10.24 60.928 0l178.176 93.696c15.36 8.192 33.28 6.656 47.104-3.584 14.336-10.24 20.992-26.624 17.92-44.032l-33.792-198.656c-3.584-20.992 3.584-43.008 18.944-57.856L917.504 460.8c13.312-12.8 16.896-31.232 10.752-48.128-6.144-15.36-20.48-26.112-36.864-28.672l-197.632-28.672c-21.504-3.072-39.424-16.384-49.152-35.84l-88.576-179.2c-7.168-14.848-22.016-25.6-38.4-26.112-18.432-1.024-34.816 8.704-42.496 25.088L385.024 319.488c-7.68 15.872-21.504 27.136-37.376 32.768-6.144 2.048-12.288-2.048-13.312-8.192-0.512-4.608 2.048-9.728 6.656-11.264 11.264-3.584 20.48-11.776 25.6-22.528L455.68 129.536c11.264-22.528 33.28-36.352 58.368-36.352s47.616 13.824 58.368 36.352l89.088 180.736c6.656 13.312 18.944 22.528 33.792 24.576l199.168 29.184c24.576 3.584 45.056 20.48 52.736 44.544 7.68 24.064 1.536 49.664-16.384 67.072l-144.384 140.8c-10.752 10.24-15.36 25.088-12.8 39.936l33.792 198.656c4.608 27.648-8.192 55.296-34.304 69.12-19.456 10.24-43.008 9.216-61.952-1.024L535.552 829.44c-13.312-6.656-28.672-6.656-41.984 0l-178.176 93.696c-9.728 5.12-19.968 7.68-30.208 7.68z"
                        fill="#020202"
                      />
                      <path
                        d="M772.096 230.912l-18.432-68.096-64.512-14.336 64.512-19.456 20.48-61.44 18.432 61.44 64.512 21.504-65.024 12.288-19.968 68.096z m-43.008-83.968l32.768 7.68 10.752 39.424 11.776-39.424 32.256-6.144-32.768-10.752-10.752-35.84-11.776 35.84-32.256 9.216zM708.608 818.688l-28.672-111.104c-1.536-5.632 2.048-11.264 7.168-12.288 5.632-1.536 11.264 2.048 12.288 7.168l28.672 111.104c1.536 5.632-2.048 11.264-7.168 12.288z"
                        fill="#020202"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="w-full px-6 pb-10">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskMissionPopup(false);
                    setShowDiamondClaim(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#1990d8] text-white font-extrabold text-base"
                >
                  继续
                </button>
              </div>
            </div>
          );
        })()}

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
                <IconFlame className="w-16 h-16 text-[#FF9800]" aria-hidden />
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
                <IconGem className="w-8 h-8 text-[#1cb0f6]" />
                <span className="font-bold text-xl tabular-nums transition-all duration-300">
                  {diamondDisplayCount}
                </span>
              </div>
            </div>

            {/* 飞向右上角的钻石（固定定位，飞入后数字+15） */}
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="fixed text-[#1cb0f6] animate-diamond-fly-to-corner flex items-center justify-center"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <IconGem className="w-8 h-8" />
              </span>
            ))}

            <div className="flex flex-col items-center flex-1 justify-center">
              {/* 宝箱（使用主页“已领取”同款图标） */}
              <div className="relative mb-6 flex items-center justify-center">
                <TreasureChestClaimedIcon className="w-28 h-28" />
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
                  playDiamond();
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

