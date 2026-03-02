import { parts } from "@/app/course-data";
import PreparePageClient from "./PreparePageClient";

export function generateStaticParams() {
  return parts.map((part) => ({
    partId: part.id,
  }));
}

export default function PreparePage() {
  return <PreparePageClient />;
}

