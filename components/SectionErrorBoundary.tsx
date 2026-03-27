"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Section render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="bg-surface border border-border rounded-lg p-4 text-sm text-text-muted">
          This section failed to load.
        </div>
      );
    }
    return this.props.children;
  }
}
