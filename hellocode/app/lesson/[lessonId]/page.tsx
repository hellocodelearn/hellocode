import { Suspense } from "react";
import { course } from "@/app/course-data";
import LessonPageClient from "./LessonPageClient";

/** 静态导出（Capacitor）要求动态路由提供 generateStaticParams，预生成所有 lesson 路径 */
export function generateStaticParams() {
  return course.stages[0].lessons.map((lesson) => ({
    lessonId: lesson.id,
  }));
}

export default function LessonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f5f7f8] text-slate-600">加载中...</div>}>
      <LessonPageClient />
    </Suspense>
  );
}
