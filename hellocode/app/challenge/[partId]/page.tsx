import { parts } from "@/app/course-data";
import ChallengePageClient from "./ChallengePageClient";

export function generateStaticParams() {
  return parts.map((part) => ({
    partId: part.id,
  }));
}

export default function ChallengePage() {
  return <ChallengePageClient />;
}

