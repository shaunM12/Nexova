"use client";

import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface BoundaryProps {
  title: string;
  onReset: () => void;
  children: ReactNode;
}

class Boundary extends Component<BoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[backoffice] ${this.props.title} crashed`, error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div role="alert" className="rounded-lg border border-danger/30 bg-white p-4 text-sm">
        <p className="font-medium text-ink">{this.props.title} couldn&apos;t be displayed.</p>
        <p className="mt-1 text-ink-muted">Something went wrong on our side.</p>
        <button
          type="button"
          onClick={() => {
            this.props.onReset();
            this.setState({ hasError: false });
          }}
          className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium text-ink hover:bg-fog focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide"
        >
          Try again
        </button>
      </div>
    );
  }
}

/** Scoped boundary: a crash in one section never blanks the whole page. */
export function SectionErrorBoundary({ title, children }: { title: string; children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Boundary title={title} onReset={reset}>
          {children}
        </Boundary>
      )}
    </QueryErrorResetBoundary>
  );
}
