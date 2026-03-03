import { DEFAULT_LESSON_PLAYS_TO_CLEAR } from "@/app/course-data";

// 每一小关要玩多少次才算“满圈 / 通关一次”，默认 5 次，可在 course-data 里改
export const PLAYS_TO_CLEAR = DEFAULT_LESSON_PLAYS_TO_CLEAR;
const STORAGE_KEY = "hellocode-progress-v1";

/** 能量：新用户默认 20，每日 UTC 8:00 若当天有登录则补满 20，不累计 */
export const DEFAULT_ENERGY = 20;
export const MAX_ENERGY = 25;

/** 每做一道题扣除的能量（可改为 0 方便测试） */
export const ENERGY_COST_PER_QUESTION = 1;

/** 三星挑战关，每次尝试消耗的能量 */
export const CHALLENGE_ENERGY_COST = 15;

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

/** 新用户默认钻石数（dev 模式下默认 0） */
export const DEFAULT_DIAMONDS =
  process.env.NODE_ENV === "development" ? 9999 : 0;

/** 总经验默认值 */
export const DEFAULT_XP = 0;

/** 新用户默认时间包数量（挑战倒计时加时道具） */
export const DEFAULT_TIME_PACKS = 2;

export interface UserProgress {
  lessons: Record<string, LessonProgress>;
  wrongQuestions?: WrongQuestionRecord[];
  /** 当前能量 0~20 */
  energy?: number;
  /** 是否已订阅 Super（苹果内购） */
  isSuperSubscribed?: boolean;
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
  /** 已领取过钻石的部分宝箱（part id 列表，每个部分宝箱只能领一次） */
  claimedChestParts?: string[];
  /** 每个部分对应的挑战星数（0-3 星） */
  challengeStarsByPart?: Record<string, number>;
  /** 挑战倒计时加时道具：时间包数量 */
  timePacks?: number;
  /** 特别任务：记录哪一天的每日任务统计（YYYY-MM-DD，按 getRefillDay 计算） */
  specialMissionDay?: string;
  /** 特别任务：当日完成的单元数量（进入结算并点击“领取经验”的次数） */
  specialUnitsCompletedToday?: number;
  /** 特别任务：当日获取的经验总和 */
  specialXpEarnedToday?: number;
  /** 特别任务：当日第一行任务类型（"xp" | "units"） */
  specialFirstTaskType?: "xp" | "units";
  /** 特别任务：当日首轮正确率 ≥90% 的单元数量 */
  specialHighAccuracyUnitsToday?: number;
  /** 特别任务：当日学完的部分数量 */
  specialPartsCompletedToday?: number;
  /** 是否已经看过新手引导（选科目弹窗） */
  hasSeenOnboarding?: boolean;
  /** 选定的编程语言："c" | "java" | "python"，默认 "c" */
  preferredLanguage?: "c" | "java" | "python";
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
    if (progress.timePacks == null || progress.timePacks === undefined) {
      progress.timePacks = DEFAULT_TIME_PACKS;
      saveProgress(progress);
    }
    return progress;
  } catch {
    return createInitialProgress();
  }
}

export function getEnergy(progress: UserProgress): number {
  if (progress.isSuperSubscribed) {
    return MAX_ENERGY;
  }
  const v = progress.energy;
  if (v == null || typeof v !== "number") return DEFAULT_ENERGY;
  return Math.max(0, Math.min(MAX_ENERGY, Math.floor(v)));
}

export function deductEnergy(amount: number): number {
  const progress = loadProgress();
  if (progress.isSuperSubscribed) {
    return MAX_ENERGY;
  }
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

/** 消耗指定数量钻石，成功返回 true */
export function spendDiamonds(amount: number): boolean {
  const progress = loadProgress();
  const current = getDiamonds(progress);
  const cost = Math.max(0, Math.floor(amount));
  if (current < cost) return false;
  progress.diamonds = current - cost;
  saveProgress(progress);
  return true;
}

export function getXP(progress: UserProgress): number {
  const v = progress.xp;
  if (v == null || typeof v !== "number") return DEFAULT_XP;
  return Math.max(0, Math.floor(v));
}

export function addXP(amount: number): number {
  const progress = loadProgress();
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) {
    progress.specialMissionDay = today;
    progress.specialUnitsCompletedToday = 0;
    progress.specialXpEarnedToday = 0;
    progress.specialHighAccuracyUnitsToday = 0;
    progress.specialPartsCompletedToday = 0;
  }
  const delta = Math.max(0, Math.floor(amount));
  const next = Math.max(0, getXP(progress) + Math.max(0, Math.floor(amount)));
  progress.xp = next;
  const currentXpToday = progress.specialXpEarnedToday ?? 0;
  progress.specialXpEarnedToday = currentXpToday + delta;
  saveProgress(progress);
  return next;
}

