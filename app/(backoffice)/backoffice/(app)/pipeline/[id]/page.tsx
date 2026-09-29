import type { Metadata } from "next";
import { SectionErrorBoundary } from "@/components/backoffice/shell/ErrorBoundary";
import { CandidateDetail } from "@/components/backoffice/pipeline/CandidateDetail";

export const metadata: Metadata = {
  title: "Candidate",
};

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SectionErrorBoundary title="This candidate">
      <CandidateDetail id={decodeURIComponent(id)} />
    </SectionErrorBoundary>
  );
}
