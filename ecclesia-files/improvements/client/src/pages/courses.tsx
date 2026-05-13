import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  BookOpen,
  Banknote,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
  GraduationCap,
  Play,
  FileText,
  Users,
  Target,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  MessageSquare,
  Lock,
  Award,
  BarChart3,
  Crown,
} from "lucide-react";
import { ToastAction } from "@/components/ui/toast";
import { usePageTitle } from "@/hooks/usePageTitle";

interface CourseWithLessonCount {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string | null;
  price: number | null;
  isFree: boolean | null;
  imageUrl: string | null;
  isPublished: boolean;
  lessonCount: number;
  createdAt: string;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string | null;
  lessons: { id: string; title: string; description: string | null; order: number; duration: string | null; isLocked?: boolean }[];
}

interface Enrollment {
  courseId: string;
  enrolledAt: string;
  progress: number | null;
  completedAt: string | null;
}

const pillarMeta: Record<string, {
  icon: typeof Banknote;
  color: string;
  bgColor: string;
  gradient: string;
  borderActive: string;
  href: string;
  order: number;
  tagline: string;
  statute: string;
  outcomes: string[];
  templates: string[];
}> = {
  "Lawful Money": {
    icon: Banknote,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    gradient: "from-yellow-600 to-amber-700",
    borderActive: "border-yellow-400",
    href: "/lawful-money",
    order: 1,
    tagline: "Redeem Federal Reserve Notes for lawful money under 12 USC §411",
    statute: "12 USC §411",
    outcomes: [
      "Understand the legal distinction between Federal Reserve Notes and lawful money",
      "Master the proper restrictive endorsement language for checks and deposits",
      "Learn the redemption process step by step with your bank",
      "Build a compliant documentation system (ledger, records, correspondence)",
      "Know the constitutional and statutory basis for lawful money redemption",
      "Handle bank objections and escalation procedures with confidence",
      "Understand the tax implications and reporting considerations",
    ],
    templates: ["Endorsement Guide", "Redemption Ledger"],
  },
  "Trust & Assets": {
    icon: Shield,
    color: "text-red-700",
    bgColor: "bg-red-50",
    gradient: "from-red-700 to-red-900",
    borderActive: "border-red-400",
    href: "/trust-assets",
    order: 2,
    tagline: "Protect assets using proper trust structures and administration",
    statute: "Common Law Trust",
    outcomes: [
      "Understand the three roles: Grantor, Trustee, and Beneficiary",
      "Know the different types of trusts and when each is appropriate",
      "Learn how to properly transfer assets into a trust",
      "Master ongoing trust administration and record-keeping",
      "Understand the legal protections trusts provide against claims",
      "Navigate banking and financial accounts held in trust",
      "Maintain compliance while maximizing asset protection",
    ],
    templates: ["Trust Checklist", "Asset Schedule"],
  },
  "State Passport": {
    icon: Globe,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    gradient: "from-blue-700 to-blue-900",
    borderActive: "border-blue-400",
    href: "/state-passport",
    order: 3,
    tagline: "Establish state-citizen status and obtain a passport reflecting it",
    statute: "14th Amendment / Slaughter-House Cases",
    outcomes: [
      "Understand the constitutional distinction between state and federal citizenship",
      "Study key case law: Slaughter-House Cases, United States v. Cruikshank",
      "Learn the process of establishing proper domicile in your state",
      "Complete the DS-11 passport application with correct declarations",
      "Prepare supporting documentation for your application",
      "Handle objections or requests for additional information",
      "Understand the rights and protections of state-citizen status",
    ],
    templates: ["Domicile Declaration", "DS-11 Walkthrough"],
  },
};

