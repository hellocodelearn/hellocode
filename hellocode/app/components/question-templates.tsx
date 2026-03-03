"use client";

import { useMemo } from "react";
import type {
  ChoiceQuestion,
  TrueFalseQuestion,
  SortQuestion,
  OrderQuestion,
} from "@/app/course-data";

// 统一题型 UI 模版，只负责展示和交互回调，不包含业务逻辑

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ------- 单选题 -------

export interface ChoiceOptionsProps {
  question: ChoiceQuestion;
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

export function ChoiceOptions({
  question,
  selectedId,
  disabled,
  onSelect,
}: ChoiceOptionsProps) {
  const shuffledOptions = useMemo(
    () => shuffleArray(question.options),
    [question.id]
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {shuffledOptions.map((opt) => (
        <button
          key={opt.id}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            onSelect(opt.id);
          }}
          className={`w-full text-left px-4 py-3 rounded-2xl border-2 border-b-4 text-sm font-semibold transition-all ${
            selectedId === opt.id
              ? "bg-[#58cc02]/15 border-[#58cc02] border-b-[#46a302]"
              : "bg-white border-slate-200 hover:bg-slate-50"
          } ${disabled ? "opacity-80 cursor-default" : ""}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ------- 判断题 -------

export interface TrueFalseOptionsProps {
  question: TrueFalseQuestion;
  selected: boolean | null;
  disabled?: boolean;
  onSelect: (value: boolean) => void;
}

export function TrueFalseOptions({
  selected,
  disabled,
  onSelect,
}: TrueFalseOptionsProps) {
  return (
    <div className="flex gap-3 mt-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onSelect(true);
        }}
        className={`flex-1 py-3 rounded-2xl border-2 border-b-4 font-extrabold text-sm transition-all ${
          selected === true
            ? "bg-[#58cc02]/15 border-[#58cc02] border-b-[#46a302]"
            : "bg-white border-slate-200 hover:bg-slate-50"
        } ${disabled ? "opacity-80 cursor-default" : ""}`}
      >
        对
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          onSelect(false);
        }}
        className={`flex-1 py-3 rounded-2xl border-2 border-b-4 font-extrabold text-sm transition-all ${
          selected === false
            ? "bg-[#58cc02]/15 border-[#58cc02] border-b-[#46a302]"
            : "bg-white border-slate-200 hover:bg-slate-50"
        } ${disabled ? "opacity-80 cursor-default" : ""}`}
      >
        错
      </button>
    </div>
  );
}

// ------- 填空排序题（sort） -------

export interface SortQuestionBodyProps {
  question: SortQuestion;
  blankIds: string[];
  filledByBlank: Record<string, string | null>;
  disabled?: boolean;
  onBlankClick: (blankId: string) => void;
  onOptionClick: (optionId: string) => void;
  usedOptions: Record<string, string | null>;
}

export function SortQuestionBody({
  question,
  blankIds,
  filledByBlank,
  disabled,
  onBlankClick,
  onOptionClick,
  usedOptions,
}: SortQuestionBodyProps) {
  const shuffledOptions = useMemo(
    () => shuffleArray(question.options),
    [question.id]
  );

  return (
    <>
      <div className="mb-3 text-sm text-slate-500">
        点击下面的选项填入代码中的空格。
      </div>
      <div className="bg-slate-100 rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 font-mono text-base">
          {question.codeTemplate.map((piece, index) =>
            piece.type === "text" ? (
              <span key={`text-${index}`} className="text-slate-800">
                {piece.value}
              </span>
            ) : (
              <button
                key={piece.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onBlankClick(piece.id);
                }}
                className={`h-9 min-w-[80px] px-3 bg-white border-2 rounded-xl flex items-center justify-center ${
                  filledByBlank[piece.id]
                    ? "border-[#58cc02] bg-[#58cc02]/5"
                    : "border-dashed border-slate-400"
                }`}
              >
                <span
                  className={
                    filledByBlank[piece.id]
                      ? "text-slate-800 text-sm"
                      : "text-slate-300 text-xs"
                  }
                >
                  {filledByBlank[piece.id]
                    ? question.options.find(
                        (o) => o.id === filledByBlank[piece.id]
                      )?.label
                    : "点击填入"}
                </span>
              </button>
            )
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {shuffledOptions.map((opt) => {
          const isUsed = !!usedOptions[opt.id];
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                onOptionClick(opt.id);
              }}
              className={`px-4 py-2 border-2 border-b-4 rounded-2xl font-mono text-sm ${
                isUsed
                  ? "bg-slate-100 border-slate-200 text-slate-400"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
              } ${disabled ? "opacity-80 cursor-default" : ""}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ------- 顺序排序题（order） -------

export interface OrderQuestionBodyProps {
  question: OrderQuestion;
  orderIds: string[];
  activeIndex: number | null;
  disabled?: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (index: number) => void;
}

export function OrderQuestionBody({
  question,
  orderIds,
  activeIndex,
  disabled,
  onDragStart,
  onDragOver,
  onDrop,
}: OrderQuestionBodyProps) {
  return (
    <div className="flex flex-col gap-3">
      {orderIds.map((id, index) => {
        const fragment = question.fragments.find((f) => f.id === id);
        if (!fragment) return null;
        return (
          <div
            key={fragment.id}
            className={`flex items-center justify-between gap-2 p-3 rounded-2xl border-2 bg-white ${
              activeIndex === index ? "border-[#58cc02]" : "border-slate-200"
            }`}
            draggable={!disabled}
            onDragStart={() => {
              if (disabled) return;
              onDragStart(index);
            }}
            onDragOver={(e) => {
              if (disabled) return;
              onDragOver(e);
            }}
            onDrop={() => {
              if (disabled) return;
              onDrop(index);
            }}
          >
            <span className="text-sm font-mono text-slate-800 flex-1">
              {fragment.label}
            </span>
            <svg
              viewBox="0 0 1024 1024"
              className="w-5 h-5 flex-shrink-0"
              aria-hidden
            >
              <path
                d="M153.6 237.056a32.256 32.256 0 0 1 0-64h716.8a32.256 32.256 0 0 1 0 64z m0 307.2a32.256 32.256 0 0 1 0-64h716.8a32.256 32.256 0 0 1 0 64z m0 307.2a32.256 32.256 0 0 1 0-64h716.8a32.256 32.256 0 0 1 0 64z"
                fill="#5A5A68"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

