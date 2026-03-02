"use client";

import type { ReactNode } from "react";
import { IconCheckCircle, IconXCircle } from "@/app/components/icons";

interface AnswerFeedbackBarProps {
  variant: "correct" | "wrong";
  title?: string;
  message?: ReactNode;
  primaryLabel: string;
  onPrimaryClick: () => void;
}

/**
 * 底部答题反馈条（正确 / 错误弹窗），样式与普通答题页保持一致。
 */
export function AnswerFeedbackBar({
  variant,
  title,
  message,
  primaryLabel,
  onPrimaryClick,
}: AnswerFeedbackBarProps) {
  const isCorrect = variant === "correct";
  const bgClass = isCorrect ? "bg-[#d7ffb8] text-[#225500]" : "bg-[#fee2e2] text-[#b91c1c]";

  return (
    <div
      className={`px-4 pt-4 pb-6 rounded-t-3xl shadow-lg flex flex-col gap-4 ${bgClass}`}
    >
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <IconCheckCircle className="w-5 h-5 text-[#225500]" />
        ) : (
          <IconXCircle className="w-5 h-5 text-[#b91c1c]" />
        )}
        <span className="font-extrabold text-base">
          {title ?? (isCorrect ? "真棒！" : "不太对")}
        </span>
      </div>
      {message && (
        <p className="text-sm font-semibold leading-snug">
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={onPrimaryClick}
        className={`mt-1 w-full text-center font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 active:border-b-0 active:translate-y-1 shadow-lg transition-all ${
          isCorrect
            ? "bg-[#58cc02] text白 hover:bg-[#46a302] border-[#46a302]"
            : "bg-white/90 text-[#b91c1c] hover:bg白 border-[#fca5a5]"
        }`}
      >
        {primaryLabel}
      </button>
    </div>
  );
}

