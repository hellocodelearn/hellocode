import { parts } from "@/app/course-data";
import ChallengePlayPageClient from "./ChallengePlayPageClient";

export function generateStaticParams() {
  return parts.map((part) => ({
    partId: part.id,
  }));
}

export default function ChallengePlayPage() {
  return <ChallengePlayPageClient />;
}

