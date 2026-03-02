"use client";

import type { ReactNode } from "react";

interface PrimaryButtonProps {
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 全局主按钮（绿色），样式与普通答题页底部「检查」按钮保持一致。
 */
export function PrimaryButton({
  label,
  onClick,
  disabled,
  className,
}: PrimaryButtonProps) {
  const enabledClasses =
    "bg-[#58cc02] hover:bg-[#46a302] text-white border-[#46a302] active:border-b-0 active:translate-y-1 shadow-lg";
  const disabledClasses =
    "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed active:translate-y-0 shadow-none hover:bg-slate-200";

  const base =
    "w-full font-extrabold text-lg uppercase tracking-wider py-3.5 rounded-2xl border-b-4 transition-all";

  const finalClassName = [
    base,
    disabled ? disabledClasses : enabledClasses,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={finalClassName}
    >
      {label}
    </button>
  );
}