export default function Courses() {
  usePageTitle("Courses & Learning Path", "Browse foundational courses on Trust Law, Lawful Money Redemption, and State Passport.");
  const { isAuthenticated, isLoading, isPremium } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  const { data: courses = [], isLoading: coursesLoading } = useQuery<CourseWithLessonCount[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: isAuthenticated,
  });

  // Fetch expanded course details
  const { data: courseDetail } = useQuery<CourseDetail>({
    queryKey: [`/api/courses/${expandedCourse}`],
    enabled: !!expandedCourse,
  });

  const getEnrollment = (courseId: string) => {
    return enrollments.find((e) => e.courseId === courseId);
  };

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiRequest("POST", `/api/enrollments`, { courseId });
      return response.json();
    },
    onSuccess: (_data, courseId) => {
      navigate(`/course/${courseId}`);
    },
    onError: (error: any) => {
      const msg: string = error?.message || "";
      // Parse the JSON body embedded in the error message (format: "403: {...}")
      let parsedBody: { error?: string; code?: string } = {};
      try {
        const jsonStart = msg.indexOf("{");
        if (jsonStart !== -1) {
          parsedBody = JSON.parse(msg.slice(jsonStart));
        }
      } catch {
        // ignore parse errors
      }
      const serverMessage = parsedBody.error || msg;
      const serverCode = parsedBody.code || "";

      if (serverMessage.toLowerCase().includes("verification") || serverMessage.toLowerCase().includes("verify")) {
        toast({
          title: "Email Verification Required",
          description: "Please verify your email address before starting a course. Check your inbox or resend the link.",
          variant: "destructive",
          action: (
            <ToastAction
              altText="Resend verification email"
              onClick={async () => {
                try {
                  const resp = await fetch("/api/auth/resend-verification", {
                    method: "POST",
                    credentials: "include",
                    headers: (() => {
                      const h: Record<string, string> = {};
                      const csrfMatch = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
                      if (csrfMatch?.[1]) h["x-csrf-token"] = csrfMatch[1];
                      return h;
                    })(),
                  });
                  const data = await resp.json();
                  if (!resp.ok) {
                    toast({ title: "Failed to Resend", description: data.error || "Please try again later.", variant: "destructive" });
                    return;
                  }
                  if (data.autoVerified) {
                    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
                    toast({ title: "Email Verified", description: "Your email has been verified. You can now start courses." });
                  } else {
                    toast({ title: "Verification Email Sent", description: data.message || "Check your inbox for a new verification link." });
                  }
                } catch {
                  toast({ title: "Failed to Resend", description: "Please try again later.", variant: "destructive" });
                }
              }}
            >
              Resend
            </ToastAction>
          ),
        });
      } else if (serverCode.toLowerCase().includes("premium") || serverMessage.toLowerCase().includes("premium")) {
        toast({
          title: "PMA Membership Required",
          description: "This course requires PMA membership. Visit /pricing to acquire beneficial interest.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unable to Start Course",
          description: serverMessage || "Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  const handleBeginLearning = async (courseId: string) => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/courses");
      return;
    }

    const enrollment = getEnrollment(courseId);
    if (enrollment) {
      navigate(`/course/${courseId}`);
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      await enrollMutation.mutateAsync(courseId);
      (await import("@/lib/analytics")).trackEvent("Enrollment", { courseId });
    } catch (error) {
      console.error("Auto-enrollment error:", error);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const pillarCourses = courses
    .filter((c) => pillarMeta[c.category])
    .sort((a, b) => (pillarMeta[a.category]?.order ?? 99) - (pillarMeta[b.category]?.order ?? 99));

  const otherCourses = courses.filter((c) => !pillarMeta[c.category]);

  const totalLessons = pillarCourses.reduce((sum, c) => sum + c.lessonCount, 0);

  const completedPillars = pillarCourses.filter((c) => {
    const e = getEnrollment(c.id);
    return e?.completedAt;
  }).length;

  if (isLoading || coursesLoading) {
    return (
      <div className="min-h-screen pt-16">
        <section className="relative bg-gradient-to-br from-royal-navy via-royal-burgundy to-royal-navy py-20 md:py-28">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-royal-gold mx-auto" />
            <p className="text-gray-300 mt-4 font-cinzel">Loading courses...</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-royal-navy via-royal-burgundy to-royal-navy py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-royal-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-royal-burgundy/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <Badge className="mb-5 bg-royal-gold/20 text-royal-gold border-2 border-royal-gold font-semibold px-6 py-2 text-base backdrop-blur-sm">
              Three Pillars · Three Courses · One Foundation
            </Badge>
            <h1 className="font-cinzel-decorative text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
              Courses & Learning Path
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8">
              Master each pillar through structured, step-by-step courses. Work through them in order; each builds on the one before it.
            </p>

            {isAuthenticated && (
              <div className="max-w-md mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-sm border border-royal-gold/30 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-300">Overall Progress</span>
                    <span className="text-royal-gold font-semibold">
                      {completedPillars} / 3 Pillars Complete
                    </span>
                  </div>
                  <Progress value={(completedPillars / 3) * 100} className="h-2" />
                </div>
              </div>
            )}
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-3xl font-bold text-royal-gold">{pillarCourses.length}</p>
              <p className="text-sm text-gray-300 font-cinzel">Core Courses</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-3xl font-bold text-royal-gold">{totalLessons}</p>
              <p className="text-sm text-gray-300 font-cinzel">Total Lessons</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-3xl font-bold text-royal-gold">3</p>
              <p className="text-sm text-gray-300 font-cinzel">Pillars</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <p className="text-3xl font-bold text-royal-gold">{isPremium ? "PMA" : "Free"}</p>
              <p className="text-sm text-gray-300 font-cinzel">{isPremium ? "Member" : "Trust Courses"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-royal-navy-light/50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-royal-navy dark:text-royal-gold mb-3">
              How Your Learning Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Each pillar follows a structured path from understanding to implementation.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Choose a Pillar", desc: "Start with any pillar; we recommend beginning with Lawful Money as the foundation." },
              { icon: Layers, title: "Work Through Lessons", desc: "Each course has 7 structured lessons that build on each other sequentially." },
              { icon: Download, title: "Use the Templates", desc: "Download practical templates and forms to implement what you learn in each lesson." },
              { icon: Award, title: "Complete & Advance", desc: "Finish all three pillars to establish your complete foundation." },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="relative mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-royal-gold/10 flex items-center justify-center mx-auto">
                    <step.icon className="w-7 h-7 text-royal-gold" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-royal-navy text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-cinzel font-bold text-royal-navy dark:text-gray-200 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Course Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {courses.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="h-16 w-16 text-royal-gold mx-auto mb-4" />
            <h3 className="font-cinzel text-2xl font-bold text-royal-navy mb-2">Courses</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Structured courses for each pillar are being prepared. New content will appear here as it becomes available.
            </p>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="text-center mb-10">
              <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-royal-navy dark:text-royal-gold mb-3">
                The Three Pillar Courses
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Each course is a deep-dive into one pillar. Select a course to see the full curriculum, learning outcomes, and available templates.
              </p>
            </div>

            {/* Pillar Courses */}
            <div className="space-y-8 mb-16">
              {pillarCourses.map((course, index) => {
                const meta = pillarMeta[course.category];
                if (!meta) return null;
                const Icon = meta.icon;
                const enrollment = getEnrollment(course.id);
                const progress = enrollment?.progress || 0;
                const isCompleted = !!enrollment?.completedAt;
                const isStarted = !!enrollment;
                const isExpanded = expandedCourse === course.id;
                const detail = isExpanded && courseDetail?.id === course.id ? courseDetail : null;

                return (
                  <div key={course.id} className="group">
                    {/* Pillar Number Label */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-white text-sm font-bold`}>
                        {index + 1}
                      </div>
                      <span className="font-cinzel text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        Pillar {index + 1}. {meta.statute}
                      </span>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" /> Completed
                        </Badge>
                      )}
                      {isStarted && !isCompleted && (
                        <Badge className="bg-royal-gold/10 text-royal-gold border-royal-gold/30">
                          <BarChart3 className="w-3 h-3 mr-1" /> {progress}% Complete
                        </Badge>
                      )}
                    </div>

                    <Card className={`overflow-hidden border-2 transition-all ${
                      isCompleted ? "border-green-300" :
                      isStarted ? "border-royal-gold/50" :
                      "border-gray-200 dark:border-gray-700 hover:border-royal-gold/30"
                    }`}>
                      {/* Main Course Card */}
                      <div className="grid lg:grid-cols-5">
                        {/* Pillar sidebar */}
                        <div className={`bg-gradient-to-br ${meta.gradient} p-8 lg:p-10 flex flex-col justify-center items-center text-center text-white`}>
                          <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mb-4">
                            <Icon className="w-10 h-10" />
                          </div>
                          <h3 className="font-cinzel-decorative font-bold text-xl mb-2">
                            {course.category}
                          </h3>
                          <p className="text-sm text-white/70 leading-relaxed">
                            {meta.tagline}
                          </p>

                          {isStarted && !isCompleted && (
                            <div className="mt-4 w-full max-w-[200px]">
                              <Progress value={progress} className="h-2 bg-white/20" />
                              <p className="text-xs text-white/60 mt-1">{progress}% complete</p>
                            </div>
                          )}
                        </div>

                        {/* Course content */}
                        <div className="lg:col-span-4 p-6 lg:p-8">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="secondary" className="font-cinzel text-xs">
                              {course.level}
                            </Badge>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" /> {course.lessonCount} lessons
                            </span>
                            {course.duration && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {course.duration}
                              </span>
                            )}
                            {course.isFree ? (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                Free
                              </Badge>
                            ) : !isPremium ? (
                              <Badge variant="outline" className="text-xs text-royal-gold border-royal-gold/30">
                                <Lock className="w-3 h-3 mr-1" /> PMA Only
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs text-royal-gold border-royal-gold/30">
                                <Crown className="w-3 h-3 mr-1" /> PMA Member
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-cinzel text-xl md:text-2xl font-bold text-royal-navy dark:text-royal-gold mb-3">
                            {course.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                            {course.description}
                          </p>

                          {/* What You'll Learn Preview */}
                          <div className="mb-5">
                            <h4 className="font-cinzel font-semibold text-sm text-royal-navy dark:text-gray-200 mb-3 flex items-center gap-2">
                              <Target className="w-4 h-4 text-royal-gold" /> What You'll Learn
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {meta.outcomes.slice(0, 4).map((outcome, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-royal-gold flex-shrink-0 mt-0.5" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{outcome}</span>
                                </div>
                              ))}
                            </div>
                            {meta.outcomes.length > 4 && !isExpanded && (
                              <p className="text-xs text-royal-gold mt-2 font-cinzel">
                                + {meta.outcomes.length - 4} more learning outcomes
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-3">
                            {!course.isFree && !isPremium ? (
                              <div className="w-full">
                                <Link href="/pricing">
                                  <Button
                                    size="lg"
                                    className="bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold px-8 shadow-md hover:shadow-lg transition-all"
                                  >
                                    <Lock className="w-4 h-4 mr-2" />
                                    {(() => {
                                      const trustCourse = pillarCourses.find(c => c.isFree);
                                      const trustEnrollment = trustCourse ? getEnrollment(trustCourse.id) : null;
                                      const hasCompletedTrust = !!trustEnrollment?.completedAt;
                                      return hasCompletedTrust
                                        ? `Ready for the next step? Acquire PMA membership to access ${course.title}`
                                        : "Acquire PMA Membership ($500 or $50/mo)";
                                    })()}
                                  </Button>
                                </Link>
                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                  {(() => {
                                    const trustCourse = pillarCourses.find(c => c.isFree);
                                    const trustEnrollment = trustCourse ? getEnrollment(trustCourse.id) : null;
                                    const hasCompletedTrust = !!trustEnrollment?.completedAt;
                                    return hasCompletedTrust
                                      ? `You've completed the free Trust course. Acquire PMA membership to continue with ${course.title}.`
                                      : `Complete the free Trust course first, then support the assembly with a monthly donation to access ${course.title}.`;
                                  })()}
                                </p>
                                <ul className="mt-3 space-y-1">
                                  <li className="flex items-center gap-2 text-xs text-gray-500">
                                    <CheckCircle className="w-3 h-3 text-royal-gold flex-shrink-0" />
                                    All 3 pillar courses (Lawful Money, Trust, State Passport)
                                  </li>
                                  <li className="flex items-center gap-2 text-xs text-gray-500">
                                    <CheckCircle className="w-3 h-3 text-royal-gold flex-shrink-0" />
                                    Full downloads library and templates
                                  </li>
                                  <li className="flex items-center gap-2 text-xs text-gray-500">
                                    <CheckCircle className="w-3 h-3 text-royal-gold flex-shrink-0" />
                                    Forum posting and community access
                                  </li>
                                </ul>
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleBeginLearning(course.id)}
                                disabled={enrollingCourseId === course.id}
                                size="lg"
                                className="bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold px-8 shadow-md hover:shadow-lg transition-all"
                              >
                                {enrollingCourseId === course.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : isCompleted ? (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                ) : isStarted ? (
                                  <Play className="w-4 h-4 mr-2" />
                                ) : (
                                  <GraduationCap className="w-4 h-4 mr-2" />
                                )}
                                {isCompleted ? "Review Course" : isStarted ? "Continue Learning" : "Start This Course"}
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              onClick={() => setExpandedCourse(isExpanded ? null : course.id)}
                              className="font-cinzel text-sm border-royal-gold/30 text-royal-gold hover:bg-royal-gold/5"
                            >
                              {isExpanded ? (
                                <><ChevronUp className="w-4 h-4 mr-1" /> Hide Details</>
                              ) : (
                                <><ChevronDown className="w-4 h-4 mr-1" /> View Curriculum</>
                              )}
                            </Button>

                            <Link href={meta.href}>
                              <Button variant="ghost" className="text-gray-500 font-cinzel text-sm">
                                Pillar Overview <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Curriculum Section */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 dark:border-gray-700">
                          <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
                            {/* Full Curriculum */}
                            <div className="lg:col-span-2 p-6 lg:p-8">
                              <h4 className="font-cinzel font-bold text-lg text-royal-navy dark:text-royal-gold mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-royal-gold" /> Full Curriculum
                              </h4>

                              {detail?.lessons ? (
                                <div className="space-y-3">
                                  {detail.lessons
                                    .sort((a, b) => a.order - b.order)
                                    .map((lesson, i) => (
                                    <div key={lesson.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-royal-navy/30">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        isStarted ? "bg-royal-gold/10 text-royal-gold" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                                      }`}>
                                        {lesson.isLocked ? <Lock className="w-3.5 h-3.5" /> : i + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`font-medium text-sm text-royal-navy dark:text-gray-200 ${lesson.isLocked ? "opacity-60" : ""}`}>
                                          {lesson.title}
                                        </p>
                                        {lesson.description && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                            {lesson.description}
                                          </p>
                                        )}
                                      </div>
                                      {lesson.duration && (
                                        <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                                          <Clock className="w-3 h-3" /> {lesson.duration}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {Array.from({ length: course.lessonCount }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-royal-navy/30 animate-pulse">
                                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Side Panel: Outcomes + Templates */}
                            <div className="p-6 lg:p-8 space-y-6">
                              {/* All Learning Outcomes */}
                              <div>
                                <h4 className="font-cinzel font-bold text-sm text-royal-navy dark:text-royal-gold mb-3 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-royal-gold" /> Learning Outcomes
                                </h4>
                                <ul className="space-y-2">
                                  {meta.outcomes.map((outcome, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <CheckCircle className="w-3.5 h-3.5 text-royal-gold flex-shrink-0 mt-0.5" />
                                      <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{outcome}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Templates */}
                              <div>
                                <h4 className="font-cinzel font-bold text-sm text-royal-navy dark:text-royal-gold mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-royal-gold" /> Included Templates
                                </h4>
                                <div className="space-y-2">
                                  {meta.templates.map((template, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-royal-gold/5 border border-royal-gold/20">
                                      <Download className="w-3.5 h-3.5 text-royal-gold" />
                                      <span className="text-xs font-medium text-royal-navy dark:text-gray-300">{template}</span>
                                    </div>
                                  ))}
                                </div>
                                <Link href="/downloads">
                                  <Button variant="ghost" size="sm" className="text-royal-gold font-cinzel text-xs mt-2 p-0 h-auto">
                                    All downloads <ArrowRight className="w-3 h-3 ml-1" />
                                  </Button>
                                </Link>
                              </div>

                              {/* Quick Links */}
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                <Link href={meta.href}>
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-cinzel text-gray-600 dark:text-gray-400 hover:text-royal-gold">
                                    <BookOpen className="w-3.5 h-3.5 mr-2" /> Read the pillar guide
                                  </Button>
                                </Link>
                                <Link href="/forum">
                                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-cinzel text-gray-600 dark:text-gray-400 hover:text-royal-gold">
                                    <MessageSquare className="w-3.5 h-3.5 mr-2" /> Discuss in the forum
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Other courses if any */}
            {otherCourses.length > 0 && (
              <div className="mb-16">
                <div className="text-center mb-8">
                  <h2 className="font-cinzel text-2xl font-bold text-royal-navy dark:text-royal-gold mb-2">
                    Additional Courses
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">Supplementary courses beyond the three pillars</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherCourses.map((course) => {
                    const enrollment = getEnrollment(course.id);
                    const isStarted = !!enrollment;
                    const isCompleted = !!enrollment?.completedAt;

                    return (
                      <Card key={course.id} className="hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6">
                          <Badge variant="secondary" className="mb-3 text-xs">{course.level}</Badge>
                          <h3 className="font-cinzel font-bold text-royal-navy dark:text-gray-200 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.lessonCount} lessons</span>
                            {course.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>}
                          </div>
                          <Button
                            className="w-full bg-royal-navy hover:bg-royal-navy/90 text-white font-cinzel"
                            onClick={() => handleBeginLearning(course.id)}
                            disabled={enrollMutation.isPending}
                          >
                            {isCompleted ? "Review" : isStarted ? "Continue" : "Begin Learning"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="font-cinzel text-2xl font-bold text-royal-navy dark:text-royal-gold mb-2">
              Common Questions
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "Which courses are free?",
                a: "Lesson 1 of the Trust course is free. Full access to all courses requires PMA membership.",
              },
              {
                q: "Do I need to take them in order?",
                a: "We recommend starting with Lawful Money as it establishes core concepts, but you can begin with any pillar that's most relevant to your situation.",
              },
              {
                q: "How long does each course take?",
                a: "Each course has 7 lessons. Most people complete a course in 1-2 weeks at their own pace. There are no deadlines.",
              },
              {
                q: "Do I get a certificate?",
                a: "Your dashboard tracks completion of each pillar. When all three are complete, your foundation is established and reflected in your profile.",
              },
              {
                q: "Can I download materials for offline use?",
                a: "Yes. Each pillar has associated templates and guides available in the Downloads section that you can save and print.",
              },
              {
                q: "Where can I ask questions?",
                a: "Each pillar has a dedicated forum category where you can discuss topics, share experiences, and get answers from the community.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-white dark:bg-royal-navy-light border border-gray-200 dark:border-gray-700">
                <h4 className="font-cinzel font-bold text-sm text-royal-navy dark:text-royal-gold mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <Card className="bg-gradient-to-r from-royal-navy to-royal-burgundy border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-royal-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-10 text-center relative">
            <GraduationCap className="w-12 h-12 text-royal-gold mx-auto mb-4" />
            <h3 className="font-cinzel-decorative text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Build Your Foundation?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Start with any pillar and work at your own pace. Each course is designed to take you from understanding to implementation with clear, actionable steps.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold px-10 shadow-lg">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-royal-gold/50 text-royal-gold hover:bg-white/10 font-cinzel">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : pillarCourses.length > 0 ? (
                <Button
                  size="lg"
                  className="bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold px-10 shadow-lg"
                  onClick={() => {
                    // Find first non-started or in-progress course
                    const next = pillarCourses.find(c => {
                      const e = getEnrollment(c.id);
                      return !e || !e.completedAt;
                    });
                    if (next) handleBeginLearning(next.id);
                  }}
                >
                  <Play className="w-5 h-5 mr-2" /> Start Next Course
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