/** 特别任务：当日完成单元 +1，返回最新数量 */
export function incrementDailyCompletedUnits(): number {
  const progress = loadProgress();
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) {
    progress.specialMissionDay = today;
    progress.specialUnitsCompletedToday = 0;
    progress.specialXpEarnedToday = 0;
    progress.specialHighAccuracyUnitsToday = 0;
    progress.specialPartsCompletedToday = 0;
  }
  const current = progress.specialUnitsCompletedToday ?? 0;
  const next = current + 1;
  progress.specialUnitsCompletedToday = next;
  saveProgress(progress);
  return next;
}

/** 特别任务：获取今天完成的单元数量 */
export function getDailyCompletedUnits(progress: UserProgress): number {
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) return 0;
  const v = progress.specialUnitsCompletedToday;
  if (v == null || typeof v !== "number") return 0;
  return Math.max(0, Math.floor(v));
}

/** 特别任务：获取今天累计经验（用于“获取 20 经验”任务） */
export function getDailyXP(progress: UserProgress): number {
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) return 0;
  const v = progress.specialXpEarnedToday;
  if (v == null || typeof v !== "number") return 0;
  return Math.max(0, Math.floor(v));
}

/** 特别任务：高正确率单元 +1（首轮正确率 ≥90%） */
export function incrementDailyHighAccuracyUnits(): number {
  const progress = loadProgress();
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) {
    progress.specialMissionDay = today;
    progress.specialUnitsCompletedToday = 0;
    progress.specialXpEarnedToday = 0;
    progress.specialHighAccuracyUnitsToday = 0;
    progress.specialPartsCompletedToday = 0;
  }
  const current = progress.specialHighAccuracyUnitsToday ?? 0;
  const next = current + 1;
  progress.specialHighAccuracyUnitsToday = next;
  saveProgress(progress);
  return next;
}

/** 特别任务：获取今天高正确率单元数量 */
export function getDailyHighAccuracyUnits(progress: UserProgress): number {
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) return 0;
  const v = progress.specialHighAccuracyUnitsToday;
  if (v == null || typeof v !== "number") return 0;
  return Math.max(0, Math.floor(v));
}

/** 特别任务：学完一个部分 +1（当前用宝箱领取作为完成标志） */
export function incrementDailyCompletedParts(): number {
  const progress = loadProgress();
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) {
    progress.specialMissionDay = today;
    progress.specialUnitsCompletedToday = 0;
    progress.specialXpEarnedToday = 0;
    progress.specialHighAccuracyUnitsToday = 0;
    progress.specialPartsCompletedToday = 0;
  }
  const current = progress.specialPartsCompletedToday ?? 0;
  const next = current + 1;
  progress.specialPartsCompletedToday = next;
  saveProgress(progress);
  return next;
}

/** 特别任务：获取今天完成的部分数量 */
export function getDailyCompletedParts(progress: UserProgress): number {
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) return 0;
  const v = progress.specialPartsCompletedToday;
  if (v == null || typeof v !== "number") return 0;
  return Math.max(0, Math.floor(v));
}

/** 当前拥有的时间包数量 */
export function getTimePacks(progress: UserProgress): number {
  const v = progress.timePacks;
  if (v == null || typeof v !== "number") return DEFAULT_TIME_PACKS;
  return Math.max(0, Math.floor(v));
}

/** 增加时间包（后续购买等逻辑可复用） */
export function addTimePacks(amount: number): number {
  const progress = loadProgress();
  const next = Math.max(0, getTimePacks(progress) + Math.floor(amount));
  progress.timePacks = next;
  saveProgress(progress);
  return next;
}

