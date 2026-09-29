import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionErrorBoundary } from "@/components/backoffice/shell/ErrorBoundary";
import { PipelineList } from "@/components/backoffice/pipeline/PipelineList";
import { ListSkeleton } from "@/components/backoffice/pipeline/States";

export const metadata: Metadata = {
  title: "Pipeline",
};

export default function PipelinePage() {
  return (
    <SectionErrorBoundary title="The candidate list">
      <Suspense fallback={<ListSkeleton />}>
        <PipelineList />
      </Suspense>
    </SectionErrorBoundary>
  );
}
