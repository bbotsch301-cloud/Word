import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import HeroSection from "@/components/ui/hero-section";
import ScriptureQuote from "@/components/ui/scripture-quote";
import CovenantChainDiagram from "@/components/covenant-chain-diagram";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Crown, Heart, Shield, BookOpen, Handshake, Award,
  CheckCircle, ArrowRight, ChevronDown, LogIn, UserPlus
} from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

const registrationSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationData = z.infer<typeof registrationSchema>;

interface WalkStep {
  id: string;
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  scripture: string;
  scriptureRef: string;
  connectionToNext?: string;
  teaching: string[];
}

const walkSteps: WalkStep[] = [
  {
    id: "god",
    number: 1,
    title: "God — The Architect",
    icon: Crown,
    scripture:
      "Behold, the days come, saith the LORD, that I will make a new covenant with the house of Israel, and with the house of Judah: Not according to the covenant that I made with their fathers in the day that I took them by the hand to bring them out of the land of Egypt; which my covenant they brake, although I was an husband unto them, saith the LORD: But this shall be the covenant that I will make with the house of Israel; After those days, saith the LORD, I will put my law in their inward parts, and write it in their hearts; and will be their God, and they shall be my people.",
    scriptureRef: "Jeremiah 31:31-33 (KJV)",
    connectionToNext:
      "God drew the blueprints. But a plan on paper needs someone to bring it to life. That is where His Son enters the story.",
    teaching: [
      "Before a single brick is laid, an architect sits down and draws the plans. Every wall, every doorway, every room exists first in the architect’s mind. The house is real — it just hasn’t been built yet. That is exactly what God did with the New Covenant. Hundreds of years before Jesus walked the earth, God spoke through the prophet Jeremiah and announced: “I will make a new covenant.” Not “I might.” Not “I hope to.” He said “I will.” The plans were drawn.",
      "This matters more than most people realize. The New Covenant was not a reaction to human failure. It was not Plan B after the Old Covenant didn’t work out. God is the Architect, and He designed the entire framework from the beginning. He knew exactly how it would work, who it was for, and what it would accomplish. He promised to write His law on human hearts — not on stone tablets that could be broken, but on the inside of people, where it could never be erased.",
      "Think about what that means for you. The covenant you are about to walk through was designed by the Creator of the universe. It was not invented by a committee. It was not drafted by lawyers. It was authored by the same God who spoke light into existence. And He designed it specifically so that you could enter into it. The house was drawn with you in mind, long before you ever knew it existed.",
      "When you understand that God is the Architect, everything changes. You stop wondering if the covenant is strong enough to hold you. You stop asking if it was really meant for someone like you. The Architect does not make mistakes. The plans are flawless. And they have been waiting for you."
    ],
  },
  {
    id: "christ",
    number: 2,
    title: "Christ — The Testator & Mediator",
    icon: Heart,
    scripture:
      "For where a testament is, there must also of necessity be the death of the testator. For a testament is of force after men are dead: otherwise it is of no strength at all while the testator liveth.",
    scriptureRef: "Hebrews 9:16-17 (KJV)",
    connectionToNext:
      "Christ’s death activated the covenant. But who carries out its terms day by day? That role belongs to the Holy Spirit.",
    teaching: [
      "Imagine a wealthy father writes a will leaving everything to his children. The document is signed, witnessed, and locked in a vault. But here is the hard truth that the law recognizes: that will means nothing while the father is still alive. It is just a piece of paper with promises. It only becomes powerful — it only takes effect — when the one who wrote it dies. That is exactly what Scripture tells us about Christ and the New Covenant.",
      "Jesus Christ is the Testator. He is the one who authored the terms of the inheritance with His own authority. But unlike any earthly will, He did not write it and then wait for old age to take Him. He laid down His life willingly, on the cross, at the appointed time. And in that moment, the will was activated. Every promise God made through Jeremiah, every blessing stored up in the covenant — it all came into force the moment Christ breathed His last.",
      "But Christ is not only the Testator. He is also the Mediator — the one who stands between God and man, ensuring that the terms of the covenant are carried out faithfully. In earthly courts, a mediator is a neutral party who makes sure both sides are heard. Christ does something far greater: He represents you before God the Father, and He represents God’s promises to you. He stands in the gap, forever.",
      "And here is where it gets even more remarkable. Christ did not stay dead. He rose again and continues as our High Priest, administering this covenant for eternity. The will was activated by His death, but it is administered by His life. He is not a distant figure from history. He is alive, He is interceding for you, and He is making sure that every single promise in that covenant reaches the people it was written for."
    ],
  },
  {
    id: "holy-spirit",
    number: 3,
    title: "The Holy Spirit — Executor, Seal & Guarantor",
    icon: Shield,
    scripture:
      "In whom ye also trusted, after that ye heard the word of truth, the gospel of your salvation: in whom also after that ye believed, ye were sealed with that holy Spirit of promise, Which is the earnest of our inheritance until the redemption of the purchased possession, unto the praise of his glory.",
    scriptureRef: "Ephesians 1:13-14 (KJV)",
    connectionToNext:
      "The Spirit carries out the terms. But what is the document that governs everything? That is the New Covenant itself — the trust instrument.",
    teaching: [
      "When someone passes away and their will is activated, the family does not just read the document and hope for the best. An executor is appointed — someone with the legal authority to carry out every term, distribute every asset, and make sure the wishes of the deceased are honored to the letter. In the New Covenant, the Holy Spirit is that Executor. He is the one who takes the activated promises of Christ’s testament and delivers them into your life.",
      "But the Spirit does more than just execute the terms. Scripture says He seals you. Think of a notary’s seal on an official document. That seal does not add content to the document — it proves that the document is authentic, that it has been officially witnessed and verified. When the Holy Spirit seals you, He is marking you as genuine. He is God’s stamp of authenticity on your life, telling every principality and power: “This one belongs to Me. This covenant is real. This inheritance is valid.”",
      "And there is a third role that might be the most encouraging of all. The Spirit is the “earnest” — the down payment, the guarantee — of your inheritance. In real estate, when you put down earnest money on a house, you are saying: “I am committed. The full payment is coming.” The Holy Spirit living inside you is God’s earnest money. He is proof that the full inheritance is on its way. You do not just have a promise written on paper somewhere. You have the living Spirit of God dwelling in you as a guarantee that everything Christ died to give you will be yours in full.",
      "This is why the presence of the Holy Spirit in your life is so significant. He is not a feeling. He is not an experience you had one time at a church service. He is the Executor of your covenant, the Seal of your identity, and the Guarantee of your inheritance. Every time you sense His leading, every time He convicts or comforts you, He is doing His job — administering the terms of the New Covenant in your life."
    ],
  },
  {
    id: "new-covenant",
    number: 4,
    title: "The New Covenant — The Trust Instrument",
    icon: BookOpen,
    scripture:
      "But now hath he obtained a more excellent ministry, by how much also he is the mediator of a better covenant, which was established upon better promises.",
    scriptureRef: "Hebrews 8:6 (KJV)",
    connectionToNext:
      "The trust instrument exists. The roles are filled. Now there is only one question: will you accept it? That is the next step.",
    teaching: [
      "In trust law, there is a critical document called the “trust instrument.” It is the founding document that creates the trust, defines its terms, names the parties, and governs everything that happens within it. Without the trust instrument, there is no trust. It is the foundation on which everything else rests. The New Covenant — as recorded in the New Testament — IS that trust instrument.",
      "This is what sets the New Covenant apart from every human legal structure. It was not drafted by attorneys in a conference room. It was not written by a legislature or voted on by a committee. It was authored by God, spoken through prophets, fulfilled by Christ, and recorded by men who were carried along by the Holy Spirit. The trust instrument pre-exists your involvement. You did not create it. You did not negotiate its terms. It was established and waiting for you before you were ever born.",
      "Think about what this means practically. When you enter into the New Covenant, you are not starting something new. You are entering something that God already built. The terms are already set. The promises are already ratified by the blood of Christ. The Executor is already appointed. You are walking into a fully furnished house — all you have to do is accept the keys.",
      "Scripture says Christ is the Mediator of a “better covenant, established upon better promises.” Better than what? Better than the Old Covenant, which was written on stone and depended on human obedience. The New Covenant is written on hearts and powered by the Spirit. It is better because it was designed by a better Architect, activated by a better Testator, and executed by a better Executor. The trust instrument is perfect, because its Author is perfect."
    ],
  },
  {
    id: "acceptance",
    number: 5,
    title: "Your Acceptance — The Granting Act",
    icon: Handshake,
    scripture:
      "Know ye not, that so many of us as were baptized into Jesus Christ were baptized into his death? Therefore we are buried with him by baptism into death: that like as Christ was raised up from the dead by the glory of the Father, even so we also should walk in newness of life.",
    scriptureRef: "Romans 6:3-4 (KJV)",
    connectionToNext:
      "You have given everything. Now see what you receive in return. The Grantor becomes the Beneficiary.",
    teaching: [
      "This is the pivotal step. Everything up to this point has been God’s work — the Architect designing, the Testator dying, the Spirit sealing, the covenant standing ready. Now it is your turn. When you accept the New Covenant — by faith, by confession, by baptism — you perform what trust law calls the “granting act.” You are the Grantor. And what you grant is everything.",
      "In trust law, the grantor is the one who transfers assets into the trust. So what do you transfer? Your old self. Your old identity. Your old way of living. Your body, which becomes the temple of the Holy Spirit. Your labor, your property, your very life. This is not a metaphor. Baptism represents the most literal transaction there is: the death of the old man and the resurrection of the new. You go down into the water as one person and come up as another. The old you is deposited into death. The new you rises in Christ.",
      "Many people treat salvation like signing a membership card. They think they are joining an organization or agreeing to a set of beliefs. But the New Covenant is not a club. It is a trust. And entering a trust requires a granting act — you must actually put something in. What you put in is yourself. All of yourself. Your past, your sins, your ambitions, your fears, your plans. You lay it all down. That is what Paul means when he says you are “buried with Him by baptism into death.”",
      "This is the most real transaction you will ever make. More real than any contract you have signed, any mortgage you have taken, any promise you have made. Because in this transaction, you are not exchanging money for goods. You are exchanging your old life for a new one. You are transferring your broken identity into a trust governed by the living God. And the moment you do it — the moment you make that granting act — everything changes. You become the Grantor. And that changes what you receive.",
    ],
  },
  {
    id: "you",
    number: 6,
    title: "You — Grantor & Beneficiary",
    icon: Award,
    scripture:
      "And if children, then heirs; heirs of God, and joint-heirs with Christ; if so be that we suffer with him, that we may be also glorified together.",
    scriptureRef: "Romans 8:17 (KJV)",
    teaching: [
      "Here is the beautiful paradox at the heart of the New Covenant: by giving everything away, you receive everything back. The Grantor simultaneously becomes the Beneficiary. You deposited your old life into the trust, and now the trust pays out your inheritance. You are an heir of God. A joint-heir with Christ. Not because you earned it, not because you deserve it, but because you accepted the covenant and made the granting act.",
      "Think about what “joint-heir with Christ” actually means. In legal terms, a joint-heir shares equally in the inheritance. Whatever Christ inherits, you inherit. His authority, His standing before the Father, His victory over death — it all belongs to you too. Your Beneficial Unit in the trust represents your share of the entire inheritance of the Kingdom of God. Not a fraction. Not leftovers. A full share, because that is what the Testator specified in His will.",
      "This is grace expressed in trust law. You did not build the house — God was the Architect. You did not activate the will — Christ was the Testator. You did not appoint yourself — the Spirit sealed you. You did not write the covenant — it was established on better promises before you arrived. All you did was accept it. All you did was grant your old self into the trust. And because of that one act of faith, you went from outsider to heir. From broken to whole. From lost to found. From nobody to a child of the King.",
      "This is your identity now. Not who the world says you are. Not who your past says you are. You are a Grantor-Beneficiary of the New Covenant Trust. You gave everything, and you received everything back — and infinitely more. Walk in that truth. Live from that identity. Because the Architect designed it, the Testator died for it, the Spirit sealed it, the covenant governs it, and your acceptance activated it. The walk is complete. The inheritance is yours."
    ],
  },
];

