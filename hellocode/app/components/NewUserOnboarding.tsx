"use client";

import { useState } from "react";

interface NewUserOnboardingProps {
  onDone: (lang: "c" | "java" | "python") => void;
}

export function NewUserOnboarding({ onDone }: NewUserOnboardingProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedKey, setSelectedKey] = useState<"c" | "java" | "python" | null>("c");
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [selectedStartChoice, setSelectedStartChoice] = useState<"beginner" | "advanced" | null>(
    "beginner"
  );

  return (
    <div className="fixed inset-0 z-[80] flex justify-center items-center bg-[#f5f7fb] pt-safe">
      <div className="w-full max-w-sm h-full flex flex-col mx-auto px-4 pt-4 pb-6">

        {step === 1 && (
          <>
            {/* 角色 + 气泡 */}
            <div className="flex items-start gap-4 mb-8 px-1">
              <div className="w-18 h-18 rounded-3xl bg-[#34d399] flex items-center justify-center shadow-md">
                <img
                  src="/robot-mascot.svg"
                  alt=""
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="inline-block rounded-3xl rounded-tl-xl bg-white shadow-md px-5 py-4">
                  <p className="text-[17px] leading-snug text-slate-800 font-semibold">
                    你想先从哪门编程语言开始?
                  </p>
                </div>
              </div>
            </div>

            {/* 新科目标题 */}
            <div className="mb-4 px-1">
              <span className="text-[14px] font-bold text-slate-500">新科目</span>
            </div>

            {/* C 语言卡片 */}
            <button
              type="button"
              onClick={() => setSelectedKey("c")}
              className={`w-full rounded-2xl border px-4 py-3.5 flex items-center gap-3 mb-3 shadow-sm transition-colors ${
                selectedKey === "c"
                  ? "border-[#1cb0f6] bg-[#e6f6ff]"
                  : "border-slate-200 bg-white active:bg-slate-50"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#e6f6ff] flex items-center justify-center">
                <svg
                  viewBox="0 0 1024 1024"
                  className="w-6 h-6"
                  aria-hidden
                >
                  <path
                    d="M896 1024H128a128 128 0 0 1-128-128V128a128 128 0 0 1 128-128h768a128 128 0 0 1 128 128v768a128 128 0 0 1-128 128z m0-896H128v768h768z m-256 64a64 64 0 0 1 0 128c-33.92-5.76-5.76 0-64 0a175.36 175.36 0 0 0-192 192c0 168.96 90.24 192 192 192 60.16 0 7.04 7.68 64 0a64 64 0 0 1 0 128c-372.48 14.72-384-199.04-384-320-3.84-211.84 121.6-320 384-320z"
                    fill="#1296db"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[16px] font-semibold text-slate-800">
                  C 语言
                </div>
              </div>
            </button>

            {/* Java 卡片 */}
            <button
              type="button"
              onClick={() => setSelectedKey("java")}
              className={`w-full rounded-2xl border px-4 py-3.5 flex items-center gap-3 mb-3 shadow-sm transition-colors ${
                selectedKey === "java"
                  ? "border-[#1cb0f6] bg-[#e6f6ff]"
                  : "border-slate-200 bg-white active:bg-slate-50"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#ffe8e8] flex items-center justify-center">
                <svg
                  viewBox="0 0 1024 1024"
                  className="w-6 h-6"
                  aria-hidden
                >
                  <path
                    d="M725.952 170.048c-29.248 20.096-56.704 38.4-87.808 62.208-23.744 18.24-65.792 45.696-67.648 78.592-3.648 53.056 78.656 102.4 34.752 170.048-16.448 25.6-43.904 36.608-78.592 53.056-3.712-7.296 9.088-14.656 14.592-21.952 54.848-78.656-56.704-104.256-42.048-201.152 14.656-96.896 124.352-128 226.752-140.8z"
                    fill="#FF1515"
                  />
                  <path
                    d="M563.2 0c16.448 16.448 29.248 47.552 29.248 78.656 0 96.896-102.4 151.744-151.744 215.744-11.008 14.656-25.6 36.544-25.6 60.352 0 52.992 54.848 111.552 74.944 153.6C457.152 486.4 415.104 455.296 384 420.48 354.752 384 323.648 327.296 351.104 276.096c40.192-74.944 162.688-120.64 206.592-201.152 11.008-20.096 20.096-51.2 5.504-74.944z"
                    fill="#FF1515"
                  />
                  <path
                    d="M353.6 500.544c9.728-2.752 19.072-5.376 26.752-8.64a124.544 124.544 0 0 0-28.288 0.832c-4.672 0.512-8.768 0.96-11.968 0.96l-10.048 0.768c-50.56 3.84-150.72 11.328-149.056 52.288 0 36.544 93.312 45.696 133.504 49.344 120.704 7.36 296.256-3.648 352.896-45.696 9.152-5.504 25.6-16.448 21.952-23.744-89.6 16.448-219.392 25.6-325.44 20.096-25.6 0-53.056 0-71.36-14.656 12.8-17.92 38.208-25.088 61.056-31.552zM327.04 609.856c3.328-3.072 5.888-5.504 0.256-6.4-21.952 5.44-71.296 18.24-69.504 45.696 1.856 21.952 49.408 36.544 76.8 42.048 107.904 21.952 254.208 5.504 329.152-29.248-10.368-1.728-19.52-9.216-28.8-16.832-10.368-8.384-20.864-16.96-33.344-17.92-7.296-1.216-15.36 1.6-24.32 4.736a162.56 162.56 0 0 1-14.08 4.416c-65.856 12.8-199.296 25.6-241.408-16.448-1.728-3.584 2.112-7.104 5.248-10.048zM360.192 711.68c2.112-2.24 4.48-4.736 0-5.824l-10.752 2.816c-29.568 7.552-58.112 14.912-53.248 55.68 78.656 60.352 270.656 40.192 351.104-7.296-10.624-2.496-18.688-10.048-27.008-17.92-10.24-9.6-20.8-19.52-36.992-20.48-7.808-1.28-15.68 2.048-23.488 5.376-3.2 1.344-6.272 2.688-9.408 3.712-56.704 12.8-170.048 27.456-192-12.8-0.704-0.64 0.512-1.92 1.792-3.328z"
                    fill="#2365C4"
                  />
                  <path
                    d="M264.064 783.36c9.728-0.576 18.56-1.088 24.832-2.56-42.048-36.544-177.344-20.096-179.2 36.544-1.792 32.96 40.256 56.704 75.008 67.712 107.84 36.544 279.744 38.4 418.752 23.744 64-7.296 221.248-34.752 213.888-104.256-3.648-18.24-20.096-31.04-38.4-32.896 14.656 64-102.4 84.096-164.544 91.456-135.296 14.592-298.048 10.944-378.496-20.16-14.656-5.44-36.608-20.096-34.752-32.896 2.688-22.848 36.032-24.96 62.912-26.624z"
                    fill="#2365C4"
                  />
                  <path
                    d="M499.2 987.456c-93.248-11.008-182.848-23.808-257.856-56.704 197.504 47.552 486.4 43.904 625.408-56.704 1.984-1.472 4.032-3.392 6.016-5.376 5.44-5.12 11.136-10.56 17.728-9.216-30.912 92.8-140.224 108.8-245.184 124.032-12.8 1.92-25.6 3.776-38.208 5.76 0-1.792-107.904-1.792-107.904-1.792zM852.096 565.056c-1.792-75.008-89.6-91.456-140.8-47.552 40.256-9.152 75.008 9.152 82.304 36.544 11.968 58.304-42.048 101.952-79.168 131.904-8.32 6.72-15.744 12.672-21.376 18.048 69.44-3.648 162.688-53.056 159.04-138.944z"
                    fill="#2365C4"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[16px] font-semibold text-slate-800">
                  Java
                </div>
              </div>
            </button>

            {/* Python 卡片 */}
            <button
              type="button"
              onClick={() => setSelectedKey("python")}
              className={`w-full rounded-2xl border px-4 py-3.5 flex items-center gap-3 mb-3 shadow-sm transition-colors ${
                selectedKey === "python"
                  ? "border-[#1cb0f6] bg-[#e6f6ff]"
                  : "border-slate-200 bg-white active:bg-slate-50"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#fff8dd] flex items-center justify-center">
                <svg
                  viewBox="0 0 1024 1024"
                  className="w-6 h-6"
                  aria-hidden
                >
                  <path
                    d="M420.693333 85.333333C353.28 85.333333 298.666667 139.946667 298.666667 207.36v71.68h183.04c16.64 0 30.293333 24.32 30.293333 40.96H207.36C139.946667 320 85.333333 374.613333 85.333333 442.026667v161.322666c0 67.413333 54.613333 122.026667 122.026667 122.026667h50.346667v-114.346667c0-67.413333 54.186667-122.026667 121.6-122.026666h224c67.413333 0 122.026667-54.229333 122.026666-121.642667V207.36C725.333333 139.946667 670.72 85.333333 603.306667 85.333333z m-30.72 68.693334c17.066667 0 30.72 5.12 30.72 30.293333s-13.653333 38.016-30.72 38.016c-16.64 0-30.293333-12.8-30.293333-37.973333s13.653333-30.336 30.293333-30.336z"
                    fill="#3C78AA"
                  />
                  <path
                    d="M766.250667 298.666667v114.346666a121.6 121.6 0 0 1-121.6 121.984H420.693333A121.6 121.6 0 0 0 298.666667 656.597333v160a122.026667 122.026667 0 0 0 122.026666 122.026667h182.613334A122.026667 122.026667 0 0 0 725.333333 816.64v-71.68h-183.082666c-16.64 0-30.250667-24.32-30.250667-40.96h304.64A122.026667 122.026667 0 0 0 938.666667 581.973333v-161.28a122.026667 122.026667 0 0 0-122.026667-122.026666zM354.986667 491.221333l-0.170667 0.170667c0.512-0.085333 1.066667-0.042667 1.621333-0.170667z m279.04 310.442667c16.64 0 30.293333 12.8 30.293333 37.973333a30.293333 30.293333 0 0 1-30.293333 30.293334c-17.066667 0-30.72-5.12-30.72-30.293334s13.653333-37.973333 30.72-37.973333z"
                    fill="#FDD835"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[16px] font-semibold text-slate-800">
                  Python
                </div>
              </div>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* 第二步：编程水平 */}
            <div className="flex items-start gap-4 mb-8 px-1">
              <div className="w-18 h-18 rounded-3xl bg-[#34d399] flex items-center justify-center shadow-md">
                <img
                  src="/robot-mascot.svg"
                  alt=""
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="inline-block rounded-3xl rounded-tl-xl bg-white shadow-md px-5 py-4">
                  <p className="text-[17px] leading-snug text-slate-800 font-semibold">
                    你现在的编程水平大概是？
                  </p>
                </div>
              </div>
            </div>

            {[
              { level: 1, label: "我是第一次学编程" },
              { level: 2, label: "了解一点点基础概念" },
              { level: 3, label: "写过几段简单代码" },
              { level: 4, label: "能独立完成小项目" },
              { level: 5, label: "已经是有经验的工程师" },
            ].map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => setSelectedLevel(item.level as 1 | 2 | 3 | 4 | 5)}
                className={`w-full rounded-2xl border px-4 py-3.5 flex items-center gap-3 mb-3 shadow-sm transition-colors ${
                  selectedLevel === item.level
                    ? "border-[#1cb0f6] bg-[#e6f6ff]"
                    : "border-slate-200 bg-white active:bg-slate-50"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[#e6f0ff] flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                    aria-hidden
                  >
                    {[1, 2, 3, 4].map((bar) => {
                      const filledCount = Math.min(4, item.level);
                      const isFilled = bar <= filledCount;
                      const heights = [6, 10, 14, 18];
                      const x = 3 + (bar - 1) * 4;
                      const y = 20 - heights[bar - 1];
                      return (
                        <rect
                          // eslint-disable-next-line react/no-array-index-key
                          key={bar}
                          x={x}
                          y={y}
                          width={3}
                          height={heights[bar - 1]}
                          rx={1.2}
                          fill={isFilled ? "#1cb0f6" : "#d0e2ff"}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[15px] font-semibold text-slate-800">
                    {item.label}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            {/* 第三步：从哪里开始 */}
            <div className="flex items-start gap-4 mb-8 px-1">
              <div className="w-18 h-18 rounded-3xl bg-[#34d399] flex items-center justify-center shadow-md">
                <img
                  src="/robot-mascot.svg"
                  alt=""
                  className="w-14 h-14 object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="inline-block rounded-3xl rounded-tl-xl bg-white shadow-md px-5 py-4">
                  <p className="text-[17px] leading-snug text-slate-800 font-semibold">
                    来看看我们该从哪里开始写代码吧？
                  </p>
                </div>
              </div>
            </div>

            {/* 初学者推荐卡片 */}
            <button
              type="button"
              onClick={() => setSelectedStartChoice("beginner")}
              className={`w-full rounded-3xl border px-4 py-4 flex items-center gap-3 mb-3 shadow-sm transition-colors relative ${
                selectedStartChoice === "beginner"
                  ? "border-[#9ddcff] bg-[#e6f6ff]"
                  : "border-slate-200 bg-white active:bg-slate-50"
              }`}
            >
              {/* 推荐角标 */}
              <span className="absolute top-3 right-3 rounded-full bg-[#1cb0f6] px-2 py-0.5 text-[11px] font-bold text-white">
                推荐
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#fffbdd] flex items-center justify-center">
                <svg
                  viewBox="0 0 1024 1024"
                  className="w-6 h-6"
                  aria-hidden
                >
                  <path
                    d="M145.358762 0h707.957077v156.137762H145.358762z"
                    fill="#67B72F"
                  />
                  <path
                    d="M181.358353 23.650894h650.085642V137.091467H183.869953S181.358353 10.464997 181.358353 23.650894z"
                    fill="#FFE197"
                  />
                  <path
                    d="M276.27588 132.591518a95.859377 95.859377 0 0 1-95.859376-95.859377 108.417374 108.417374 0 0 1 0.941849-13.081247h-2.406949A35.894941 35.894941 0 0 0 143.161113 59.545835v928.559224a35.790291 35.790291 0 0 0 35.790291 35.894941h666.097087a35.790291 35.790291 0 0 0 35.790292-35.894941V132.591518z"
                    fill="#93E041"
                  />
                  <path
                    d="M514.773172 577.144609m-207.939499 0a207.939499 207.939499 0 1 0 415.878998 0 207.939499 207.939499 0 1 0-415.878998 0Z"
                    fill="#FED150"
                  />
                  <path
                    d="M514.773172 577.144609m-143.998365 0a143.998365 143.998365 0 1 0 287.99673 0 143.998365 143.998365 0 1 0-287.99673 0Z"
                    fill="#F89B1B"
                  />
                  <path
                    d="M514.773172 833.223097m-49.080838 0a49.080838 49.080838 0 1 0 98.161676 0 49.080838 49.080838 0 1 0-98.161676 0Z"
                    fill="#FED150"
                  />
                  <path
                    d="M514.773172 327.44977m-49.080838 0a49.080838 49.080838 0 1 0 98.161676 0 49.080838 49.080838 0 1 0-98.161676 0Z"
                    fill="#FED150"
                  />
                  <path
                    d="M249.171537 843.897394c-8.581298 0-52.324987 4.813899-53.685437 46.987838s35.267041 41.85999 35.267041 41.85999a26.581094 26.581094 0 1 0 1.4651-53.057537s4.081349-5.232499 20.092795-4.185999 24.592744 16.011446 23.964844 38.197241-33.487992 77.650281-124.010219 75.661931c-3.139499 0-6.069699 0-9.104548-0.732549a35.790291 35.790291 0 0 0 25.429944 33.592641c80.37118-3.453449 137.405416-50.545938 138.975166-107.789473 1.6744-60.906285-49.918038-70.220133-58.394686-70.534083zM880.838783 159.695861v-27.104343h-49.394788c-58.290036 14.860296-96.905876 54.941237-98.266326 101.824425-1.6744 60.906285 49.918038 70.324783 58.394685 70.534083s52.324987-4.709249 53.790087-46.883189-35.371691-41.85999-35.371691-41.85999a26.685743 26.685743 0 1 0-1.4651 53.162187s-4.081349 5.232499-19.988145 4.185999-24.697394-16.011446-24.069494-38.19724 31.813592-74.301482 116.370772-75.661932z"
                    fill="#016512"
                  />
                  <path
                    d="M238.392589 124.84742a95.859377 95.859377 0 0 1-57.976085-88.115279 108.417374 108.417374 0 0 1 0.941849-13.081247h-2.406949A35.894941 35.894941 0 0 0 143.161113 59.545835v928.559224a35.790291 35.790291 0 0 0 35.790291 35.894941H238.392589z"
                    fill="#016512"
                    opacity=".3"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[15px] font-extrabold text-[#1cb0f6] mb-1">
                  第一次学编程吗？
                </div>
                <div className="text-[13px] font-semibold text-slate-600">
                  从最基础的语法开始，一点点搭建你的第一个程序。
                </div>
              </div>
            </button>

            {/* 非初学者卡片 */}
            <button
              type="button"
              onClick={() => setSelectedStartChoice("advanced")}
              className={`w-full rounded-3xl border px-4 py-4 flex items-center gap-3 mb-3 shadow-sm transition-colors ${
                selectedStartChoice === "advanced"
                  ? "border-[#9ddcff] bg-white"
                  : "border-slate-200 bg-white active:bg-slate-50"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-[#e6f0ff] flex items-center justify-center">
                <svg
                  viewBox="0 0 1024 1024"
                  className="w-6 h-6"
                  aria-hidden
                >
                  <path
                    d="M971.77 317.75A500.51 500.51 0 1 0 1011 512a497.28 497.28 0 0 0-39.23-194.25zM512 931C281 931 93 743 93 512S281 93 512 93s419 188 419 419-188 419-419 419z"
                    fill="#8499FB"
                  />
                  <path
                    d="M582.41 862.06a15 15 0 1 0 5.88 29.42A386.66 386.66 0 0 0 899 512a15 15 0 1 0-30 0c0 169.63-120.53 316.85-286.59 350.06z"
                    fill="#8499FB"
                  />
                  <path
                    d="M521.75 883.95m-15 0a15 15 0 1 0 30 0 15 15 0 1 0-30 0Z"
                    fill="#8499FB"
                  />
                  <path
                    d="M663.42 631.5l128-325.62a56.49 56.49 0 0 0-73.24-73.24l-325.62 128a56.67 56.67 0 0 0-31.92 31.92l-128 325.63a56.49 56.49 0 0 0 73.24 73.24l325.63-128a56.68 56.68 0 0 0 31.91-31.93zM430.69 420.05zM318.54 705.46l109.15-277.77 277.77-109.15-109.15 277.77z"
                    fill="#E25AD4"
                  />
                  <path
                    d="M512 512m-50 0a50 50 0 1 0 100 0 50 50 0 1 0-100 0Z"
                    fill="#E25AD4"
                  />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[15px] font-extrabold text-slate-800 mb-1">
                  不是编程初学者？
                </div>
                <div className="text-[13px] font-semibold text-slate-600">
                  我们会根据你的水平，直接安排更有挑战的内容。
                </div>
              </div>
            </button>
          </>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-6 mt-4">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-[#34d399] flex items-center justify-center shadow-md">
                  <img
                    src="/robot-mascot.svg"
                    alt=""
                    className="w-18 h-18 object-contain"
                  />
                </div>
                <div className="inline-block rounded-3xl rounded-tl-xl bg-white shadow-md px-6 py-4">
                  <p className="text-[16px] leading-relaxed text-slate-800 font-semibold text-center">
                    {selectedStartChoice === "beginner"
                      ? "准备好了吗？马上开始第 1 部分第 1 单元的编程练习！"
                      : "既然你在编程方面不是完全新手，从第 1 阶段开始会更适合你哦！"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部继续按钮 */}
        <div className="mt-auto pt-4">
          <button
            type="button"
            disabled={
              step === 1
                ? !selectedKey
                : step === 2
                ? !selectedLevel
                : step === 3
                ? !selectedStartChoice
                : false
            }
            onClick={() => {
              if (step === 1) {
                setStep(2);
              } else if (step === 2) {
                setStep(3);
              } else if (step === 3) {
                setStep(4);
              } else {
                onDone(selectedKey ?? "c");
              }
            }}
            className={`w-full rounded-2xl py-3.5 text-[15px] font-bold border-b-4 transition-all ${
              step === 1
                ? selectedKey
                  ? "bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302] active:border-b-0 active:translate-y-1 shadow-lg"
                  : "bg-[#e5e5e5] text-[#b3b3b3] border-[#d4d4d4] cursor-default"
                : step === 2
                ? selectedLevel
                  ? "bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302] active:border-b-0 active:translate-y-1 shadow-lg"
                  : "bg-[#e5e5e5] text-[#b3b3b3] border-[#d4d4d4] cursor-default"
                : step === 3
                ? selectedStartChoice
                  ? "bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302] active:border-b-0 active:translate-y-1 shadow-lg"
                  : "bg-[#e5e5e5] text-[#b3b3b3] border-[#d4d4d4] cursor-default"
                : "bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302] active:border-b-0 active:translate-y-1 shadow-lg"
            }`}
          >
            继续
          </button>
        </div>
      </div>
    </div>
  );
}

