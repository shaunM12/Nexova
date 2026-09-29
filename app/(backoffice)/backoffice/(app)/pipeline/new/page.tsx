import type { Metadata } from "next";
import { SectionErrorBoundary } from "@/components/backoffice/shell/ErrorBoundary";
import { NewCandidate } from "@/components/backoffice/pipeline/NewCandidate";

export const metadata: Metadata = {
  title: "New candidate",
};

export default function NewCandidatePage() {
  return (
    <SectionErrorBoundary title="The new candidate form">
      <NewCandidate />
    </SectionErrorBoundary>
  );
}
