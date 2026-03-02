"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconCheckCircle,
  IconBattery,
  IconInfinity,
  IconPhoneOff,
  IconHeadphones,
  IconKey,
  IconHome,
} from "@/app/components/icons";

export default function SubscribePage() {
  const pathname = usePathname();
  const [showClaimModal, setShowClaimModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7f8] dark:bg-[#101922] flex flex-col pb-20">
      <div className="mx-auto max-w-md w-full flex-1 px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          订购
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          可选套餐
        </p>

        {/* 推荐 Super 套餐卡片 */}
        <div className="mt-6 rounded-2xl bg-white dark:bg-[#1a2632] shadow-lg shadow-slate-200/60 dark:shadow-black/20 overflow-hidden">
          <div className="relative p-5 pr-20">
            <span
              className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold text-white"
              style={{
                background: "linear-gradient(90deg, #7c3aed 0%, #0ea5e9 50%, #58cc02 100%)",
              }}
            >
              推荐
            </span>
            <h2 className="mt-3 text-lg font-bold text-slate-800 dark:text-white">
              Super
            </h2>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <IconCheckCircle className="w-[18px] h-[18px] text-[#0ea5e9]" />
                无限能量
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <IconCheckCircle className="w-[18px] h-[18px] text-[#0ea5e9]" />
                免广告
              </li>
            </ul>
            {/* 右侧图标：电池 + 无限符号（Lucide 统一风格） */}
            <div
              className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center"
              aria-hidden
            >
              <div className="relative w-12 h-14 flex items-center justify-center">
                <IconBattery className="absolute w-10 h-12 text-[#0ea5e9]/80" />
                <IconInfinity
                  className="relative w-6 h-6 font-bold text-[#7c3aed]"
                />
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <button
              type="button"
              onClick={() => setShowClaimModal(true)}
              className="w-full py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-[#0ea5e9] font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              ¥0.00 就能体验 SUPER!
            </button>
          </div>
        </div>
      </div>

      {/* 领取体验弹窗：长页面可滚动，底部按钮固定 */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#101922]">
          <div className="flex-1 overflow-y-auto">
            {/* 顶部渐变区 + 标题 + 吉祥物 */}
            <div
              className="relative pt-12 pb-8 px-5 rounded-b-3xl"
              style={{
                background: "linear-gradient(180deg, #1e3a5f 0%, #0d9488 35%, #a78bfa 70%, #fff 100%)",
              }}
            >
              <span
                className="absolute top-4 right-5 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                style={{
                  background: "linear-gradient(90deg, #059669 0%, #7c3aed 100%)",
                }}
              >
                SUPER
              </span>
              <h2 className="text-xl font-extrabold text-white mt-2 pr-16 leading-tight">
                Super 会员 C 语言课程
                <br />
                完成率高 <span className="text-[#86efac]">4.2</span> 倍!
              </h2>
              <div className="flex justify-center mt-6">
                <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                  <Image
                    src="/robot-mascot.svg"
                    alt=""
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* 白底福利列表 */}
            <div className="bg-white dark:bg-[#1a2632] px-5 py-6 -mt-2 rounded-t-3xl">
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
                    }}
                  >
                    <IconInfinity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-100 font-medium">无限能量</span>
                </li>
                <li className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #a78bfa 0%, #86efac 100%)",
                    }}
                  >
                    <IconPhoneOff className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-100 font-medium">免广告全无打扰</span>
                </li>
                <li className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9 0%, #a78bfa 50%, #ec4899 100%)",
                    }}
                  >
                    <IconHeadphones className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-100 font-medium">编程练习不限次</span>
                </li>
                <li className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #3b82f6 50%, #ec4899 100%)",
                    }}
                  >
                    <IconKey className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-800 dark:text-slate-100 font-medium">免费参加限时挑战</span>
                </li>
              </ul>
            </div>

            {/* 下方插画区 + 取消政策 */}
            <div className="px-5 py-10 bg-white dark:bg-[#1a2632]">
              <div className="flex justify-center mb-6">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #0d9488 0%, #3b82f6 50%, #7c3aed 100%)",
                  }}
                >
                  <Image
                    src="/robot-mascot.svg"
                    alt=""
                    width={72}
                    height={72}
                    className="object-contain opacity-90"
                  />
                </div>
              </div>
              <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
                随时取消，无需额外费用
              </p>
            </div>

            {/* 占位：避免被固定底部遮挡 */}
            <div className="h-24" />
          </div>

          {/* 固定底部：领取体验 + 不谢谢 */}
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white dark:bg-[#1a2632] border-t border-slate-100 dark:border-slate-800 safe-area-pb">
            <button
              type="button"
              className="w-full max-w-md mx-auto block py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#1990d8] text-white font-bold text-base"
            >
              ¥0.00 领取体验
            </button>
            <button
              type="button"
              onClick={() => setShowClaimModal(false)}
              className="w-full text-center text-slate-500 dark:text-slate-400 text-sm font-medium mt-3"
            >
              不, 谢谢
            </button>
          </div>
        </div>
      )}

      {/* 与首页一致的底部 Tab 栏 */}
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
            <IconHome className="w-[26px] h-[26px]" />
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