/** 消耗一个时间包，成功返回 true */
export function spendTimePack(): boolean {
  const progress = loadProgress();
  const current = getTimePacks(progress);
  if (current <= 0) return false;
  progress.timePacks = current - 1;
  saveProgress(progress);
  return true;
}

/** 花费 600 钻石回满能量，成功返回 true */
export function spendDiamondsForEnergyRefill(): boolean {
  const progress = loadProgress();
  if (progress.isSuperSubscribed) {
    return false;
  }
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

/** 新手引导：是否已经看过选科目引导 */
export function hasSeenOnboarding(progress: UserProgress): boolean {
  return Boolean(progress.hasSeenOnboarding);
}

/** 新手引导：标记已看过选科目引导 */
export function markOnboardingSeen(): void {
  const progress = loadProgress();
  if (progress.hasSeenOnboarding) return;
  progress.hasSeenOnboarding = true;
  saveProgress(progress);
}

/** 用户当前选择的编程语言（默认 C） */
export function getPreferredLanguage(progress: UserProgress): "c" | "java" | "python" {
  const v = progress.preferredLanguage;
  if (v === "java" || v === "python") return v;
  return "c";
}

/** 设置用户的编程语言偏好 */
export function setPreferredLanguage(lang: "c" | "java" | "python"): void {
  const progress = loadProgress();
  progress.preferredLanguage = lang;
  saveProgress(progress);
}

/** 是否已经是 Super 订阅用户 */
export function isSuperSubscribed(progress: UserProgress): boolean {
  return Boolean(progress.isSuperSubscribed);
}

/** 标记 Super 订阅状态（成功购买或恢复购买后调用） */
export function setSuperSubscribed(active: boolean): void {
  const progress = loadProgress();
  progress.isSuperSubscribed = active;
  if (active) {
    // 订阅用户电量永远视为满格
    progress.energy = MAX_ENERGY;
  }
  saveProgress(progress);
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

/** 今天是否已完成过至少一关（用于首页火焰是否显示彩色） */
export function hasPlayedToday(progress: UserProgress): boolean {
  if (typeof window === "undefined") return false;
  const today = getRefillDay(new Date());
  return progress.lastCompletedDay === today;
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

/** 部分宝箱领取的钻石数量 */
export const CHEST_DIAMONDS_REWARD = 15;

/** 是否已领取过该部分的宝箱 */
export function hasClaimedPartChest(progress: UserProgress, partId: string): boolean {
  const list = progress.claimedChestParts ?? [];
  return list.includes(partId);
}

/** 领取部分宝箱钻石，成功返回 true，已领过返回 false */
export function claimPartChest(partId: string): boolean {
  const progress = loadProgress();
  if (hasClaimedPartChest(progress, partId)) return false;
  progress.claimedChestParts = [...(progress.claimedChestParts ?? []), partId];
  progress.diamonds = (progress.diamonds ?? DEFAULT_DIAMONDS) + CHEST_DIAMONDS_REWARD;
  // 特别任务：把领取宝箱视为“学完一个部分”
  const today = getRefillDay(new Date());
  if (progress.specialMissionDay !== today) {
    progress.specialMissionDay = today;
    progress.specialUnitsCompletedToday = 0;
    progress.specialXpEarnedToday = 0;
    progress.specialHighAccuracyUnitsToday = 0;
    progress.specialPartsCompletedToday = 0;
  }
  progress.specialPartsCompletedToday = (progress.specialPartsCompletedToday ?? 0) + 1;
  saveProgress(progress);
  return true;
}

/** 获取某个部分当前的挑战星数（0-3） */
export function getChallengeStarsForPart(
  progress: UserProgress,
  partId: string
): number {
  const raw = progress.challengeStarsByPart?.[partId];
  if (raw == null || typeof raw !== "number") return 0;
  return Math.max(0, Math.min(3, Math.floor(raw)));
}

/** 某部分挑战通关后，增加一颗星（最多 3 星），返回最新星数 */
export function incrementChallengeStarsForPart(partId: string): number {
  const progress = loadProgress();
  const current = getChallengeStarsForPart(progress, partId);
  const next = Math.min(3, current + 1);
  progress.challengeStarsByPart = {
    ...(progress.challengeStarsByPart ?? {}),
    [partId]: next,
  };
  saveProgress(progress);
  return next;
}

