import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, FileText, Shield, Users, Download, GraduationCap, Mail, Settings, CheckCircle, Crown, ArrowRight, Play, Star, Banknote, Globe, Heart } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import RequireAuth from "@/components/RequireAuth";
import TrustHierarchyDiagram from "@/components/trust-hierarchy-diagram";
import CovenantChainDiagram from "@/components/covenant-chain-diagram";

interface Enrollment {
  courseId: string;
  progress: number | null;
  completedAt: string | null;
  course: {
    id: string;
    title: string;
    category: string;
  };
}

interface CourseWithLessonCount {
  id: string;
  title: string;
  category: string;
  isFree: boolean | null;
}

function WelcomeContent() {
  usePageTitle("Dashboard");
  const { user, isPremium } = useAuth();

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
  });

  const { data: courses = [] } = useQuery<CourseWithLessonCount[]>({
    queryKey: ["/api/courses"],
  });

  if (!user) return null;

  // Check if the Covenant Walk has been completed
  const covenantWalkCompleted = typeof window !== 'undefined' && localStorage.getItem('covenantWalkCompleted') === 'true';

  // Find free (Trust) course and user's enrollment in it
  const freeCourse = courses.find(c => c.isFree || c.category === "Trust & Assets");
  const freeCourseEnrollment = freeCourse
    ? enrollments.find(e => e.courseId === freeCourse.id)
    : null;

  // Find any in-progress enrollment
  const inProgressEnrollment = enrollments.find(e => !e.completedAt && (e.progress ?? 0) > 0);

  // Determine primary card state
  const hasStartedFreeCourse = !!freeCourseEnrollment;
  const hasCompletedFreeCourse = !!freeCourseEnrollment?.completedAt;
  const hasAnyInProgress = !!inProgressEnrollment;

  // New user journey: Covenant Walk -> Free Course -> Paid/Covenantal Membership
  let primaryTitle = "Begin the Covenant Walk";
  let primaryDescription = "Understand your identity as Grantor-Beneficiary. Six steps from God's promise to your inheritance.";
  let primaryHref = "/new-covenant-intro";
  let primaryIcon = Heart;
  let primaryButtonText = "Start the Walk";
  let primaryLabel = "Recommended First Step";

  if (!covenantWalkCompleted) {
    // Default values above apply — Covenant Walk is the first step
  } else if (isPremium) {
    primaryTitle = "Explore Courses";
    primaryDescription = "You have full access as a Covenantal Member. Explore all courses across every pillar.";
    primaryHref = "/courses";
    primaryIcon = BookOpen;
    primaryButtonText = "Explore Courses";
    primaryLabel = "Full Access";
  } else if (hasAnyInProgress && inProgressEnrollment) {
    primaryTitle = "Continue Learning";
    primaryDescription = `Pick up where you left off. ${inProgressEnrollment.course?.title || "your course"} is ${inProgressEnrollment.progress || 0}% complete.`;
    primaryHref = `/course/${inProgressEnrollment.courseId}`;
    primaryIcon = Play;
    primaryButtonText = "Continue Course";
    primaryLabel = "In Progress";
  } else if (hasCompletedFreeCourse) {
    primaryTitle = "Ready for Full Access";
    primaryDescription = "You've completed the Covenant Walk and the Trust Foundation. Take the next step and enter as a full Grantor-Beneficiary.";
    primaryHref = "/pricing";
    primaryIcon = Crown;
    primaryButtonText = "View Covenantal Membership";
    primaryLabel = "Next Step";
  } else if (hasStartedFreeCourse) {
    primaryTitle = "Continue Learning";
    primaryDescription = `You've started the Trust Foundation, so keep going! You're ${freeCourseEnrollment?.progress || 0}% complete.`;
    primaryHref = `/course/${freeCourse!.id}`;
    primaryIcon = Play;
    primaryButtonText = "Continue Course";
    primaryLabel = "In Progress";
  } else {
    // Covenant Walk completed, but free course not started
    primaryTitle = "Start Free Course";
    primaryDescription = "You've completed the Covenant Walk. Now begin the Trust Foundation course — it's free and sets the stage for everything else.";
    primaryHref = freeCourse ? `/course/${freeCourse.id}` : "/courses";
    primaryIcon = GraduationCap;
    primaryButtonText = "Start Learning";
    primaryLabel = "Next Step";
  }

  const PrimaryIcon = primaryIcon;

  const pathways = [
    { title: "Downloads", description: "Documents, declarations & resources", href: "/downloads", icon: Download, disabled: false },
    { title: "Educational Resources", description: "Templates, guides & educational materials", href: "/resources", icon: FileText, disabled: false },
    { title: "Royal Academy", description: "Explore courses in trust, stewardship & covenant authority", href: "/courses", icon: BookOpen, disabled: false },
    { title: "Proof Vault", description: "Timestamp & verify your documents", href: "/proof-vault", icon: Shield, disabled: false },
    { title: "Embassy Forum", description: "Join discussions with the covenant community", href: "/forum", icon: Users, disabled: false },
  ];

  return (
    <div className="min-h-screen marble-bg pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-royal-navy via-royal-burgundy to-royal-navy text-white py-16 md:py-24 border-b-2 border-royal-gold">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-cinzel-decorative text-3xl md:text-5xl font-bold mb-4">
            Welcome, {user.firstName}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            You have entered the assembly as a Grantor-Beneficiary. Below is your path: three pillars that form the foundation of everything we teach.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Email verification reminder */}
        {user.isEmailVerified === false && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 mb-8">
            <Mail className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              We sent a verification link to <strong>{user.email}</strong>. Please check your inbox to verify your email address.
            </p>
          </div>
        )}

        {/* Beneficial Unit Notice */}
        {isPremium && (
        <div className="flex items-center gap-3 bg-royal-gold/5 border border-royal-gold/20 text-royal-navy rounded-lg p-4 mb-8">
          <Award className="w-5 h-5 text-royal-gold flex-shrink-0" />
          <p className="text-sm">
            Your <strong>Beneficial Unit</strong> has been issued. <Link href="/beneficiary/unit" className="text-royal-gold hover:underline font-medium">View your unit details and download your certificate</Link>.
          </p>
        </div>
        )}

        {/* Primary Card: Start Free Course / Continue Learning */}
        <div className="mb-8">
          <Link href={primaryHref}>
            <Card className="border-2 border-royal-gold bg-gradient-to-br from-royal-gold/10 via-amber-50 to-transparent hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-royal-gold/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
              <CardContent className="p-8 md:p-10 relative">
                <div className="flex items-start gap-2 mb-4">
                  <Star className="w-4 h-4 text-royal-gold flex-shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-royal-gold uppercase tracking-wider font-cinzel">
                    {primaryLabel}
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-royal-gold/15 flex items-center justify-center">
                      <PrimaryIcon className="w-8 h-8 md:w-10 md:h-10 text-royal-gold" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-cinzel text-2xl md:text-3xl font-bold text-royal-navy mb-2">{primaryTitle}</h3>
                    <p className="text-gray-600 text-base md:text-lg mb-4">{primaryDescription}</p>
                    <Button className="bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold px-8 shadow-md hover:shadow-lg transition-all">
                      {primaryButtonText} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Three Pillar Progression */}
        <div className="mb-8">
          <h2 className="font-cinzel text-lg font-bold text-royal-navy mb-4">Your Journey</h2>

          {/* Step 0: Covenant Walk */}
          <div className="mb-4">
            <Link href={covenantWalkCompleted ? "#" : "/new-covenant-intro"}>
              <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                covenantWalkCompleted
                  ? "bg-green-50 border-green-200"
                  : "bg-royal-gold/5 border-royal-gold/30 hover:border-royal-gold/50 cursor-pointer"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  covenantWalkCompleted ? "bg-green-500 text-white" : "bg-royal-gold/20"
                }`}>
                  {covenantWalkCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Heart className="w-4 h-4 text-royal-gold" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 font-cinzel">STEP 0</span>
                    <span className="font-cinzel text-sm font-bold text-royal-navy">Covenant Walk</span>
                    {covenantWalkCompleted && (
                      <span className="text-xs text-green-600 font-medium">Completed</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">Understand your identity as Grantor-Beneficiary</p>
                </div>
                {!covenantWalkCompleted && (
                  <ArrowRight className="w-4 h-4 text-royal-gold flex-shrink-0" />
                )}
              </div>
            </Link>
          </div>

          {/* Pillar progression: Covenant Walk -> Lawful Money -> Trust Protection -> Proper Status */}
          <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
            <span className={`text-[10px] font-cinzel font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
              covenantWalkCompleted ? "bg-green-100 text-green-700" : "bg-royal-gold/10 text-royal-gold"
            }`}>
              {covenantWalkCompleted ? <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Covenant Walk</span> : "Covenant Walk"}
            </span>
            <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
            <span className="text-[10px] font-cinzel font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">Lawful Money</span>
            <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
            <span className="text-[10px] font-cinzel font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">Trust Protection</span>
            <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
            <span className="text-[10px] font-cinzel font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">Proper Status</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                num: "1",
                icon: Banknote,
                title: "Lawful Money",
                description: "Understand the difference between Federal Reserve Notes and lawful money under 12 USC 411. This is where everything begins.",
                href: "/lawful-money",
                courseCategory: "Lawful Money",
                color: "border-t-royal-gold",
              },
              {
                num: "2",
                icon: Shield,
                title: "Trust Protection",
                description: "Learn why assets must be held in trust, not in your name, and how the trust structure works.",
                href: "/trust-assets",
                courseCategory: "Trust & Assets",
                color: "border-t-royal-burgundy",
              },
              {
                num: "3",
                icon: Globe,
                title: "Proper Status",
                description: "Secure your standing under the correct jurisdiction. Your political status determines your rights.",
                href: "/state-passport",
                courseCategory: "State Passport",
                color: "border-t-royal-navy",
              },
            ].map((pillar) => {
              const pillarCourse = courses.find(c => c.category === pillar.courseCategory);
              const pillarEnrollment = pillarCourse ? enrollments.find(e => e.courseId === pillarCourse.id) : null;
              const isComplete = !!pillarEnrollment?.completedAt;
              const isStarted = !!pillarEnrollment && !isComplete;
              const progress = pillarEnrollment?.progress ?? 0;

              return (
                <Link key={pillar.num} href={pillarCourse ? `/course/${pillarCourse.id}` : pillar.href}>
                  <Card className={`royal-card h-full ${pillar.color} border-t-4 hover:border-royal-gold/50 cursor-pointer transition-all relative`}>
                    {isComplete && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-royal-navy flex items-center justify-center">
                          <span className="text-royal-gold font-cinzel text-sm font-bold">{pillar.num}</span>
                        </span>
                        <pillar.icon className="w-5 h-5 text-royal-burgundy" />
                      </div>
                      <h3 className="font-cinzel text-base font-bold text-royal-navy mb-2">{pillar.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{pillar.description}</p>
                      {isStarted && (
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>In progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-royal-gold rounded-full h-1.5 transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}
                      {!isStarted && !isComplete && (
                        <span className="text-royal-gold text-sm font-medium flex items-center gap-1">
                          {pillarCourse ? "Begin" : "Learn more"} <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                      {isComplete && (
                        <span className="text-green-600 text-sm font-medium">Completed</span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Your Place in the Trust (Premium Users) */}
        {isPremium && (
          <div className="mb-8">
            <Card className="royal-card border border-royal-gold/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="w-5 h-5 text-royal-gold" />
                  <h2 className="font-cinzel text-lg font-bold text-royal-navy">Your Covenant Journey</h2>
                </div>
                <CovenantChainDiagram compact activeStep={6} />
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <TrustHierarchyDiagram compact highlightLayer="member" className="mb-3" />
                </div>
                <div className="text-center">
                  <Link href="/beneficiary/unit" className="text-sm font-cinzel font-semibold text-royal-gold hover:text-royal-burgundy transition-colors">
                    View Your Beneficial Unit →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Secondary Pathway Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {pathways.map((p) => {
            const card = (
              <Card className={`royal-card transition-all h-full ${p.disabled ? "opacity-50 cursor-not-allowed" : "hover:border-royal-gold/50 cursor-pointer"}`}>
                <CardContent className="p-5 relative text-center">
                  {p.disabled && (
                    <span className="absolute top-2 right-2 text-[10px] font-semibold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                      In Progress
                    </span>
                  )}
                  <p.icon className={`w-8 h-8 mb-3 mx-auto ${p.disabled ? "text-gray-400" : "text-royal-burgundy"}`} />
                  <h3 className="font-cinzel text-sm font-bold text-royal-navy mb-1">{p.title}</h3>
                  <p className="text-gray-500 text-xs leading-snug">{p.description}</p>
                </CardContent>
              </Card>
            );

            return p.disabled ? (
              <div key={p.title}>{card}</div>
            ) : (
              <Link key={p.title} href={p.href}>{card}</Link>
            );
          })}
        </div>

        {/* Free Account Info + Premium Upsell */}
        {!isPremium && (
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="royal-card">
              <CardContent className="p-6">
                <h3 className="font-cinzel text-lg font-bold text-royal-navy mb-4">Your Free Account Includes</h3>
                <ul className="space-y-2">
                  {["Covenant Walk (guided introduction)", "Trust Foundation course", "Trust-related downloads", "Forum reading", "Progress tracking", "Email notifications"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2 border-royal-gold/30 bg-gradient-to-br from-royal-gold/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-royal-gold" />
                  <h3 className="font-cinzel text-lg font-bold text-royal-navy">Covenantal Membership</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Enter as a full Grantor-Beneficiary. Covenant contribution unlocks all courses, downloads, forum posting, Proof Vault, and your Beneficial Unit certificate.
                </p>
                <Link href="/pricing">
                  <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold">
                    View Plans <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="mt-8">
            <Link href="/admin">
              <Card className="royal-card hover:border-royal-gold transition-all cursor-pointer border-dashed border-2">
                <CardContent className="p-8 flex items-center gap-6">
                  <Settings className="w-12 h-12 text-royal-burgundy flex-shrink-0" />
                  <div>
                    <h3 className="font-cinzel text-xl font-bold text-royal-navy mb-2">Admin Panel</h3>
                    <p className="text-gray-600">Manage users, content, courses, and system settings</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Welcome() {
  return (
    <RequireAuth>
      <WelcomeContent />
    </RequireAuth>
  );
}
