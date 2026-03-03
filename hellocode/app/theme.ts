// 全局主题色配置：按月份划分的主体色（参考多邻国配色）
// 后续任意页面都可以从这里读取当前月份的主体色

/** 1~12 月对应的主体色（Duolingo 风格高饱和色） */
export const MONTH_PRIMARY_COLORS: string[] = [
  // 1 月：清爽绿色（主品牌色）
  "#58cc02",
  // 2 月：亮蓝色（和钻石色系接近）
  "#1cb0f6",
  // 3 月：活力橙色
  "#ffb300",
  // 4 月：柔和青绿
  "#00c2b3",
  // 5 月：紫色偏品牌渐变的一端
  "#7c3aed",
  // 6 月：粉色，适合节日/活动
  "#ff78ca",
  // 7 月：海洋蓝
  "#2f86ff",
  // 8 月：柠檬黄
  "#ffd93b",
  // 9 月：森林绿
  "#16a34a",
  // 10 月：琥珀橙
  "#fb923c",
  // 11 月：深蓝紫
  "#4c1d95",
  // 12 月：薄荷绿
  "#22c55e",
];

/** 根据日期获取当前月份的主体色（默认使用当前时间） */
export function getMonthPrimaryColor(date: Date = new Date()): string {
  const monthIndex = date.getMonth(); // 0-11
  return MONTH_PRIMARY_COLORS[monthIndex] ?? MONTH_PRIMARY_COLORS[0];
}

