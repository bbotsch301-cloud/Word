import { useState, useEffect, useCallback } from "react";
import {
  Crown,
  Heart,
  Shield,
  BookOpen,
  Handshake,
  Award,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════
// STEP DATA
// ═══════════════════════════════════════════════════════════

interface CovenantStep {
  step: number;
  title: string;
  role: string;
  scripture: string;
  scriptureRef: string;
  description: string;
  icon: LucideIcon;
}

const STEPS: CovenantStep[] = [
  {
    step: 1,
    title: "God — Architect & Author",
    role: "The One who conceived and authored the covenant framework",
    scripture:
      "I will make a new covenant with the house of Israel, and with the house of Judah",
    scriptureRef: "Jeremiah 31:31",
    description:
      "God is the supreme Architect who designed and decreed the New Covenant before the foundation of the world. He authored the framework of redemption.",
    icon: Crown,
  },
  {
    step: 2,
    title: "Christ — Testator & Mediator",
    role: "His death activated the testament; He mediates as High Priest",
    scripture:
      "For where a testament is, there must also of necessity be the death of the testator",
    scriptureRef: "Hebrews 9:16",
    description:
      "Christ's death on the cross activated the testament. As the Testator, His blood ratified the covenant. As Mediator and High Priest, He now administers it on our behalf.",
    icon: Heart,
  },
  {
    step: 3,
    title: "Holy Spirit — Executor, Seal & Guarantor",
    role: "He executes the covenant, seals believers, and guarantees the inheritance",
    scripture:
      "Ye were sealed with that holy Spirit of promise, which is the earnest of our inheritance",
    scriptureRef: "Ephesians 1:13–14",
    description:
      "The Holy Spirit is the Executor of the trust. He seals every believer as proof of ownership and serves as the earnest — the down payment and guarantee — of the full inheritance to come.",
    icon: Shield,
  },
  {
    step: 4,
    title: "The New Covenant — The Trust Instrument",
    role: "The divine document establishing the terms and promises",
    scripture:
      "He is the mediator of a better covenant, which was established upon better promises",
    scriptureRef: "Hebrews 8:6",
    description:
      "The Bible — specifically the New Testament — IS the pre-existing trust instrument. Not a human document, but a divine one, containing every term, promise, and provision of the covenant.",
    icon: BookOpen,
  },
  {
    step: 5,
    title: "Your Acceptance — The Granting Act",
    role: "By faith, confession, and baptism you accept the covenant",
    scripture:
      "We are buried with him by baptism into death: that like as Christ was raised up from the dead by the glory of the Father, even so we also should walk in newness of life",
    scriptureRef: "Romans 6:4",
    description:
      "By faith, confession, and baptism, you accept the covenant. This IS the granting act. You deposit the old man, the body of sin, and all property into the trust.",
    icon: Handshake,
  },
  {
    step: 6,
    title: "You — Grantor & Beneficiary",
    role: "Having granted, you simultaneously become the beneficiary",
    scripture:
      "If children, then heirs; heirs of God, and joint-heirs with Christ",
    scriptureRef: "Romans 8:17",
    description:
      "Having made the granting act, you simultaneously become the beneficiary. Your Beneficial Unit is your receipt of the inheritance — joint-heir with Christ.",
    icon: Award,
  },
];

// ═══════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════

interface CovenantChainDiagramProps {
  /**
   * When provided (1-6), controls the walk-through state:
   * - Steps below activeStep show as "completed" (with checkmark)
   * - The activeStep itself glows / pulses
   * - Steps above activeStep are dimmed / grayed
   * - Omit to show all steps as equally active (no walk-through)
   */
  activeStep?: number;
  /** Callback fired when a step node is clicked (receives 1-based step number) */
  onStepClick?: (step: number) => void;
  /** Compact horizontal layout — icons + short titles in a row, for dashboard embedding */
  compact?: boolean;
  /** Additional className for the root container */
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// CONNECTOR ARROW (vertical, between full-size cards)
// ═══════════════════════════════════════════════════════════

function ConnectorArrow({ dimmed }: { dimmed?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center py-1 transition-opacity duration-500",
        dimmed ? "opacity-20" : "opacity-100",
      )}
    >
      <div className="w-px h-6 border-l-2 border-dashed border-royal-gold/50" />
      <ChevronDown className="w-5 h-5 text-royal-gold/80 -mt-1.5" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP NODE (full vertical card)
// ═══════════════════════════════════════════════════════════

function StepNode({
  data,
  state,
  onClick,
  animationDelay,
}: {
  data: CovenantStep;
  state: "completed" | "active" | "future";
  onClick?: () => void;
  animationDelay: number;
}) {
  const Icon = data.icon;
  const isActive = state === "active";
  const isCompleted = state === "completed";
  const isFuture = state === "future";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "covenant-fade-in relative w-full max-w-2xl rounded-xl border overflow-hidden transition-all duration-500",
        onClick && "cursor-pointer hover:shadow-lg",
        isActive &&
          "border-royal-gold shadow-lg shadow-royal-gold/20 ring-2 ring-royal-gold/40 scale-[1.01]",
        isCompleted && "border-royal-gold/40 shadow-md",
        isFuture && "border-gray-200 opacity-40 saturate-0",
      )}
      style={{ animationDelay: `${animationDelay}s` }}
      aria-label={`Step ${data.step}: ${data.title}`}
    >
      {/* Active step glow pulse */}
      {isActive && (
        <div className="covenant-pulse absolute inset-0 rounded-xl pointer-events-none" />
      )}

      <div className="grid md:grid-cols-[100px,1fr] items-stretch">
        {/* Left column: icon + step badge */}
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 md:p-5",
            isActive
              ? "bg-gradient-to-b from-royal-gold/20 to-royal-gold/10"
              : isCompleted
                ? "bg-royal-gold/10"
                : "bg-gray-50",
          )}
        >
          <div className="relative">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-500",
                isActive && "bg-royal-gold/25",
                isCompleted && "bg-royal-gold/15",
                isFuture && "bg-gray-100",
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-colors duration-500",
                  isActive && "text-royal-gold",
                  isCompleted && "text-royal-gold/70",
                  isFuture && "text-gray-300",
                )}
              />
            </div>
            {/* Completed checkmark overlay */}
            {isCompleted && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          <span
            className={cn(
              "text-xs font-bold tracking-wider uppercase transition-colors duration-500",
              isActive && "text-royal-gold",
              isCompleted && "text-royal-gold/60",
              isFuture && "text-gray-300",
            )}
          >
            Step {data.step}
          </span>
        </div>

        {/* Right column: title, description, scripture */}
        <div className="p-4 md:p-5 bg-white">
          <h3
            className={cn(
              "font-cinzel text-base md:text-lg font-bold transition-colors duration-500",
              isActive && "text-royal-navy",
              isCompleted && "text-royal-navy/80",
              isFuture && "text-gray-400",
            )}
          >
            {data.title}
          </h3>
          <p
            className={cn(
              "text-xs mt-0.5 transition-colors duration-500",
              isActive && "text-royal-gold",
              isCompleted && "text-gray-400",
              isFuture && "text-gray-300",
            )}
          >
            {data.role}
          </p>

          <p
            className={cn(
              "text-sm mt-3 leading-relaxed transition-colors duration-500",
              isActive && "text-gray-600",
              isCompleted && "text-gray-500",
              isFuture && "text-gray-300",
            )}
          >
            {data.description}
          </p>

          {/* Scripture reference */}
          <div
            className={cn(
              "mt-3 border-l-2 pl-3 py-1 transition-all duration-500",
              isActive && "border-royal-gold bg-royal-gold/5",
              isCompleted && "border-royal-gold/30 bg-royal-gold/5",
              isFuture && "border-gray-200 bg-gray-50",
            )}
          >
            <p
              className={cn(
                "text-sm italic font-georgia leading-relaxed transition-colors duration-500",
                isActive && "text-royal-navy/80",
                isCompleted && "text-gray-500",
                isFuture && "text-gray-300",
              )}
            >
              &ldquo;{data.scripture}&rdquo;
            </p>
            <p
              className={cn(
                "text-xs font-semibold mt-1 transition-colors duration-500",
                isActive && "text-royal-gold",
                isCompleted && "text-royal-gold/50",
                isFuture && "text-gray-300",
              )}
            >
              {data.scriptureRef} (KJV)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPACT NODE (horizontal icon + short title)
// ═══════════════════════════════════════════════════════════

function CompactNode({
  data,
  state,
  onClick,
  animationDelay,
}: {
  data: CovenantStep;
  state: "completed" | "active" | "future";
  onClick?: () => void;
  animationDelay: number;
}) {
  const Icon = data.icon;
  const isActive = state === "active";
  const isCompleted = state === "completed";
  const isFuture = state === "future";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "covenant-fade-in flex flex-col items-center gap-1.5 transition-all duration-500 min-w-0",
        onClick && "cursor-pointer",
        isFuture && "opacity-35 saturate-0",
      )}
      style={{ animationDelay: `${animationDelay}s` }}
      aria-label={`Step ${data.step}: ${data.title}`}
    >
      <div className="relative">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
            isActive &&
              "bg-royal-gold/20 ring-2 ring-royal-gold/50 shadow-md shadow-royal-gold/20 covenant-pulse",
            isCompleted && "bg-royal-gold/10",
            isFuture && "bg-gray-100",
          )}
        >
          <Icon
            className={cn(
              "w-5 h-5 transition-colors duration-500",
              isActive && "text-royal-gold",
              isCompleted && "text-royal-gold/60",
              isFuture && "text-gray-300",
            )}
          />
        </div>
        {isCompleted && (
          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <span
        className={cn(
          "text-[10px] leading-tight font-cinzel font-bold text-center max-w-[80px] transition-colors duration-500",
          isActive && "text-royal-navy",
          isCompleted && "text-royal-navy/60",
          isFuture && "text-gray-300",
        )}
      >
        {data.title.split(" ")[0].split(" — ")[0]}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPACT CONNECTOR (horizontal arrow between compact nodes)
// ═══════════════════════════════════════════════════════════

function CompactConnector({ dimmed }: { dimmed?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center px-0.5 transition-opacity duration-500",
        dimmed ? "opacity-20" : "opacity-100",
      )}
    >
      <div className="w-4 h-px bg-royal-gold/50" />
      <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-royal-gold/50" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CSS KEYFRAMES (injected once via <style>, no external deps)
// ═══════════════════════════════════════════════════════════

function CovenantKeyframes() {
  return (
    <style>{`
      @keyframes covenantFadeIn {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes covenantPulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(181, 149, 72, 0.15);
        }
        50% {
          box-shadow: 0 0 20px 4px rgba(181, 149, 72, 0.1);
        }
      }

      .covenant-fade-in {
        animation: covenantFadeIn 0.5s ease-out both;
      }

      .covenant-pulse {
        animation: covenantPulse 2.5s ease-in-out infinite;
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function CovenantChainDiagram({
  activeStep,
  onStepClick,
  compact = false,
  className,
}: CovenantChainDiagramProps) {
  // Track previous activeStep so newly-revealed steps animate in fresh
  const [prevActiveStep, setPrevActiveStep] = useState<number | undefined>(activeStep);

  useEffect(() => {
    setPrevActiveStep(activeStep);
  }, [activeStep]);

  const getStepState = useCallback(
    (stepNumber: number): "completed" | "active" | "future" => {
      if (activeStep === undefined) {
        // No walk-through: every step shows as equally active
        return "active";
      }
      if (stepNumber < activeStep) return "completed";
      if (stepNumber === activeStep) return "active";
      return "future";
    },
    [activeStep],
  );

  // ─── COMPACT LAYOUT (horizontal icons + titles) ────────
  if (compact) {
    return (
      <>
        <div
          className={cn(
            "flex items-center justify-center flex-wrap gap-y-3",
            className,
          )}
          role="list"
          aria-label="Covenant Chain Steps"
        >
          {STEPS.map((step, idx) => {
            const state = getStepState(step.step);
            return (
              <div key={step.step} className="flex items-center" role="listitem">
                <CompactNode
                  data={step}
                  state={state}
                  onClick={onStepClick ? () => onStepClick(step.step) : undefined}
                  animationDelay={idx * 0.08}
                />
                {idx < STEPS.length - 1 && (
                  <CompactConnector dimmed={state === "future"} />
                )}
              </div>
            );
          })}
        </div>
        <CovenantKeyframes />
      </>
    );
  }

  // ─── FULL VERTICAL LAYOUT ──────────────────────────────
  return (
    <>
      <div
        className={cn("flex flex-col items-center gap-0 py-4", className)}
        role="list"
        aria-label="Covenant Chain — The 6 Steps of the New Covenant Trust"
      >
        {STEPS.map((step, idx) => {
          const state = getStepState(step.step);

          // Stagger: base index delay, but newly-revealed steps get 0 delay
          const isNewlyRevealed =
            prevActiveStep !== undefined &&
            activeStep !== undefined &&
            step.step === activeStep &&
            prevActiveStep < activeStep;
          const delay = isNewlyRevealed ? 0 : idx * 0.12;

          return (
            <div
              key={step.step}
              className="w-full flex flex-col items-center"
              role="listitem"
            >
              <StepNode
                data={step}
                state={state}
                onClick={onStepClick ? () => onStepClick(step.step) : undefined}
                animationDelay={delay}
              />
              {idx < STEPS.length - 1 && (
                <ConnectorArrow
                  dimmed={activeStep !== undefined && step.step >= activeStep}
                />
              )}
            </div>
          );
        })}
      </div>
      <CovenantKeyframes />
    </>
  );
}
