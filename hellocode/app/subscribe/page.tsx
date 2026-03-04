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
import {
  isSuperSubscribed,
  loadProgress,
  setSuperSubscribed,
} from "@/app/user-progress";
import {
  isIOSPlatform,
  restoreSuper,
  subscribeSuper,
} from "@/app/lib/subscription";

export default function SubscribePage() {
  const pathname = usePathname();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() =>
    isSuperSubscribed(loadProgress())
  );
  const isIOS = isIOSPlatform();

  const handleSubscribe = async () => {
    if (isSubscribed || isProcessing) {
      setShowClaimModal(false);
      return;
    }
    setIsProcessing(true);
    try {
      const ok = await subscribeSuper();
      if (ok) {
        setSuperSubscribed(true);
        setIsSubscribed(true);
        setShowClaimModal(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!isIOS || isRestoring) return;
    setIsRestoring(true);
    try {
      const ok = await restoreSuper();
      if (ok) {
        setSuperSubscribed(true);
        setIsSubscribed(true);
        setShowClaimModal(false);
      }
    } finally {
      setIsRestoring(false);
    }
  };

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
              onClick={() => {
                if (isSubscribed) return;
                setShowClaimModal(true);
              }}
              disabled={isSubscribed}
              className="w-full py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-[#0ea5e9] font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-60 disabled:cursor-default"
            >
              {isSubscribed ? "已订阅 SUPER" : "¥0.00 就能体验 SUPER!"}
            </button>
          </div>
        </div>
      </div>

      {/* 领取体验弹窗：长页面可滚动，底部按钮固定 */}
      {showClaimModal && !isSubscribed && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#101922] pt-safe">
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
              {isIOS && (
                <button
                  type="button"
                  onClick={handleRestore}
                  className="absolute top-4 right-24 text-xs text-white/70 underline-offset-2 hover:text-white"
                >
                  {isRestoring ? "恢复中..." : "恢复购买"}
                </button>
              )}
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
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full max-w-md mx-auto block py-3.5 rounded-2xl bg-[#1cb0f6] hover:bg-[#1990d8] text-white font-bold text-base disabled:opacity-60 disabled:cursor-wait"
            >
              {isProcessing ? "处理中..." : "¥0.00 领取体验"}
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
            <svg className="w-[36px] h-[36px]" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M206.7 705.9v145.6c0 49.8 40.4 90.2 90.2 90.2h375.3V612.4c0-31.1 25.4-56.5 56.5-56.5s56.5 25.4 56.5 56.5v329.3h35.1c49.8 0 90.2-40.4 90.2-90.2V552.1c47.1 0 69.4-58 34.5-89.6L615.5 164.2c-32.3-29.2-81.5-29.2-113.8 0L172.2 462.5c-34.9 31.6-12.5 89.6 34.5 89.6v58.2" fill="#FF7801" />
              <path d="M750.9 957.4h-55.1V608.1c0-20.1-16.4-36.5-36.5-36.5s-36.5 16.4-36.5 36.5v349.3H227.6c-60.8 0-110.2-49.4-110.2-110.2V701.6c0-11 9-20 20-20s20 9 20 20v145.6c0 38.7 31.5 70.2 70.2 70.2h355.3V608.1c0-42.2 34.3-76.5 76.5-76.5s76.5 34.3 76.5 76.5v309.3H751c38.7 0 70.2-31.5 70.2-70.2V527.9h20c20 0 27.5-15.4 29.3-20.1 1.8-4.7 6.6-21.2-8.2-34.6L532.7 174.8a64.717 64.717 0 0 0-87 0L116.3 473.1c-14.8 13.4-10.1 29.9-8.2 34.6 1.8 4.7 9.3 20.1 29.3 20.1h20V606c0 11-9 20-20 20s-20-9-20-20v-41c-21.1-6-38.4-21.6-46.7-42.9-10.7-27.8-3.4-58.7 18.7-78.7l329.5-298.3c19.3-17.5 44.3-27.1 70.3-27.1s51 9.6 70.3 27.1L889 443.4c22.1 20 29.4 50.9 18.7 78.7-8.2 21.3-25.6 36.9-46.7 42.9v282.2c0.1 60.8-49.3 110.2-110.1 110.2z" fill="currentColor" />
              <path d="M284 703.9c-11 0-20-9-20-20V569.7c0-11 9-20 20-20s20 9 20 20v114.2c0 11-8.9 20-20 20z" fill="#FBFFFD" />
              <path d="M261.2 731.8a22.8 21.1 0 1 0 45.6 0 22.8 21.1 0 1 0-45.6 0Z" fill="#FBFFFD" />
              <path d="M171.4 198.2m-27.2 0a27.2 27.2 0 1 0 54.4 0 27.2 27.2 0 1 0-54.4 0Z" fill="#FF7801" />
              <path d="M230.2 151m-17.7 0a17.7 17.7 0 1 0 35.4 0 17.7 17.7 0 1 0-35.4 0Z" fill="#FF7801" />
              <path d="M938.5 210.2H834.9c-11 0-20-9-20-20s9-20 20-20h103.7c11 0 20 9 20 20s-9 20-20.1 20z" fill="#FF7801" />
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
