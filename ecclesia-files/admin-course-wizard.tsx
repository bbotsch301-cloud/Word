import { useState, lazy, Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  Video,
  Eye,
  Save,
  Loader2,
  Upload,
  SkipForward,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ObjectUploader } from "@/components/ObjectUploader";

const RichTextEditor = lazy(() => import("@/components/RichTextEditor"));

// ===== Types =====

interface LessonDraft {
  title: string;
  videoUrl: string;
  description: string;
  duration: string;
  content: string;
}

// ===== YouTube Helper =====

function getYouTubeEmbedId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

// ===== Step Indicator =====

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = ["Foundation", "Lessons", "Details", "Review"];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((label, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isDone ? "bg-green-600 text-white" :
                isActive ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {isDone ? <Check className="h-4 w-4" /> : step}
              </div>
              <span className={`text-sm hidden sm:inline ${isActive ? "font-semibold" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className={`hidden sm:block w-12 h-0.5 mx-2 ${step < currentStep ? "bg-green-600" : "bg-muted"}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ===== Step 1: Course Foundation =====

interface Step1Props {
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  imageUrl: string;
  onChange: (field: string, value: string) => void;
}

function Step1Foundation({ title, description, category, level, duration, imageUrl, onChange }: Step1Props) {
  const handleImageUploadParams = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return { method: "PUT" as const, url: data.uploadURL };
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Let's build your course</h2>
        <p className="text-muted-foreground mt-1">Start with the basics — tell your members what this is about.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">What is this course about?</label>
        <Input
          placeholder="Give it a clear, compelling name..."
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">In your own words, describe what members will learn</label>
        <p className="text-xs text-muted-foreground">Why does this matter? What will they walk away with?</p>
        <Textarea
          placeholder="Write a few sentences about what this course covers and why it's important..."
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Input
            placeholder="e.g., Trust Law, Scripture Study"
            value={category}
            onChange={(e) => onChange("category", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Level</label>
          <Select value={level} onValueChange={(v) => onChange("level", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Estimated Duration</label>
          <Input
            placeholder="e.g., 4 weeks, 6 hours"
            value={duration}
            onChange={(e) => onChange("duration", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cover Image</label>
        <p className="text-xs text-muted-foreground">Upload a design, graphic, or banner for this course</p>
        <div className="flex items-center gap-4">
          {imageUrl && (
            <img src={imageUrl} alt="Cover" className="w-32 h-20 object-cover rounded-md border" />
          )}
          <ObjectUploader
            onGetUploadParameters={handleImageUploadParams}
            onComplete={(result) => {
              const file = result.successful?.[0];
              if (file?.uploadURL) onChange("imageUrl", file.uploadURL);
            }}
            maxFileSize={10485760}
          >
            <Upload className="h-4 w-4 mr-2" />
            {imageUrl ? "Change Image" : "Upload Image"}
          </ObjectUploader>
        </div>
      </div>
    </div>
  );
}

// ===== Step 2: Build Lessons =====

interface Step2Props {
  lessons: LessonDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof LessonDraft, value: string) => void;
  onReorder: (index: number, direction: "up" | "down") => void;
}

function Step2Lessons({ lessons, onAdd, onRemove, onUpdate, onReorder }: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Build your lessons</h2>
        <p className="text-muted-foreground mt-1">Add each video lesson. You can reorder them anytime.</p>
      </div>

      {lessons.map((lesson, i) => {
        const embedId = getYouTubeEmbedId(lesson.videoUrl);
        return (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">Lesson {i + 1}</Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => onReorder(i, "up")}
                    disabled={i === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7"
                    onClick={() => onReorder(i, "down")}
                    disabled={i === lessons.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                    onClick={() => onRemove(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">What is this lesson called?</label>
                <Input
                  placeholder="Lesson title..."
                  value={lesson.title}
                  onChange={(e) => onUpdate(i, "title", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">YouTube URL</label>
                  <Input
                    placeholder="Paste your YouTube link here..."
                    value={lesson.videoUrl}
                    onChange={(e) => onUpdate(i, "videoUrl", e.target.value)}
                  />
                  {embedId && (
                    <div className="aspect-video rounded-md overflow-hidden bg-black mt-2">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${embedId}`}
                        title={lesson.title || "Video preview"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">In a sentence or two, what will members learn?</label>
                    <Textarea
                      placeholder="Describe what this lesson covers..."
                      value={lesson.description}
                      onChange={(e) => onUpdate(i, "description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <Input
                      placeholder="e.g., 30 minutes"
                      value={lesson.duration}
                      onChange={(e) => onUpdate(i, "duration", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button onClick={onAdd} variant="outline" className="w-full border-dashed py-8">
        <Plus className="h-5 w-5 mr-2" />
        Add Lesson
      </Button>

      {lessons.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} added
        </p>
      )}
    </div>
  );
}

// ===== Step 3: Lesson Details =====

interface Step3Props {
  lessons: LessonDraft[];
  currentLessonIndex: number;
  onUpdateContent: (index: number, content: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

function Step3Details({ lessons, currentLessonIndex, onUpdateContent, onNext, onPrev, onSkip }: Step3Props) {
  const lesson = lessons[currentLessonIndex];
  const embedId = getYouTubeEmbedId(lesson.videoUrl);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Add details to your lessons</h2>
        <p className="text-muted-foreground mt-1">
          Lesson {currentLessonIndex + 1} of {lessons.length}: <strong>{lesson.title || "Untitled"}</strong>
        </p>
      </div>

      {embedId && (
        <div className="aspect-video rounded-md overflow-hidden bg-black max-w-2xl mx-auto">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${embedId}`}
            title={lesson.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Notes, scripture references, or key points for this lesson
        </label>
        <p className="text-xs text-muted-foreground">
          Add any supporting content — images, charts, and graphics can be inserted using the image button in the toolbar.
        </p>
        <Suspense fallback={<div className="h-48 border rounded-md flex items-center justify-center text-muted-foreground">Loading editor...</div>}>
          <RichTextEditor
            content={lesson.content}
            onChange={(html) => onUpdateContent(currentLessonIndex, html)}
            placeholder="Write notes, add scripture references, insert images..."
            minHeight="200px"
          />
        </Suspense>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onPrev} disabled={currentLessonIndex === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous Lesson
        </Button>
        <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
          <SkipForward className="h-4 w-4 mr-1" /> Skip
        </Button>
        {currentLessonIndex < lessons.length - 1 ? (
          <Button onClick={onNext}>
            Next Lesson <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={onNext}>
            Continue to Review <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ===== Step 4: Review =====

interface Step4Props {
  course: { title: string; description: string; category: string; level: string; duration: string; imageUrl: string };
  lessons: LessonDraft[];
  publishMode: "draft" | "publish";
  onPublishModeChange: (mode: "draft" | "publish") => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function Step4Review({ course, lessons, publishMode, onPublishModeChange, isSubmitting, onSubmit }: Step4Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Review your course</h2>
        <p className="text-muted-foreground mt-1">Make sure everything looks right before you publish.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            {course.imageUrl && (
              <img src={course.imageUrl} alt="Cover" className="w-40 h-24 object-cover rounded-md" />
            )}
            <div>
              <h3 className="text-xl font-bold">{course.title}</h3>
              <p className="text-muted-foreground mt-1">{course.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                {course.duration && <Badge variant="outline">{course.duration}</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold mb-3">{lessons.length} Lesson{lessons.length !== 1 ? "s" : ""}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lessons.map((lesson, i) => {
            const embedId = getYouTubeEmbedId(lesson.videoUrl);
            return (
              <Card key={i}>
                <CardContent className="p-3">
                  {embedId && (
                    <img
                      src={`https://img.youtube.com/vi/${embedId}/mqdefault.jpg`}
                      alt={lesson.title}
                      className="w-full aspect-video object-cover rounded-md mb-2"
                    />
                  )}
                  <p className="font-medium text-sm">{i + 1}. {lesson.title}</p>
                  {lesson.duration && <p className="text-xs text-muted-foreground">{lesson.duration}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={publishMode === "draft" ? "default" : "outline"}
            onClick={() => onPublishModeChange("draft")}
            size="sm"
          >
            <Save className="h-4 w-4 mr-1" /> Save as Draft
          </Button>
          <Button
            variant={publishMode === "publish" ? "default" : "outline"}
            onClick={() => onPublishModeChange("publish")}
            size="sm"
          >
            <Eye className="h-4 w-4 mr-1" /> Publish Now
          </Button>
        </div>

        <Button onClick={onSubmit} disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Course...</>
          ) : (
            <><Check className="h-4 w-4 mr-2" /> {publishMode === "publish" ? "Publish Course" : "Save Draft"}</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ===== Main Wizard =====

export default function AdminCourseWizard() {
  usePageTitle("Admin - Create New Course");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [step, setStep] = useState(1);
  const [detailLessonIndex, setDetailLessonIndex] = useState(0);
  const [publishMode, setPublishMode] = useState<"draft" | "publish">("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Course state
  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    duration: "",
    imageUrl: "",
  });

  // Lessons state
  const [lessons, setLessons] = useState<LessonDraft[]>([
    { title: "", videoUrl: "", description: "", duration: "", content: "" },
  ]);

  const updateCourse = (field: string, value: string) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const addLesson = () => {
    setLessons((prev) => [...prev, { title: "", videoUrl: "", description: "", duration: "", content: "" }]);
  };

  const removeLesson = (index: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLesson = (index: number, field: keyof LessonDraft, value: string) => {
    setLessons((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const reorderLesson = (index: number, direction: "up" | "down") => {
    setLessons((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  // Validation
  const canProceedStep1 = course.title.trim() && course.description.trim() && course.category.trim();
  const canProceedStep2 = lessons.length > 0 && lessons.every((l) => l.title.trim());

  // Navigation
  const goNext = () => {
    if (step === 3) {
      // In step 3, advance lesson or go to step 4
      if (detailLessonIndex < lessons.length - 1) {
        setDetailLessonIndex((prev) => prev + 1);
      } else {
        setStep(4);
      }
    } else {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const goBack = () => {
    if (step === 3 && detailLessonIndex > 0) {
      setDetailLessonIndex((prev) => prev - 1);
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  // Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create course
      const courseRes = await apiRequest("POST", "/api/admin/courses", {
        ...course,
        price: 0,
        isFree: false,
      });
      const courseData = await courseRes.json();
      const courseId = courseData.id;

      // 2. Create lessons
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        await apiRequest("POST", `/api/admin/courses/${courseId}/lessons`, {
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          order: i,
        });
      }

      // 3. Publish if selected
      if (publishMode === "publish") {
        await apiRequest("PATCH", `/api/admin/courses/${courseId}/toggle-published`);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      toast({
        title: publishMode === "publish" ? "Course Published!" : "Course Saved as Draft",
        description: `"${course.title}" with ${lessons.length} lesson${lessons.length !== 1 ? "s" : ""} has been created.`,
      });
      navigate("/admin/courses");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/courses")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Course Maker
            </h1>
            <p className="text-sm text-muted-foreground">Create a new video course for your members</p>
          </div>
        </div>

        <StepIndicator currentStep={step} totalSteps={4} />

        {step === 1 && (
          <Step1Foundation {...course} onChange={updateCourse} />
        )}

        {step === 2 && (
          <Step2Lessons
            lessons={lessons}
            onAdd={addLesson}
            onRemove={removeLesson}
            onUpdate={updateLesson}
            onReorder={reorderLesson}
          />
        )}

        {step === 3 && (
          <Step3Details
            lessons={lessons}
            currentLessonIndex={detailLessonIndex}
            onUpdateContent={(i, content) => updateLesson(i, "content", content)}
            onNext={goNext}
            onPrev={() => setDetailLessonIndex((prev) => Math.max(prev - 1, 0))}
            onSkip={goNext}
          />
        )}

        {step === 4 && (
          <Step4Review
            course={course}
            lessons={lessons}
            publishMode={publishMode}
            onPublishModeChange={setPublishMode}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}

        {/* Bottom Navigation (not shown in step 3 which has its own nav, or step 4 which has submit) */}
        {(step === 1 || step === 2) && (
          <>
            <Separator className="my-6" />
            <div className="flex justify-between">
              <Button variant="ghost" onClick={goBack} disabled={step === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                onClick={goNext}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2)
                }
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
