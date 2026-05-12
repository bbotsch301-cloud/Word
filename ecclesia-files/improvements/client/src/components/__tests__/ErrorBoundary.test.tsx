import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppErrorBoundary, SectionErrorBoundary } from "../ErrorBoundary";

// Mock the error-tracking module
vi.mock("@/lib/error-tracking", () => ({
  reportError: vi.fn(),
}));

import { reportError } from "@/lib/error-tracking";

// A component that always throws
function ThrowingComponent({ message }: { message: string }): never {
  throw new Error(message);
}

// A component that conditionally throws
function ConditionalThrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Conditional error");
  }
  return <div>All good</div>;
}

// Suppress console.error during error boundary tests to keep output clean
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("AppErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <AppErrorBoundary>
        <div>Working content</div>
      </AppErrorBoundary>
    );

    expect(screen.getByText("Working content")).toBeInTheDocument();
  });

  it("shows fallback UI when a child throws an error", () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent message="Test error message" />
      </AppErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("displays the error message from the thrown error", () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent message="Database connection failed" />
      </AppErrorBoundary>
    );

    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });

  it("shows a Try Again button in the fallback", () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent message="Oops" />
      </AppErrorBoundary>
    );

    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });

  it("calls reportError when an error is caught", () => {
    render(
      <AppErrorBoundary>
        <ThrowingComponent message="Tracked error" />
      </AppErrorBoundary>
    );

    expect(reportError).toHaveBeenCalled();
    const errorArg = vi.mocked(reportError).mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toBe("Tracked error");
  });

  it("resets and re-renders children when Try Again is clicked", async () => {
    const user = userEvent.setup();

    // We need a component that can toggle between throwing and not
    let shouldThrow = true;

    function ToggleableComponent() {
      if (shouldThrow) {
        throw new Error("Will recover");
      }
      return <div>Recovered content</div>;
    }

    const { rerender } = render(
      <AppErrorBoundary>
        <ToggleableComponent />
      </AppErrorBoundary>
    );

    // Verify fallback is shown
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Fix the error condition
    shouldThrow = false;

    // Click Try Again
    await user.click(screen.getByRole("button", { name: "Try Again" }));

    // After reset, the component should render successfully
    expect(screen.getByText("Recovered content")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });
});

describe("SectionErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <SectionErrorBoundary>
        <div>Section content</div>
      </SectionErrorBoundary>
    );

    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("catches errors and shows fallback UI", () => {
    render(
      <SectionErrorBoundary>
        <ThrowingComponent message="Section broke" />
      </SectionErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Section broke")).toBeInTheDocument();
  });

  it("does not affect sibling components outside the boundary", () => {
    render(
      <div>
        <div>Outside content</div>
        <SectionErrorBoundary>
          <ThrowingComponent message="Inner error" />
        </SectionErrorBoundary>
      </div>
    );

    expect(screen.getByText("Outside content")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("calls reportError with componentStack context", () => {
    render(
      <SectionErrorBoundary>
        <ThrowingComponent message="Tracked section error" />
      </SectionErrorBoundary>
    );

    expect(reportError).toHaveBeenCalled();
    const callArgs = vi.mocked(reportError).mock.calls[0];
    expect(callArgs[0].message).toBe("Tracked section error");
    // The second argument should contain componentStack info
    expect(callArgs[1]).toBeDefined();
  });
});