export default function NewCovenantIntro() {
  usePageTitle("The Covenant Walk");
  const { user, isAuthenticated, login, register, isLoggingIn, isRegistering } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [walkComplete, setWalkComplete] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Check localStorage for prior completion
  useEffect(() => {
    const done = localStorage.getItem("covenantWalkCompleted");
    if (done === "true") {
      setCompletedSteps([0, 1, 2, 3, 4, 5]);
      setWalkComplete(true);
    }
  }, []);

  const progressPercentage = (completedSteps.length / 6) * 100;

  const handleUnderstand = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      const updated = [...completedSteps, stepIndex];
      setCompletedSteps(updated);

      if (stepIndex < 5) {
        setCurrentStep(stepIndex + 1);
        // Scroll to next step after a brief delay for the animation
        setTimeout(() => {
          stepRefs.current[stepIndex + 1]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 150);
      } else {
        // Final step completed
        setWalkComplete(true);
        localStorage.setItem("covenantWalkCompleted", "true");
      }
    }
  };

  const loginForm = useForm({
    mode: "onBlur",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm({
    mode: "onBlur",
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      privacyAccepted: undefined as unknown as true,
    },
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    try {
      await login(data);
      setShowAuthDialog(false);
      toast({
        title: "Welcome back!",
        description: "You can now access all course materials.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const onRegister = async (data: RegistrationData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
      setShowAuthDialog(false);
      toast({
        title: "Account created!",
        description: "Welcome to Ecclesia Basilikos. You can now access all course materials.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <HeroSection
        title="The Covenant Walk"
        description="Understand your identity. Six steps from God's promise to your inheritance."
        backgroundImage="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
      />

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Chain Diagram */}
          <div className="mb-12">
            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle className="font-cinzel text-xl text-royal-navy">
                  The Six-Step Chain
                </CardTitle>
                <CardDescription>
                  Follow the chain from God's design to your inheritance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CovenantChainDiagram
                  activeStep={currentStep + 1}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content: The Walk */}
            <div className="lg:col-span-2 space-y-6">
              {walkSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(index);
                const isActive = currentStep === index;
                const isRevealed = isActive || isCompleted || completedSteps.includes(index - 1) || index === 0;
                const isExpanded = isActive && !isCompleted;

                return (
                  <div
                    key={step.id}
                    id={`step-${index}`}
                    ref={(el) => { stepRefs.current[index] = el; }}
                    className={`transition-all duration-500 ${
                      isRevealed ? "opacity-100" : "opacity-30 pointer-events-none"
                    }`}
                  >
                    <Card
                      className={`overflow-hidden transition-all duration-300 ${
                        isActive && !isCompleted
                          ? "ring-2 ring-royal-gold shadow-lg"
                          : isCompleted
                            ? "border-green-200 bg-green-50/30"
                            : ""
                      }`}
                    >
                      {/* Step Header */}
                      <CardHeader
                        className={`cursor-pointer select-none ${
                          isCompleted ? "pb-3" : ""
                        }`}
                        onClick={() => {
                          if (isCompleted) {
                            // Allow re-reading completed steps
                            setCurrentStep(index);
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isActive
                                  ? "bg-royal-gold text-royal-navy"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Icon className="h-6 w-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  isCompleted
                                    ? "border-green-500 text-green-700"
                                    : isActive
                                      ? "border-royal-gold text-royal-navy"
                                      : "border-gray-300 text-gray-400"
                                }`}
                              >
                                Step {step.number}
                              </Badge>
                              {isCompleted && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  Complete
                                </Badge>
                              )}
                            </div>
                            <h3
                              className={`font-cinzel text-xl font-bold mt-1 transition-colors duration-300 ${
                                isCompleted || isActive
                                  ? "text-royal-navy"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.title}
                            </h3>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-300 text-gray-400 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </CardHeader>

                      {/* Expandable Content */}
                      <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          isExpanded
                            ? "max-h-[3000px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <CardContent className="pt-0 pb-6">
                          {/* Teaching Content */}
                          <div className="space-y-4 mb-8">
                            {step.teaching.map((paragraph, pIndex) => (
                              <p
                                key={pIndex}
                                className="text-gray-700 leading-relaxed text-base"
                              >
                                {paragraph}
                              </p>
                            ))}
                          </div>

                          {/* Key Scripture */}
                          <div className="bg-royal-navy/5 border-l-4 border-royal-gold rounded-r-lg p-6 mb-8">
                            <p className="text-xs font-semibold text-royal-gold uppercase tracking-wider mb-3">
                              Key Scripture
                            </p>
                            <blockquote className="font-georgia italic text-gray-800 leading-relaxed text-lg mb-3">
                              &ldquo;{step.scripture}&rdquo;
                            </blockquote>
                            <cite className="text-royal-gold font-semibold text-sm">
                              {step.scriptureRef}
                            </cite>
                          </div>

                          {/* Connection to Next Step */}
                          {step.connectionToNext && (
                            <p className="text-sm text-gray-500 italic mb-6 flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-royal-gold" />
                              {step.connectionToNext}
                            </p>
                          )}

                          {/* I Understand Button */}
                          <Button
                            onClick={() => handleUnderstand(index)}
                            className="w-full sm:w-auto bg-royal-gold hover:bg-royal-gold/80 text-royal-navy font-semibold px-8 py-3 text-base"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            I Understand
                            {index < 5 && (
                              <>
                                <span className="mx-2">&mdash;</span>
                                Continue to Step {index + 2}
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                );
              })}

              {/* Completion Section */}
              <div
                className={`transition-all duration-700 ease-in-out ${
                  walkComplete
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8 pointer-events-none max-h-0 overflow-hidden"
                }`}
              >
                <Card className="border-2 border-royal-gold bg-gradient-to-br from-royal-navy/5 to-royal-gold/10">
                  <CardContent className="pt-8 pb-8 text-center">
                    <div className="w-20 h-20 bg-royal-gold rounded-full flex items-center justify-center mx-auto mb-6">
                      <Award className="h-10 w-10 text-royal-navy" />
                    </div>
                    <h2 className="font-cinzel text-3xl font-bold text-royal-navy mb-4">
                      You&rsquo;ve Walked the Covenant
                    </h2>
                    <p className="text-lg text-gray-700 mb-2 max-w-xl mx-auto">
                      You understand your identity as Grantor-Beneficiary.
                    </p>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                      God designed it. Christ activated it. The Spirit sealed it. The covenant governs it.
                      You accepted it. And now the inheritance is yours.
                    </p>
                    <Link href={isAuthenticated ? "/welcome" : "/courses"}>
                      <Button className="bg-royal-navy hover:bg-royal-navy/80 text-white px-10 py-4 text-lg font-semibold">
                        Begin Your Journey
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Progress Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                  <CardDescription>Track your walk through the covenant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Steps Completed</p>
                      <p className="text-2xl font-bold text-royal-navy">
                        {completedSteps.length} / 6
                      </p>
                    </div>

                    {/* Step List */}
                    <div className="space-y-2 pt-2 border-t">
                      {walkSteps.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = completedSteps.includes(index);
                        const isActive = currentStep === index && !isCompleted;
                        return (
                          <button
                            key={step.id}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left text-sm transition-colors ${
                              isActive
                                ? "bg-royal-gold/10 text-royal-navy"
                                : isCompleted
                                  ? "text-green-700"
                                  : "text-gray-400"
                            }`}
                            onClick={() => {
                              if (isCompleted || isActive) {
                                setCurrentStep(index);
                                stepRefs.current[index]?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                            }}
                            disabled={!isCompleted && !isActive}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Icon className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="truncate">{step.title}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Auth section */}
                    {isAuthenticated ? (
                      <Button
                        className="w-full bg-royal-gold hover:bg-royal-gold/80 text-royal-navy mt-4"
                        onClick={() => {
                          const target = walkComplete
                            ? document.getElementById("step-5")
                            : stepRefs.current[currentStep];
                          target?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {walkComplete ? "Review Steps" : "Continue Walking"}
                      </Button>
                    ) : (
                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-600 mb-3">
                          Sign in to save progress
                        </p>
                        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-royal-navy hover:bg-royal-navy/80 text-white">
                              <LogIn className="h-4 w-4 mr-2" />
                              Get Access
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                {authMode === "login" ? "Sign In" : "Create Account"}
                              </DialogTitle>
                              <DialogDescription>
                                {authMode === "login"
                                  ? "Sign in to continue your covenant education"
                                  : "Join Ecclesia Basilikos to understand your divine inheritance"}
                              </DialogDescription>
                            </DialogHeader>

                            <Tabs
                              value={authMode}
                              onValueChange={(value) =>
                                setAuthMode(value as "login" | "register")
                              }
                            >
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Register</TabsTrigger>
                              </TabsList>

                              <TabsContent value="login" className="space-y-4">
                                <Form {...loginForm}>
                                  <form
                                    onSubmit={loginForm.handleSubmit(onLogin)}
                                    className="space-y-4"
                                  >
                                    <FormField
                                      control={loginForm.control}
                                      name="email"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Email</FormLabel>
                                          <FormControl>
                                            <Input
                                              placeholder="Enter your email"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={loginForm.control}
                                      name="password"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Password</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="password"
                                              placeholder="Enter your password"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="submit"
                                      className="w-full bg-royal-gold hover:bg-royal-gold/80 text-royal-navy"
                                      disabled={isLoggingIn}
                                    >
                                      {isLoggingIn ? "Signing in..." : "Sign In"}
                                    </Button>
                                  </form>
                                </Form>
                              </TabsContent>

                              <TabsContent value="register" className="space-y-4">
                                <Form {...registerForm}>
                                  <form
                                    onSubmit={registerForm.handleSubmit(onRegister)}
                                    className="space-y-4"
                                  >
                                    <div className="grid grid-cols-2 gap-4">
                                      <FormField
                                        control={registerForm.control}
                                        name="firstName"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="First name"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={registerForm.control}
                                        name="lastName"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="Last name"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    <FormField
                                      control={registerForm.control}
                                      name="email"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Email</FormLabel>
                                          <FormControl>
                                            <Input
                                              placeholder="Enter your email"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={registerForm.control}
                                      name="password"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Password</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="password"
                                              placeholder="Create password"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={registerForm.control}
                                      name="confirmPassword"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Confirm Password</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="password"
                                              placeholder="Confirm password"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={registerForm.control}
                                      name="privacyAccepted"
                                      render={({ field }) => (
                                        <FormItem>
                                          <div className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-start gap-3">
                                              <FormControl>
                                                <Checkbox
                                                  checked={field.value === true}
                                                  onCheckedChange={(checked) =>
                                                    field.onChange(
                                                      checked === true
                                                        ? true
                                                        : undefined
                                                    )
                                                  }
                                                />
                                              </FormControl>
                                              <Label
                                                className="text-sm text-gray-700 leading-relaxed cursor-pointer font-normal"
                                                onClick={() =>
                                                  field.onChange(
                                                    field.value === true
                                                      ? undefined
                                                      : true
                                                  )
                                                }
                                              >
                                                I acknowledge the{" "}
                                                <Link
                                                  href="/privacy"
                                                  className="text-royal-gold hover:underline font-medium"
                                                >
                                                  Privacy Policy
                                                </Link>{" "}
                                                and{" "}
                                                <Link
                                                  href="/terms"
                                                  className="text-royal-gold hover:underline font-medium"
                                                >
                                                  Platform Guidelines
                                                </Link>
                                              </Label>
                                            </div>
                                            <FormMessage className="mt-2 ml-7" />
                                          </div>
                                        </FormItem>
                                      )}
                                    />
                                    <Button
                                      type="submit"
                                      className="w-full bg-royal-gold hover:bg-royal-gold/80 text-royal-navy"
                                      disabled={isRegistering}
                                    >
                                      {isRegistering
                                        ? "Creating account..."
                                        : "Create Account"}
                                    </Button>
                                  </form>
                                </Form>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Final Scripture */}
      <ScriptureQuote
        quote="But now hath he obtained a more excellent ministry, by how much also he is the mediator of a better covenant, which was established upon better promises."
        reference="Hebrews 8:6 (KJV)"
      />
    </div>
  );
}
