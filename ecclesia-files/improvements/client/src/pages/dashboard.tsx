import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import RequireAuth from "@/components/RequireAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  Award,
  BookOpen,
  CheckCircle,
  MessageSquare,
  Play,
  ArrowRight,
  Clock,
  Download,
  Video,
  GraduationCap,
  FileText,
  Search,
  Crown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  coursesInProgress: number;
  coursesCompleted: number;
  availableCourses: number;
  forumPosts: number;
  videosWatched: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: "enrollment" | "forum_thread" | "forum_reply" | "video_watch";
  title: string;
  date: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  progress: number | null;
  completedAt: string | null;
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    duration: string | null;
    category: string;
  };
}

function getActivityIcon(type: string) {
  switch (type) {
    case "enrollment": return <BookOpen className="h-4 w-4 text-blue-500" />;
    case "forum_thread": return <MessageSquare className="h-4 w-4 text-green-500" />;
    case "forum_reply": return <MessageSquare className="h-4 w-4 text-teal-500" />;
    case "video_watch": return <Play className="h-4 w-4 text-purple-500" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

function getActivityLabel(type: string) {
  switch (type) {
    case "enrollment": return "Enrolled in";
    case "forum_thread": return "Started thread";
    case "forum_reply": return "Replied to";
    case "video_watch": return "Watched";
    default: return "";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function DashboardContent() {
  usePageTitle("Dashboard");
  const { user, isPremium } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
  });

  const inProgress = enrollments.filter(e => !e.completedAt);

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-royal-navy dark:via-royal-navy dark:to-royal-navy">
      {/* Header */}
      <section className="bg-gradient-to-r from-royal-navy to-royal-burgundy text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-cinzel-decorative font-bold">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-gray-300 mt-2 font-cinzel">
            Your learning hub
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-9 w-12" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">In Progress</p>
                      <p className="text-3xl font-bold text-royal-navy dark:text-royal-gold">
                        {stats?.coursesInProgress || 0}
                      </p>
                      {(stats?.coursesInProgress || 0) === 0 && (stats?.availableCourses || 0) > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{stats?.availableCourses} available to start</p>
                      )}
                    </div>
                    <BookOpen className="h-8 w-8 text-royal-gold" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats?.coursesCompleted || 0}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Forum Posts</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {stats?.forumPosts || 0}
                      </p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Videos Watched</p>
                      <p className="text-3xl font-bold text-amber-600">
                        {stats?.videosWatched || 0}
                      </p>
                    </div>
                    <Video className="h-8 w-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Sections Grid: equal weight */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Courses */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-royal-navy dark:text-royal-gold flex items-center gap-2 font-cinzel text-lg">
                <GraduationCap className="h-5 w-5" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {inProgress.length > 0 ? (
                <div className="space-y-3 flex-1">
                  {inProgress.slice(0, 2).map((enrollment) => (
                    <div key={enrollment.id} className="p-3 bg-gray-50 dark:bg-royal-navy/50 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate">
                        {enrollment.course.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {enrollment.course.category}
                        </Badge>
                        {enrollment.course.duration && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {enrollment.course.duration}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <Progress value={enrollment.progress || 0} className="h-1.5" />
                        <p className="text-xs text-gray-500 mt-1">{enrollment.progress || 0}% complete</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 flex-1 flex flex-col items-center justify-center">
                  <GraduationCap className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Ready to begin your journey?</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start with the foundational pillars to build your knowledge step by step.
                  </p>
                </div>
              )}
              <Link href="/courses" className="mt-4">
                <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold text-sm">
                  {inProgress.length > 0 ? "View All Courses" : "Browse Courses"} <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Forum */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-royal-navy dark:text-royal-gold flex items-center gap-2 font-cinzel text-lg">
                <MessageSquare className="h-5 w-5" />
                Forum
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <MessageSquare className="h-10 w-10 text-purple-300 mb-2" />
                <p className="text-sm text-gray-500 mb-1">
                  Join the community discussion
                </p>
                <p className="text-xs text-gray-400">
                  Ask questions, share insights, and connect with other members.
                </p>
                {stats && stats.forumPosts > 0 && (
                  <Badge className="mt-3 bg-purple-100 text-purple-700 border-0">
                    {stats.forumPosts} post{stats.forumPosts !== 1 ? "s" : ""} by you
                  </Badge>
                )}
              </div>
              <Link href="/forum" className="mt-4">
                <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold text-sm">
                  Go to Forum <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Downloads */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-royal-navy dark:text-royal-gold flex items-center gap-2 font-cinzel text-lg">
                <Download className="h-5 w-5" />
                Downloads
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <Download className="h-10 w-10 text-green-300 mb-2" />
                <p className="text-sm text-gray-500 mb-1">
                  Templates & Forms
                </p>
                <p className="text-xs text-gray-400">
                  Step-by-step templates and forms for each pillar of your foundation.
                </p>
              </div>
              <Link href="/downloads" className="mt-4">
                <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold text-sm">
                  View Downloads <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Beneficial Unit Card */}
          <Card className="flex flex-col border border-royal-gold/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-royal-navy dark:text-royal-gold flex items-center gap-2 font-cinzel text-lg">
                <Award className="h-5 w-5 text-royal-gold" />
                Your Beneficial Unit
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <Award className="h-10 w-10 text-royal-gold mb-2" />
                <p className="text-sm text-gray-500 mb-1">
                  Trust Instrument
                </p>
                <p className="text-xs text-gray-400">
                  View your beneficial unit details and download your certificate.
                </p>
              </div>
              <Link href="/beneficiary/unit" className="mt-4">
                <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold text-sm">
                  View Unit <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Upgrade Card (only for free users) */}
          {!isPremium && (
            <Card className="flex flex-col border-2 border-royal-gold/30 bg-gradient-to-br from-royal-gold/5 to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-royal-navy dark:text-royal-gold flex items-center gap-2 font-cinzel text-lg">
                  <Crown className="h-5 w-5 text-royal-gold" />
                  Acquire PMA Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col justify-center py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    {(stats?.coursesInProgress ?? 0) > 0 || (stats?.coursesCompleted ?? 0) > 0
                      ? "You've started your foundation. Unlock all 3 pillars with a monthly donation for Covenantal Membership."
                      : "Get full access to all courses, downloads, and community features with a monthly donation for Covenantal Membership."}
                  </p>
                  <ul className="space-y-1.5 mb-2">
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle className="w-3 h-3 text-royal-gold flex-shrink-0" />
                      All pillar courses
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle className="w-3 h-3 text-royal-gold flex-shrink-0" />
                      Full downloads library
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle className="w-3 h-3 text-royal-gold flex-shrink-0" />
                      Forum posting access
                    </li>
                  </ul>
                </div>
                <Link href="/pricing" className="mt-4">
                  <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold text-sm">
                    View Plans <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Resources / Dictionary */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-royal-navy dark:text-royal-gold flex items-center gap-2 font-cinzel text-lg">
                <Search className="h-5 w-5" />
                Dictionary
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <FileText className="h-10 w-10 text-amber-300 mb-2" />
                <p className="text-sm text-gray-500 mb-1">
                  Black's Law Dictionary
                </p>
                <p className="text-xs text-gray-400">
                  Look up legal terms and definitions to support your foundation work.
                </p>
              </div>
              <Link href="/resources" className="mt-4">
                <Button className="w-full bg-royal-gold hover:bg-royal-gold/90 text-royal-navy font-cinzel font-bold text-sm">
                  Search Dictionary <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-royal-navy dark:text-royal-gold flex items-center gap-2 font-cinzel text-lg">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                  <Clock className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No recent activity yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start a course or join the forum to see activity here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {stats.recentActivity.slice(0, 5).map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getActivityIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="text-gray-500">{getActivityLabel(item.type)}</span>{" "}
                          <span className="font-medium truncate block">{item.title}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.date ? formatDate(item.date) : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
