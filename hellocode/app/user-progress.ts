import { DEFAULT_LESSON_PLAYS_TO_CLEAR } from "@/app/course-data";

// 每一小关要玩多少次才算“满圈 / 通关一次”，默认 5 次，可在 course-data 里改
export const PLAYS_TO_CLEAR = DEFAULT_LESSON_PLAYS_TO_CLEAR;
const STORAGE_KEY = "hellocode-progress-v1";

/** 能量：新用户默认 20，每日 UTC 8:00 若当天有登录则补满 20，不累计 */
export const DEFAULT_ENERGY = 20;
export const MAX_ENERGY = 20;

/** 每做一道题扣除的能量（可改为 0 方便测试） */
export const ENERGY_COST_PER_QUESTION = 1;

/** 以 UTC 早上 8 点为界的“自然日”，用于每日补能 */
export function getRefillDay(date: Date): string {
  const t = date.getTime() - 8 * 60 * 60 * 1000;
  return new Date(t).toISOString().slice(0, 10);
}

export interface LessonProgress {
  plays: number;
}

export interface WrongQuestionRecord {
  lessonId: string;
  questionId: string;
  timestamp: number;
}

/** 花费钻石回满能量所需数量 */
export const DIAMONDS_FOR_ENERGY_REFILL = 600;

/** 新用户默认钻石数 */
export const DEFAULT_DIAMONDS = 9999;

/** 总经验默认值 */
export const DEFAULT_XP = 0;

export interface UserProgress {
  lessons: Record<string, LessonProgress>;
  wrongQuestions?: WrongQuestionRecord[];
  /** 当前能量 0~20 */
  energy?: number;
  /** 上次补能的 UTC 自然日 (YYYY-MM-DD)，以 8:00 为界 */
  lastRefillUtcDay?: string;
  /** 钻石数量 */
  diamonds?: number;
  /** 总经验（点击“领取经验”后才会累加） */
  xp?: number;
  /** 连胜：有完成学习的日期列表（YYYY-MM-DD，与 getRefillDay 一致），最多保留 30 天 */
  completedDays?: string[];
  /** 连胜：上次完成学习的日期（当天完成即算连胜一天） */
  lastCompletedDay?: string;
  /** 连胜：当前连续天数 */
  streakDays?: number;
  /** 连胜弹窗：上次展示的日期，用于一天只弹一次 */
  lastStreakPopupDay?: string;
}

export function createInitialProgress(): UserProgress {
  return {
    lessons: {},
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") {
    return createInitialProgress();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let progress: UserProgress;
    if (!raw) {
      progress = createInitialProgress();
    } else {
      const parsed = JSON.parse(raw) as UserProgress;
      if (!parsed || typeof parsed !== "object" || !parsed.lessons) {
        progress = createInitialProgress();
      } else {
        progress = parsed;
      }
    }

    const today = getRefillDay(new Date());
    if (progress.energy == null || progress.energy === undefined) {
      progress.energy = DEFAULT_ENERGY;
      progress.lastRefillUtcDay = today;
      saveProgress(progress);
    } else if (progress.lastRefillUtcDay !== today) {
      progress.energy = MAX_ENERGY;
      progress.lastRefillUtcDay = today;
      saveProgress(progress);
    }
    if (progress.diamonds == null || progress.diamonds === undefined) {
      progress.diamonds = DEFAULT_DIAMONDS;
      saveProgress(progress);
    }
    if (progress.xp == null || progress.xp === undefined) {
      progress.xp = DEFAULT_XP;
      saveProgress(progress);
    }
    return progress;
  } catch {
    return createInitialProgress();
  }
}

export function getEnergy(progress: UserProgress): number {
  const v = progress.energy;
  if (v == null || typeof v !== "number") return DEFAULT_ENERGY;
  return Math.max(0, Math.min(MAX_ENERGY, Math.floor(v)));
}

export function deductEnergy(amount: number): number {
  const progress = loadProgress();
  const next = Math.max(0, getEnergy(progress) - amount);
  progress.energy = next;
  saveProgress(progress);
  return next;
}

export function getDiamonds(progress: UserProgress): number {
  const v = progress.diamonds;
  if (v == null || typeof v !== "number") return DEFAULT_DIAMONDS;
  return Math.max(0, Math.floor(v));
}

