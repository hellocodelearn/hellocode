"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  parts,
  getQuestionsForLesson,
  questions,
  type Question,
  type SortQuestion,
  type OrderQuestion,
} from "@/app/course-data";
import {
  getChallengeStarsForPart,
  incrementChallengeStarsForPart,
  loadProgress,
  addXP,
  getTimePacks,
  spendTimePack,
  getDiamonds,
  spendDiamonds,
  addTimePacks,
} from "@/app/user-progress";
import { IconX, IconGem } from "@/app/components/icons";
import { PrimaryButton, BlueButton } from "@/app/components/PrimaryButton";
import { AnswerFeedbackBar } from "@/app/components/AnswerFeedbackBar";
import {
  ChoiceOptions,
  TrueFalseOptions,
  SortQuestionBody,
  OrderQuestionBody,
} from "@/app/components/question-templates";

const TIMER_COLOR = "#a4579d";

export default function ChallengePlayPageClient() {
  const router = useRouter();
  const params = useParams<{ partId: string }>();
  const partId = params.partId;
  const part = parts.find((p) => p.id === partId) ?? parts[0];

  const progress = loadProgress();
  const stars = getChallengeStarsForPart(progress, part.id);
  const nextStar = Math.min(3, stars + 1);
  const xpForThisStar =
    nextStar === 1 ? 10 : nextStar === 2 ? 20 : 40;

  const totalQuestions =
    nextStar === 1 ? 10 : nextStar === 2 ? 20 : 40;

  const TIMER_TOTAL_SECONDS =
    nextStar === 1 ? 60 : nextStar === 2 ? 105 : 150;

  // 顶部进度条节点（包含 0 节点，但 0 不显示）
  const layoutSegments =
    nextStar === 1
      ? [0, 5, 10]
      : nextStar === 2
      ? [0, 5, 10, 20]
      : [0, 10, 20, 40];

  const visibleSegments = layoutSegments.slice(1);
  const segmentCount = visibleSegments.length;

  // 每一段对应的题目数量（用于非线性进度）
  const segmentSizes =
    nextStar === 1
      ? [5, 5]
      : nextStar === 2
      ? [5, 5, 10]
      : [10, 10, 20];

  // 根据 part 下所有关卡动态抽题，支持所有题型
  const challengeQuestions: Question[] = useMemo(() => {
    const poolIds = new Set<string>();
    for (const lessonId of part.lessonIds) {
      const qs = getQuestionsForLesson(lessonId, 8);
      qs.forEach((q) => {
        poolIds.add(q.id);
      });
    }
    let pool: Question[] = Array.from(poolIds)
      .map((id) => questions[id])
      .filter((q): q is Question => Boolean(q));

    if (pool.length === 0) return [];

    // 打乱
    pool = [...pool].sort(() => Math.random() - 0.5);

    // 如果不够题，就循环补足到目标数量
    const result: Question[] = [];
    let idx = 0;
    while (result.length < totalQuestions) {
      result.push(pool[idx % pool.length]);
      idx += 1;
    }
    return result;
  }, [part.lessonIds, totalQuestions]);

  const uniqueQuestionIds = useMemo(
    () => Array.from(new Set(challengeQuestions.map((q) => q.id))),
    [challengeQuestions]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [currentRoundWrongIds, setCurrentRoundWrongIds] = useState<string[]>(
    []
  );
  const [isRetryWrongRound, setIsRetryWrongRound] = useState(false);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [newStarCount, setNewStarCount] = useState(nextStar);

  // 节点鼓励页：已展示过的阈值、待展示的阈值、是否显示鼓励页
  const [shownEncouragementThresholds, setShownEncouragementThresholds] =
    useState<number[]>([]);
  const [pendingEncouragementThreshold, setPendingEncouragementThreshold] =
    useState<number | null>(null);
  const [showEncouragement, setShowEncouragement] = useState(false);

  // 时间包数量（挑战倒计时加时道具）
  const [timePacks, setTimePacks] = useState<number>(() =>
    getTimePacks(progress)
  );
  const [diamonds, setDiamonds] = useState<number>(() =>
    getDiamonds(progress)
  );
  const [showTimePackShop, setShowTimePackShop] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<"small" | "medium" | "large">("medium");
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  // 倒计时
  const [remainingSeconds, setRemainingSeconds] = useState(
    TIMER_TOTAL_SECONDS
  );
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    if (!isTimerRunning || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // 时间到：始终先弹“使用时间宝”弹窗
          setShowTimeUpModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const correctCount = masteredIds.length;

  // 非线性进度：按段数和每段题数来映射
  const cappedCorrect = Math.min(
    correctCount,
    segmentSizes.reduce((a, b) => a + b, 0)
  );
  let remain = cappedCorrect;
  let segIndex = 0;
  while (
    segIndex < segmentSizes.length &&
    remain > segmentSizes[segIndex]
  ) {
    remain -= segmentSizes[segIndex];
    segIndex += 1;
  }
  const segProgress =
    segIndex >= segmentSizes.length
      ? 1
      : segmentSizes[segIndex] === 0
      ? 0
      : remain / segmentSizes[segIndex];
  const progressPercent =
    ((segIndex + segProgress) / segmentSizes.length) * 100;

  // 节点是否填充
  const segmentThresholds = segmentSizes.reduce<number[]>((acc, size, idx) => {
    const prev = idx === 0 ? 0 : acc[idx - 1];
    acc.push(prev + size);
    return acc;
  }, []);
  const lastSegmentThreshold =
    segmentThresholds[segmentThresholds.length - 1] ?? null;

  const isNodeFilled = (index: number) =>
    correctCount >= (segmentThresholds[index] ?? Infinity);

  const currentQuestion = challengeQuestions[currentIndex];

  // 当前题目的答题状态
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
    null
  );
  const [selectedTF, setSelectedTF] = useState<boolean | null>(null);
  const [sortBlankIds, setSortBlankIds] = useState<string[]>([]);
  const [sortFilled, setSortFilled] = useState<Record<string, string | null>>(
    {}
  );
  const [sortUsedOptions, setSortUsedOptions] = useState<
    Record<string, string | null>
  >({});
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [dragOrderIndex, setDragOrderIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<null | "correct" | "wrong">(null);

  const resetLocalAnswerState = () => {
    setSelectedChoiceId(null);
    setSelectedTF(null);
    setShowFeedback(null);
  };

  // 当题目变化时，重置各题型的局部状态
  useEffect(() => {
    setSelectedChoiceId(null);
    setSelectedTF(null);
    setShowFeedback(null);

    if (currentQuestion && currentQuestion.type === "sort") {
      const sortQ = currentQuestion as SortQuestion;
      const blanks = sortQ.codeTemplate
        .filter(
          (p): p is { type: "blank"; id: string } => p.type === "blank"
        )
        .map((p) => p.id);
      setSortBlankIds(blanks);
      setSortFilled(
        Object.fromEntries(blanks.map((id) => [id, null])) as Record<
          string,
          string | null
        >
      );
      setSortUsedOptions({});
    } else {
      setSortBlankIds([]);
      setSortFilled({});
      setSortUsedOptions({});
    }

    if (currentQuestion && currentQuestion.type === "order") {
      const orderQ = currentQuestion as OrderQuestion;
      setOrderIds(orderQ.fragments.map((f) => f.id));
    } else {
      setOrderIds([]);
    }
  }, [currentQuestion?.id]);

  // 填空题（sort）选项点击
  const handleSortOptionClick = (optionId: string) => {
    if (!currentQuestion || currentQuestion.type !== "sort") return;
    if (showFeedback) return;

    const usedByBlankId = sortUsedOptions[optionId];
    if (usedByBlankId) {
      setSortFilled((prev) => ({ ...prev, [usedByBlankId]: null }));
      setSortUsedOptions((prev) => ({ ...prev, [optionId]: null }));
      return;
    }

    const targetBlankId = sortBlankIds.find((id) => !sortFilled[id]);
    if (!targetBlankId) return;

    setSortFilled((prev) => ({ ...prev, [targetBlankId]: optionId }));
    setSortUsedOptions((prev) => ({ ...prev, [optionId]: targetBlankId }));
  };

  const handleSortBlankClick = (blankId: string) => {
    if (!currentQuestion || currentQuestion.type !== "sort") return;
    if (showFeedback) return;

    const optionId = sortFilled[blankId];
    if (!optionId) return;

    setSortFilled((prev) => ({ ...prev, [blankId]: null }));
    setSortUsedOptions((prev) => ({ ...prev, [optionId]: null }));
  };

  // 排序题拖拽调整顺序
  const handleOrderDragStart = (index: number) => {
    if (showFeedback) return;
    setDragOrderIndex(index);
  };

  const handleOrderDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleOrderDrop = (index: number) => {
    if (dragOrderIndex === null || dragOrderIndex === index) return;
    setOrderIds((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragOrderIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragOrderIndex(null);
  };

  const handleCheck = () => {
    if (!currentQuestion || !isTimerRunning || remainingSeconds <= 0) return;

    let isCorrect = false;

    if (currentQuestion.type === "choice") {
      if (!selectedChoiceId) return;
      isCorrect = selectedChoiceId === currentQuestion.correctId;
    } else if (currentQuestion.type === "true_false") {
      if (selectedTF === null) return;
      isCorrect = selectedTF === currentQuestion.correct;
    } else if (currentQuestion.type === "sort") {
      const sortQ = currentQuestion as SortQuestion;
      const blanks = sortBlankIds;
      if (blanks.length === 0) return;
      // 所有空都填了且与 correctByBlank 对应
      let allCorrect = true;
      for (const blankId of blanks) {
        const selected = sortFilled[blankId];
        const correct = sortQ.correctByBlank[blankId];
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
      isCorrect = allCorrect;
    } else if (currentQuestion.type === "order") {
      const orderQ = currentQuestion as OrderQuestion;
      const userOrder = orderIds;
      const correctOrder = orderQ.correctOrder;
      if (userOrder.length !== correctOrder.length) {
        isCorrect = false;
      } else {
        isCorrect = userOrder.every((id, idx) => id === correctOrder[idx]);
      }
    }

    setIsTimerRunning(false);
    if (isCorrect) {
      setShowFeedback("correct");

      // 计算新的掌握题目数量（用于节点鼓励判定）
      const alreadyMastered = masteredIds.includes(currentQuestion.id);
      const newCorrectCount = alreadyMastered
        ? masteredIds.length
        : masteredIds.length + 1;

      // 找到第一个还没展示过且已经达到的节点阈值
      const nextThreshold = segmentThresholds.find(
        (t) =>
          t !== lastSegmentThreshold &&
          newCorrectCount >= t &&
          !shownEncouragementThresholds.includes(t)
      );
      if (nextThreshold != null) {
        setPendingEncouragementThreshold(nextThreshold);
        setShownEncouragementThresholds((prev) => [...prev, nextThreshold]);
      }

      setMasteredIds((prev) =>
        prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
      );
      // 如果之前在错题列表里，答对后从错题列表移除
      setCurrentRoundWrongIds((prev) =>
        prev.filter((id) => id !== currentQuestion.id)
      );
    } else {
      setShowFeedback("wrong");
      setCurrentRoundWrongIds((prev) =>
        prev.includes(currentQuestion.id)
          ? prev
          : [...prev, currentQuestion.id]
      );
    }
  };

  const goToNextQuestion = () => {
    resetLocalAnswerState();

    // 如果已经时间到，则直接不再前进
    if (remainingSeconds <= 0) {
      setIsTimerRunning(false);
      return;
    }

    const isLastInRound =
      currentIndex === challengeQuestions.length - 1;

    if (!isLastInRound) {
      setCurrentIndex((prev) => prev + 1);
      setIsTimerRunning(true);
      return;
    }

    // 一轮结束：如果所有题都掌握了且本轮没有错题，视为挑战成功，进入结算页
    const allMasteredNow =
      masteredIds.length >= uniqueQuestionIds.length;
    if (allMasteredNow && currentRoundWrongIds.length === 0) {
      addXP(xpForThisStar);
      const updatedStars = incrementChallengeStarsForPart(part.id);
      setXpEarned(xpForThisStar);
      setNewStarCount(updatedStars);
      setShowResult(true);
      setIsTimerRunning(false);
      // 如果时间已到，依然优先展示结算页
      return;
    }

    // 否则进入错题轮：只刷本轮错题
    const wrongSet = Array.from(new Set(currentRoundWrongIds));
    const wrongQuestions = challengeQuestions.filter((q) =>
      wrongSet.includes(q.id)
    );
    if (wrongQuestions.length === 0) {
      setShowTimeUpModal(true);
      setIsTimerRunning(false);
      return;
    }

    setIsRetryWrongRound(true);
    setCurrentIndex(0);
    setCurrentRoundWrongIds([]);
    // 用错题列表覆盖 challengeQuestions 的前几项（简单方式）
    // 注意：这里只是基础实现，后续可以独立 roundQuestionIds。
    challengeQuestions.splice(0, wrongQuestions.length, ...wrongQuestions);
    setIsTimerRunning(true);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb] text-slate-700">
        <p className="text-sm font-semibold">
          暂时没有可用的挑战题目。
        </p>
      </div>
    );
  }

  if (showResult) {
    const isMaxStar = newStarCount >= 3;
    const description = isMaxStar
      ? `你刚刚赢取了 ${xpEarned} 经验，并拿下了最后一颗星！这一部分已经完美通关啦！`
      : `你刚刚赢取了 ${xpEarned} 经验和又一颗星！继续加油，下一颗星也不在话下！`;

    return (
      <div className="min-h-screen bg-white text-[#3c3c3c] flex flex-col px-4">
        <main className="flex-1 flex flex-col items-center justify-center">
          {/* 顶部三颗星：继续放大一档，并拉开间距 */}
          <div className="mb-7 flex items-center justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className={`w-12 h-12 ${i === 2 ? "-mt-1.5" : "mt-0.5"}`}
                aria-hidden
              >
                <path
                  d="M12 2.5 9.4 8.1 3.3 8.8 7.7 12.7 6.5 18.7 12 15.6 17.5 18.7 16.3 12.7 20.7 8.8 14.6 8.1 12 2.5Z"
                  fill={newStarCount >= i ? "#FFC800" : "#E5E5E5"}
                />
              </svg>
            ))}
          </div>

          {/* 主角进一步放大，更接近截图比例 */}
          <div className="w-44 h-44 mb-7">
            <img
              src="/robot-mascot.svg"
              alt="challenge mascot"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-2 px-6 text-center">
            <p className="text-[20px] leading-relaxed text-slate-800 font-extrabold">
              {description}
            </p>
          </div>
        </main>

        <footer className="pb-6">
          <PrimaryButton
            label="继续"
            onClick={() => {
              router.push("/");
            }}
          />
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#3c3c3c] flex flex-col px-4">
      {/* 顶部：左 X，中间进度条，右侧倒计时图标 + 文本（这里倒计时是真实运行的） */}
      <header className="pt-4 pb-2 flex items-center">
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600"
          onClick={() => {
            setIsTimerRunning(false);
            setShowExitConfirmModal(true);
          }}
        >
          <IconX className="w-5 h-5" />
        </button>

        {/* 进度条：节点等分 + 非线性进度填充 */}
        <div className="flex-1 px-3">
          <div className="relative h-6">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
            <div
              className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: TIMER_COLOR,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between">
              {layoutSegments.map((value, index) =>
                value === 0 ? (
                  <div key={`segment-0-${index}`} className="w-0 h-0" />
                ) : (
                  <div
                    key={value}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isNodeFilled(index - 1)
                        ? "bg-[#a4579d] text-white"
                        : "bg-[#dcdcdc] text-white"
                    }`}
                  >
                    {value}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* 倒计时图标 + 动态时间 */}
        <div className="ml-2 flex items-center gap-1 text-xs font-extrabold text-[#a4579d]">
          <svg
            viewBox="0 0 1024 1024"
            className="w-7 h-7"
            aria-hidden
          >
            <path
              d="M511.926857 0.804571A511.707429 511.707429 0 0 0 0.731429 512 511.707429 511.707429 0 0 0 512 1023.049143 511.707429 511.707429 0 0 0 1023.049143 512 511.707429 511.707429 0 0 0 511.926857 0.804571z"
              fill={TIMER_COLOR}
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

      {/* 中间：题目区域（统一题型模版） */}
      <main className="flex-1 flex flex-col px-2 py-4">
        <div className="mb-3 text-xs text-slate-400">
          第 1 阶段 · {part.title} · 第 {currentIndex + 1}/
          {totalQuestions} 题
        </div>
        <h1 className="text-lg font-extrabold text-slate-800 mb-4">
          {currentQuestion.title}
        </h1>

        {currentQuestion.type === "choice" ? (
          <ChoiceOptions
            question={currentQuestion as any}
            selectedId={selectedChoiceId}
            disabled={showFeedback !== null}
            onSelect={(id) => setSelectedChoiceId(id)}
          />
        ) : currentQuestion.type === "true_false" ? (
          <TrueFalseOptions
            question={currentQuestion as any}
            selected={selectedTF}
            disabled={showFeedback !== null}
            onSelect={(v) => setSelectedTF(v)}
          />
        ) : currentQuestion.type === "sort" ? (
          <SortQuestionBody
            question={currentQuestion as SortQuestion}
            blankIds={sortBlankIds}
            filledByBlank={sortFilled}
            usedOptions={sortUsedOptions}
            disabled={showFeedback !== null}
            onBlankClick={handleSortBlankClick}
            onOptionClick={handleSortOptionClick}
          />
        ) : currentQuestion.type === "order" ? (
          <OrderQuestionBody
            question={currentQuestion as OrderQuestion}
            orderIds={orderIds}
            activeIndex={dragOrderIndex}
            disabled={showFeedback !== null}
            onDragStart={handleOrderDragStart}
            onDragOver={handleOrderDragOver}
            onDrop={handleOrderDrop}
          />
        ) : null}
      </main>

      {/* 底部按钮 / 反馈 */}
      <footer className="pb-6">
        {showFeedback === null ? (
          <PrimaryButton
            label="检查"
            onClick={handleCheck}
            disabled={
              currentQuestion.type === "choice"
                ? !selectedChoiceId
                : currentQuestion.type === "true_false"
                ? selectedTF === null
                : currentQuestion.type === "sort"
                ? sortBlankIds.length === 0 ||
                  sortBlankIds.some((id) => !sortFilled[id])
                : currentQuestion.type === "order"
                ? orderIds.length === 0
                : false
            }
          />
        ) : (
          <div className="w-full">
            <AnswerFeedbackBar
              variant={showFeedback}
              primaryLabel="继续"
              onPrimaryClick={() => {
                setShowFeedback(null);
                if (pendingEncouragementThreshold != null) {
                  // 先展示鼓励页，继续保持暂停计时
                  setShowEncouragement(true);
                } else {
                  goToNextQuestion();
                  setIsTimerRunning(true);
                }
              }}
            />
          </div>
        )}
      </footer>

      {/* 节点鼓励页：每到 5/10/20/40 等节点时出现一次 */}
      {showEncouragement && pendingEncouragementThreshold != null && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col items-center justify-center bg-white/95 px-6">
          <main className="flex-1 flex flex-col items-center justify-center">
            {/* 对话气泡 */}
            <div className="relative max-w-xs rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-3 mb-6">
              <p className="text-sm leading-relaxed text-slate-700">
                不错哦，你已经完成了{" "}
                <span className="font-extrabold text-[#58CC02]">
                  {pendingEncouragementThreshold}
                </span>
                {" "}道题！能坚持到最后吗？
              </p>
              <div className="absolute left-10 -bottom-2 w-4 h-4 bg白 border-b border-r border-slate-200 rotate-45" />
            </div>

            {/* 吉祥物 */}
            <div className="w-32 h-32 mb-4 flex items-end justify-center">
              <img
                src="/robot-mascot.svg"
                alt="challenge mascot"
                className="w-full h-full object-contain"
              />
            </div>
          </main>

          <footer className="pb-6 w-full max-w-sm">
            <PrimaryButton
              label="继续"
              onClick={() => {
                setShowEncouragement(false);
                setPendingEncouragementThreshold(null);
                goToNextQuestion();
                setIsTimerRunning(true);
              }}
            />
          </footer>
        </div>
      )}

      {/* 时间到后：先弹“使用时间宝”弹窗；点击按钮时再判断是否需要去购买页 */}
      {showTimeUpModal && !showTimePackShop && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/45">
          <div className="w-full rounded-t-3xl bg-white px-4 pt-7 pb-10 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-extrabold text-slate-800 leading-snug pr-2">
                马上就好了！加时 1 分钟拿下这{" "}
                <span className="text-[#58CC02]">{xpForThisStar}</span> 经验！
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-[#a4579d]">
                <svg
                  viewBox="0 0 100 100"
                  className="w-5 h-5"
                  aria-hidden
                >
                  <circle
                    cx="45"
                    cy="45"
                    r="35"
                    stroke="#A4579E"
                    strokeWidth="10"
                    fill="none"
                  />
                  <line
                    x1="45"
                    y1="45"
                    x2="32"
                    y2="32"
                    stroke="#A4579E"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path d="M72 58H88V74H72V58Z" fill="white" />
                  <path
                    d="M80 62V86M68 74H92"
                    stroke="#A4579E"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                </svg>
                <span>x{timePacks}</span>
              </div>
            </div>

            <BlueButton
              className="mb-3"
              label={
                <>
                  <span>使用时间宝</span>
                  <svg
                    viewBox="0 0 100 100"
                    className="w-5 h-5"
                    aria-hidden
                  >
                    <circle
                      cx="45"
                      cy="45"
                      r="35"
                      stroke="#A4579E"
                      strokeWidth="10"
                      fill="none"
                    />
                    <line
                      x1="45"
                      y1="45"
                      x2="32"
                      y2="32"
                      stroke="#A4579E"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path d="M72 58H88V74H72V58Z" fill="white" />
                    <path
                      d="M80 62V86M68 74H92"
                      stroke="#A4579E"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                  </svg>
                </>
              }
              onClick={() => {
                // 测试阶段：时间宝数量 < 0 直接打开购买弹窗
                if (timePacks < 0 || !spendTimePack()) {
                  setShowTimeUpModal(false);
                  setShowTimePackShop(true);
                  return;
                }
                setTimePacks((prev) => Math.max(0, prev - 1));
                setRemainingSeconds((prev) => prev + 60);
                setShowTimeUpModal(false);
                setIsTimerRunning(true);
              }}
            />

            <button
              type="button"
              onClick={() => {
                setShowTimeUpModal(false);
                router.push("/");
              }}
              className="w-full text-center text-[#1cb0f6] text-sm font-semibold"
            >
              不，谢谢
            </button>
          </div>
        </div>
      )}

      {/* 时间到后：时间包为 0（测试阶段 <99）→ 购买时间包弹窗 */}
      {showTimePackShop && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/45">
          <div className="w-full rounded-t-3xl bg-white px-5 pt-7 pb-10 shadow-2xl">
            {/* 顶部：钻石数量 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-extrabold text-slate-800 leading-snug">
                用时间宝加时 1 分钟，拿下{" "}
                <span className="text-[#58CC02]">{xpForThisStar}</span> 经验！
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-[#1cb0f6]">
                <IconGem className="w-5 h-5 text-[#1cb0f6]" />
                <span className="text-base">{diamonds}</span>
              </div>
            </div>

            {/* 三个购买选项 */}
            <div className="flex gap-3 mb-5">
              {/* 1 个 */}
              <button
                type="button"
                onClick={() => setSelectedBundle("small")}
                className={`flex-1 rounded-2xl border-2 px-4 py-4 flex flex-col items-center gap-1 ${
                  selectedBundle === "small"
                    ? "border-[#a4579e] bg-[#f9f5ff]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-12 mb-2"
                  aria-hidden
                >
                  <circle
                    cx="45"
                    cy="45"
                    r="35"
                    stroke="#A4579E"
                    strokeWidth="10"
                    fill="none"
                  />
                  <line
                    x1="45"
                    y1="45"
                    x2="32"
                    y2="32"
                    stroke="#A4579E"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path d="M72 58H88V74H72V58Z" fill="white" />
                  <path
                    d="M80 62V86M68 74H92"
                    stroke="#A4579E"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-xs text-slate-600 mb-1">1 个</p>
                <div className="flex items-center gap-1 text-xs font-bold text-[#1cb0f6]">
                  <IconGem className="w-3.5 h-3.5 text-[#1cb0f6]" />
                  <span>450</span>
                </div>
              </button>

              {/* 5 个（推荐） */}
              <button
                type="button"
                onClick={() => setSelectedBundle("medium")}
                className={`flex-1 rounded-2xl border-2 flex flex-col items-center gap-1 relative overflow-hidden ${
                  selectedBundle === "medium"
                    ? "border-[#a4579e] bg-[#f9f5ff]"
                    : "border-slate-200 bg-white"
                }`}
              >
                {/* 顶部整条紫色标签 */}
                <span className="absolute top-0 left-0 right-0 px-2 py-1 bg-[#a4579e] text-white text-[11px] font-extrabold text-center">
                  人气推荐
                </span>
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-12 mt-5 mb-2"
                  aria-hidden
                >
                  {/* 木盆 + 多个时间宝 */}
                  <path
                    d="M25 45 C25 25, 75 25, 75 45"
                    stroke="#8B5A2B"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 45 H85 V65 C85 80, 15 80, 15 65 Z"
                    fill="#A0522D"
                    stroke="#8B5A2B"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <line x1="25" y1="50" x2="25" y2="70" stroke="#8B5A2B" strokeWidth="2" />
                  <line x1="45" y1="50" x2="45" y2="70" stroke="#8B5A2B" strokeWidth="2" />
                  <line x1="65" y1="50" x2="65" y2="70" stroke="#8B5A2B" strokeWidth="2" />
                  <g transform="translate(30, 30) scale(0.6)">
                    <circle cx="45" cy="45" r="35" stroke="#A4579E" strokeWidth="10" fill="none" />
                    <line x1="45" y1="45" x2="32" y2="32" stroke="#A4579E" strokeWidth="8" strokeLinecap="round" />
                    <path d="M72 58H88V74H72V58Z" fill="white" />
                    <path d="M80 62V86M68 74H92" stroke="#A4579E" strokeWidth="12" strokeLinecap="round" />
                  </g>
                  <g transform="translate(20, 40) scale(0.8)">
                    <circle cx="45" cy="45" r="35" stroke="#A4579E" strokeWidth="10" fill="none" />
                    <line x1="45" y1="45" x2="32" y2="32" stroke="#A4579E" strokeWidth="8" strokeLinecap="round" />
                    <path d="M72 58H88V74H72V58Z" fill="white" />
                    <path d="M80 62V86M68 74H92" stroke="#A4579E" strokeWidth="12" strokeLinecap="round" />
                  </g>
                  <g transform="translate(55, 40) scale(0.8)">
                    <circle cx="45" cy="45" r="35" stroke="#A4579E" strokeWidth="10" fill="none" />
                    <line x1="45" y1="45" x2="32" y2="32" stroke="#A4579E" strokeWidth="8" strokeLinecap="round" />
                    <path d="M72 58H88V74H72V58Z" fill="white" />
                    <path d="M80 62V86M68 74H92" stroke="#A4579E" strokeWidth="12" strokeLinecap="round" />
                  </g>
                </svg>
                <p className="text-xs text-slate-600 mb-1">5 个</p>
                <div className="flex items-center gap-1 text-xs font-bold text-[#1cb0f6]">
                  <IconGem className="w-3.5 h-3.5 text-[#1cb0f6]" />
                  <span>1800</span>
                </div>
              </button>

              {/* 15 个桶装 */}
              <button
                type="button"
                onClick={() => setSelectedBundle("large")}
                className={`flex-1 rounded-2xl border-2 px-4 py-4 flex flex-col items-center gap-1 ${
                  selectedBundle === "large"
                    ? "border-[#a4579e] bg-[#f9f5ff]"
                    : "border-slate-200 bg白"
                }`}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-12 mb-2"
                  aria-hidden
                >
                  <rect x="25" y="45" width="50" height="45" rx="5" fill="#8B5A2B" />
                  <rect x="20" y="50" width="60" height="6" fill="#FFD700" />
                  <rect x="20" y="66" width="60" height="6" fill="#FFD700" />
                  <rect x="20" y="82" width="60" height="6" fill="#FFD700" />
                  <path
                    d="M30 45 C30 25, 70 25, 70 45"
                    stroke="#8B5A2B"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <g transform="translate(30, 35)">
                    <g transform="scale(0.3)">
                      <circle cx="45" cy="45" r="35" stroke="#A4579E" strokeWidth="10" fill="none" />
                      <line x1="45" y1="45" x2="32" y2="32" stroke="#A4579E" strokeWidth="8" strokeLinecap="round" />
                      <path d="M72 58H88V74H72V58Z" fill="white" />
                      <path d="M80 62V86M68 74H92" stroke="#A4579E" strokeWidth="12" strokeLinecap="round" />
                    </g>
                    <g transform="translate(15, 5) scale(0.35)">
                      <circle cx="45" cy="45" r="35" stroke="#A4579E" strokeWidth="10" fill="none" />
                      <line x1="45" y1="45" x2="32" y2="32" stroke="#A4579E" strokeWidth="8" strokeLinecap="round" />
                      <path d="M72 58H88V74H72V58Z" fill="white" />
                      <path d="M80 62V86M68 74H92" stroke="#A4579E" strokeWidth="12" strokeLinecap="round" />
                    </g>
                    <g transform="translate(8, 12) scale(0.4)">
                      <circle cx="45" cy="45" r="35" stroke="#A4579E" strokeWidth="10" fill="none" />
                      <line x1="45" y1="45" x2="32" y2="32" stroke="#A4579E" strokeWidth="8" strokeLinecap="round" />
                      <path d="M72 58H88V74H72V58Z" fill="white" />
                      <path d="M80 62V86M68 74H92" stroke="#A4579E" strokeWidth="12" strokeLinecap="round" />
                    </g>
                  </g>
                  <g fill="#E0B0FF" opacity="0.6">
                    <circle cx="20" cy="40" r="3" />
                    <circle cx="28" cy="30" r="2" />
                    <circle cx="75" cy="35" r="4" />
                    <circle cx="85" cy="25" r="2.5" />
                    <circle cx="70" cy="20" r="1.5" />
                  </g>
                </svg>
                <p className="text-xs text-slate-600 mb-1">15 个</p>
                <div className="flex items-center gap-1 text-xs font-bold text-[#1cb0f6]">
                  <IconGem className="w-3.5 h-3.5 text-[#1cb0f6]" />
                  <span>4500</span>
                </div>
              </button>
            </div>

            {/* 底部购买按钮 */}
            <button
              type="button"
              onClick={() => {
                const { cost, count } =
                  selectedBundle === "small"
                    ? { cost: 450, count: 1 }
                    : selectedBundle === "medium"
                    ? { cost: 1800, count: 5 }
                    : { cost: 4500, count: 15 };
                if (!spendDiamonds(cost)) {
                  return;
                }
                setDiamonds((prev) => Math.max(0, prev - cost));
                addTimePacks(count);
                setTimePacks((prev) => prev + count);
                setShowTimePackShop(false);
                // 回到使用时间宝界面
                setShowTimeUpModal(true);
              }}
              className="w-full py-3.5 rounded-2xl font-extrabold text-base mb-3 bg-[#a4579e] text-white"
            >
              购买时间宝
            </button>

            <button
              type="button"
              onClick={() => {
                setShowTimePackShop(false);
                setShowTimeUpModal(true);
              }}
              className="w-full text-center text-[#A4579E] text-sm font-semibold"
            >
              不，谢谢
            </button>
          </div>
        </div>
      )}

      {/* 局内退出确认弹窗（挑战专用）：按钮样式与其它页面统一 */}
      {showExitConfirmModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/45"
            aria-hidden
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl pt-6 pb-9 px-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex justify-center mb-4">
              <img
                src="/robot-mascot.svg"
                alt=""
                className="w-24 h-24 object-contain"
              />
            </div>
            <h2 className="text-center text-xl font-extrabold text-slate-800 mb-2 pb-5">
              要是现在离开，前面的进度就白跑了！
            </h2>
            <BlueButton
              className="mb-3"
              label="返回"
              onClick={() => {
                setShowExitConfirmModal(false);
                setIsTimerRunning(true);
              }}
            />
            <button
              type="button"
              onClick={() => {
                setShowExitConfirmModal(false);
                router.push("/");
              }}
              className="w-full text-center text-red-500 font-bold text-sm py-2"
            >
              退出
            </button>
          </div>
        </>
      )}
    </div>
  );
}