/** 增加钻石（如通关新关卡奖励） */
export function addDiamonds(amount: number): number {
  const progress = loadProgress();
  const next = Math.max(0, getDiamonds(progress) + Math.floor(amount));
  progress.diamonds = next;
  saveProgress(progress);
  return next;
}

export function getXP(progress: UserProgress): number {
  const v = progress.xp;
  if (v == null || typeof v !== "number") return DEFAULT_XP;
  return Math.max(0, Math.floor(v));
}

export function addXP(amount: number): number {
  const progress = loadProgress();
  const next = Math.max(0, getXP(progress) + Math.max(0, Math.floor(amount)));
  progress.xp = next;
  saveProgress(progress);
  return next;
}

/** 花费 600 钻石回满能量，成功返回 true */
export function spendDiamondsForEnergyRefill(): boolean {
  const progress = loadProgress();
  const diamonds = getDiamonds(progress);
  if (diamonds < DIAMONDS_FOR_ENERGY_REFILL) return false;
  progress.diamonds = diamonds - DIAMONDS_FOR_ENERGY_REFILL;
  progress.energy = MAX_ENERGY;
  saveProgress(progress);
  return true;
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function getLessonPlays(progress: UserProgress, lessonId: string): number {
  return progress.lessons[lessonId]?.plays ?? 0;
}

export function incrementLessonPlays(lessonId: string): UserProgress {
  const progress = loadProgress();
  const current = progress.lessons[lessonId]?.plays ?? 0;
  const next = Math.min(current + 1, PLAYS_TO_CLEAR);
  progress.lessons[lessonId] = { plays: next };
  saveProgress(progress);
  return progress;
}

export function getWrongQuestions(): WrongQuestionRecord[] {
  const progress = loadProgress();
  return progress.wrongQuestions ?? [];
}

export function recordWrongQuestion(
  lessonId: string,
  questionId: string
): void {
  const progress = loadProgress();
  const list = progress.wrongQuestions ?? [];

  const exists = list.some(
    (item) => item.lessonId === lessonId && item.questionId === questionId
  );
  if (exists) {
    return;
  }

  list.push({
    lessonId,
    questionId,
    timestamp: Date.now(),
  });

  progress.wrongQuestions = list;
  saveProgress(progress);
}

const MAX_COMPLETED_DAYS = 30;

/** 获取“昨天”的 refill 日（用于连胜计算） */
function getYesterdayRefillDay(): string {
  return getRefillDay(new Date(Date.now() - 86400 * 1000));
}

/** 记录今日完成一个单元（点击领取经验时调用）。每天只计一次，连续完成则连胜+1 */
export function recordLessonCompletion(): void {
  const progress = loadProgress();
  const today = getRefillDay(new Date());
  const yesterday = getYesterdayRefillDay();
  let completedDays = progress.completedDays ?? [];
  if (!completedDays.includes(today)) {
    completedDays = [...completedDays, today].slice(-MAX_COMPLETED_DAYS);
    progress.completedDays = completedDays;
  }
  if (progress.lastCompletedDay === today) return;
  if (progress.lastCompletedDay === yesterday) {
    progress.streakDays = (progress.streakDays ?? 0) + 1;
  } else {
    progress.streakDays = 1;
  }
  progress.lastCompletedDay = today;
  saveProgress(progress);
}

/** 当前连胜天数（与主页展示一致） */
export function getStreakDays(progress: UserProgress): number {
  const v = progress.streakDays;
  if (v == null || typeof v !== "number") return 0;
  return Math.max(0, Math.floor(v));
}

/** 当前周一到周日对应的 refill 日字符串 */
function getCurrentWeekRefillDays(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return getRefillDay(d);
  });
}

/** 本周一～周日是否各有完成（用于连胜战绩日历） */
export function getCompletedDaysForWeek(progress: UserProgress): boolean[] {
  const weekDays = getCurrentWeekRefillDays();
  const set = new Set(progress.completedDays ?? []);
  return weekDays.map((day) => set.has(day));
}

/** 今天是否还没展示过连胜弹窗（一天只弹一次） */
export function shouldShowStreakPopupToday(progress: UserProgress): boolean {
  const today = getRefillDay(new Date());
  return progress.lastStreakPopupDay !== today;
}

/** 标记今日已展示连胜弹窗 */
export function markStreakPopupShown(): void {
  const progress = loadProgress();
  progress.lastStreakPopupDay = getRefillDay(new Date());
  saveProgress(progress);
}

