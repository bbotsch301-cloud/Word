import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles enum
export const userRoleEnum = pgEnum('user_role', ['student', 'instructor', 'moderator', 'admin']);

// Proof Vault enums
export const proofStatusEnum = pgEnum('proof_status', ['pending', 'confirmed', 'failed']);
export const proofModeEnum = pgEnum('proof_mode', ['file', 'hash']);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  username: text("username").unique(), // Optional username for forum display
  role: userRoleEnum("role").default('student'),
  isActive: boolean("is_active").default(true),
  isEmailVerified: boolean("is_email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  pmaAgreementAcceptedAt: timestamp("pma_agreement_accepted_at"),
  // Subscription fields
  subscriptionTier: text("subscription_tier").default('free'), // 'free' | 'premium'
  subscriptionStatus: text("subscription_status").default('none'), // 'none' | 'active' | 'cancelled' | 'expired' | 'trialing'
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  squareCustomerId: text("square_customer_id"),
  squareSubscriptionId: text("square_subscription_id"),
  premiumGrantedBy: varchar("premium_granted_by"),
  premiumGrantedAt: timestamp("premium_granted_at"),
  beneficialUnitId: varchar("beneficial_unit_id"),
  emailNotifications: boolean("email_notifications").default(true),
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const newsletter_subscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  subscribed_at: timestamp("subscribed_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  level: text("level").notNull(), // beginner, intermediate, advanced
  duration: text("duration"), // e.g., "4 weeks", "8 hours"
  price: integer("price").default(0), // in cents, 0 for free
  isFree: boolean("is_free").default(false), // true for Trust/free-tier courses
  freePreviewLessons: integer("free_preview_lessons").default(1), // number of lessons free users can access
  imageUrl: text("image_url"),
  scheduledPublishAt: timestamp("scheduled_publish_at"),
  isPublished: boolean("is_published").default(false),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("courses_is_published_idx").on(table.isPublished),
]);

// Videos table for standalone videos and teachings
export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"), // Made optional for future video uploads
  embedUrl: text("embed_url"), // For YouTube, Vimeo, etc.
  thumbnailUrl: text("thumbnail_url"),
  category: text("category").notNull(),
  tags: text("tags"), // comma-separated tags
  duration: text("duration"), // e.g., "45 minutes"
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course sections/modules for the New Covenant Trust course
export const courseSections = pgTable("course_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description"),
  sectionOrder: integer("section_order").notNull(),
  videoId: varchar("video_id").references(() => videos.id),
  duration: text("duration").notNull(), // e.g., "5 min", "8 min"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video attachments (PDFs, documents, etc.)
export const videoAttachments = pgTable("video_attachments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"), // in bytes
  fileType: text("file_type").notNull(), // pdf, docx, etc.
  downloadCount: integer("download_count").default(0),
  isPublic: boolean("is_public").default(false), // whether accessible without auth
  createdAt: timestamp("created_at").defaultNow(),
});

// Video progress tracking
export const videoProgress = pgTable("video_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  videoId: varchar("video_id").notNull().references(() => videos.id),
  watchedDuration: integer("watched_duration").default(0), // in seconds
  totalDuration: integer("total_duration"), // in seconds
  isCompleted: boolean("is_completed").default(false),
  lastWatchedAt: timestamp("last_watched_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("uq_video_progress_user_video").on(table.userId, table.videoId),
  index("video_progress_user_id_idx").on(table.userId),
  index("video_progress_video_id_idx").on(table.videoId),
]);

// Course section progress
export const sectionProgress = pgTable("section_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sectionId: varchar("section_id").notNull().references(() => courseSections.id),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("uq_section_progress_user_section").on(table.userId, table.sectionId),
]);

// Resources table for downloadable content
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // pdf, audio, image, etc.
  fileSize: integer("file_size"), // in bytes
  isPublished: boolean("is_published").default(false),
  downloadCount: integer("download_count").default(0),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // lesson content/notes
  videoUrl: text("video_url"),
  order: integer("order").notNull().default(0),
  duration: text("duration"), // e.g., "30 minutes"
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("lessons_course_id_idx").on(table.courseId),
]);

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  courseId: varchar("course_id").notNull().references(() => courses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // percentage 0-100
}, (table) => [
  uniqueIndex("uq_enrollments_user_course").on(table.userId, table.courseId),
  index("enrollments_user_id_idx").on(table.userId),
  index("enrollments_course_id_idx").on(table.courseId),
]);

export const lesson_progress = pgTable("lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
}, (table) => [
  uniqueIndex("uq_lesson_progress_user_lesson").on(table.userId, table.lessonId),
]);

export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  shortTitle: text("short_title"),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: text("file_size"),
  category: text("category").notNull(),
  iconType: text("icon_type").default("file-text"),
  whenToUse: text("when_to_use"),
  whyItMatters: text("why_it_matters"),
  contents: text("contents"),
  scriptureText: text("scripture_text"),
  scriptureReference: text("scripture_reference"),
  isPublic: boolean("is_public").default(false),
  isFree: boolean("is_free").default(false), // true for Trust/free-tier downloads
  isPublished: boolean("is_published").default(false),
  downloadCount: integer("download_count").default(0),
  courseId: varchar("course_id").references(() => courses.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("downloads_is_published_idx").on(table.isPublished),
  index("downloads_category_idx").on(table.category),
]);

// Per-user download tracking
export const userDownloads = pgTable("user_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  downloadId: varchar("download_id").notNull().references(() => downloads.id),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  ipAddress: text("ip_address"),
}, (table) => [
  index("user_downloads_user_id_idx").on(table.userId),
  index("user_downloads_download_id_idx").on(table.downloadId),
]);

// Page content management
export const page_content = pgTable("page_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageName: text("page_name").notNull(), // 'about', 'home', 'education', etc.
  contentKey: text("content_key").notNull(), // 'hero_background', 'main_image', etc.
  contentValue: text("content_value").notNull(), // URL or text content
  contentType: text("content_type").notNull(), // 'image', 'text', 'html'
  description: text("description"), // human-readable description
  updatedById: varchar("updated_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("uq_page_content_page_key").on(table.pageName, table.contentKey),
]);

export const forum_categories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3B82F6"), // hex color for category badge
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forum_threads = pgTable("forum_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: varchar("category_id").notNull().references(() => forum_categories.id, { onDelete: 'cascade' }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyUserId: varchar("last_reply_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("forum_threads_category_id_idx").on(table.categoryId),
  index("forum_threads_author_id_idx").on(table.authorId),
  index("forum_threads_created_at_idx").on(table.createdAt),
]);

export const forum_replies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  threadId: varchar("thread_id").notNull().references(() => forum_threads.id, { onDelete: 'cascade' }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  parentReplyId: varchar("parent_reply_id"), // for nested replies - self-reference added separately
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("forum_replies_thread_id_idx").on(table.threadId),
  index("forum_replies_author_id_idx").on(table.authorId),
]);

export const forum_likes = pgTable("forum_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  threadId: varchar("thread_id").references(() => forum_threads.id, { onDelete: 'cascade' }),
  replyId: varchar("reply_id").references(() => forum_replies.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("uq_forum_likes_thread").on(table.userId, table.threadId),
  uniqueIndex("uq_forum_likes_reply").on(table.userId, table.replyId),
]);

// Admin audit log table
export const admin_audit_log = pgTable("admin_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH
  entityType: text("entity_type").notNull(), // USER, COURSE, VIDEO, RESOURCE, etc.
  entityId: varchar("entity_id").notNull(),
  oldData: text("old_data"), // JSON string of previous state
  newData: text("new_data"), // JSON string of new state
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Forum moderation enums
export const flagStatusEnum = pgEnum('flag_status', ['pending', 'reviewed', 'dismissed']);
export const flagContentTypeEnum = pgEnum('flag_content_type', ['thread', 'reply']);
export const warningSeverityEnum = pgEnum('warning_severity', ['notice', 'warning', 'final']);

// Flagged content table
export const flaggedContent = pgTable("flagged_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: flagContentTypeEnum("content_type").notNull(),
  contentId: varchar("content_id").notNull(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  status: flagStatusEnum("status").default('pending'),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("flagged_content_status_idx").on(table.status),
  index("flagged_content_reporter_idx").on(table.reporterId),
]);

// User warnings table
export const userWarnings = pgTable("user_warnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  issuedBy: varchar("issued_by").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  severity: warningSeverityEnum("severity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("user_warnings_user_id_idx").on(table.userId),
]);

export const flaggedContentRelations = relations(flaggedContent, ({ one }) => ({
  reporter: one(users, {
    fields: [flaggedContent.reporterId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [flaggedContent.reviewedBy],
    references: [users.id],
  }),
}));

export const userWarningRelations = relations(userWarnings, ({ one }) => ({
  user: one(users, {
    fields: [userWarnings.userId],
    references: [users.id],
  }),
  issuer: one(users, {
    fields: [userWarnings.issuedBy],
    references: [users.id],
  }),
}));

// Relations
export const userRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  videos: many(videos),
  resources: many(resources),
  enrollments: many(enrollments),
  lessonProgress: many(lesson_progress),
  forumThreads: many(forum_threads),
  forumReplies: many(forum_replies),
  forumLikes: many(forum_likes),
  auditLogs: many(admin_audit_log),
  videoProgress: many(videoProgress),
  sectionProgress: many(sectionProgress),
  userDownloads: many(userDownloads),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  creator: one(users, {
    fields: [courses.createdById],
    references: [users.id],
  }),
  lessons: many(lessons),
  enrollments: many(enrollments),
  downloads: many(downloads),
  sections: many(courseSections),
}));

export const videoRelations = relations(videos, ({ one, many }) => ({
  creator: one(users, {
    fields: [videos.createdById],
    references: [users.id],
  }),
  attachments: many(videoAttachments),
  progress: many(videoProgress),
  sections: many(courseSections),
}));

export const courseSectionRelations = relations(courseSections, ({ one }) => ({
  course: one(courses, {
    fields: [courseSections.courseId],
    references: [courses.id],
  }),
  video: one(videos, {
    fields: [courseSections.videoId],
    references: [videos.id],
  }),
}));

export const videoAttachmentRelations = relations(videoAttachments, ({ one }) => ({
  video: one(videos, {
    fields: [videoAttachments.videoId],
    references: [videos.id],
  }),
}));

export const videoProgressRelations = relations(videoProgress, ({ one }) => ({
  user: one(users, {
    fields: [videoProgress.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoProgress.videoId],
    references: [videos.id],
  }),
}));

export const sectionProgressRelations = relations(sectionProgress, ({ one }) => ({
  user: one(users, {
    fields: [sectionProgress.userId],
    references: [users.id],
  }),
  section: one(courseSections, {
    fields: [sectionProgress.sectionId],
    references: [courseSections.id],
  }),
}));

export const downloadRelations = relations(downloads, ({ one, many }) => ({
  course: one(courses, {
    fields: [downloads.courseId],
    references: [courses.id],
  }),
  userDownloads: many(userDownloads),
}));

export const userDownloadRelations = relations(userDownloads, ({ one }) => ({
  user: one(users, {
    fields: [userDownloads.userId],
    references: [users.id],
  }),
  download: one(downloads, {
    fields: [userDownloads.downloadId],
    references: [downloads.id],
  }),
}));

export const resourceRelations = relations(resources, ({ one }) => ({
  creator: one(users, {
    fields: [resources.createdById],
    references: [users.id],
  }),
}));

export const lessonRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(lesson_progress),
}));

export const forumCategoryRelations = relations(forum_categories, ({ many }) => ({
  threads: many(forum_threads),
}));

export const forumThreadRelations = relations(forum_threads, ({ one, many }) => ({
  category: one(forum_categories, {
    fields: [forum_threads.categoryId],
    references: [forum_categories.id],
  }),
  author: one(users, {
    fields: [forum_threads.authorId],
    references: [users.id],
  }),
  lastReplyUser: one(users, {
    fields: [forum_threads.lastReplyUserId],
    references: [users.id],
  }),
  replies: many(forum_replies),
  likes: many(forum_likes),
}));

export const forumReplyRelations = relations(forum_replies, ({ one, many }) => ({
  thread: one(forum_threads, {
    fields: [forum_replies.threadId],
    references: [forum_threads.id],
  }),
  author: one(users, {
    fields: [forum_replies.authorId],
    references: [users.id],
  }),
  likes: many(forum_likes),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
  isEmailVerified: true,
  emailVerificationToken: true,
  emailVerificationExpires: true,
  passwordResetToken: true,
  passwordResetExpires: true,
  termsAcceptedAt: true,
  pmaAgreementAcceptedAt: true,
  createdAt: true,
  updatedAt: true,
  role: true,
  subscriptionTier: true,
  subscriptionStatus: true,
  subscriptionStartDate: true,
  subscriptionEndDate: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  squareCustomerId: true,
  squareSubscriptionId: true,
  premiumGrantedBy: true,
  premiumGrantedAt: true,
  beneficialUnitId: true,
  lastLoginAt: true,
}).extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
      "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  privacyAccepted: z.literal(true, { errorMap: () => ({ message: "You must acknowledge the Privacy Policy" }) }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  created_at: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletter_subscribers).omit({
  id: true,
  subscribed_at: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  userId: true,
  enrolledAt: true,
  completedAt: true,
  progress: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  downloadCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserDownloadSchema = createInsertSchema(userDownloads).omit({
  id: true,
  downloadedAt: true,
});

export type InsertUserDownload = z.infer<typeof insertUserDownloadSchema>;
export type UserDownload = typeof userDownloads.$inferSelect;

export const insertForumCategorySchema = createInsertSchema(forum_categories).omit({
  id: true,
  createdAt: true,
});

export const insertForumThreadSchema = createInsertSchema(forum_threads).omit({
  id: true,
  viewCount: true,
  replyCount: true,
  lastReplyAt: true,
  lastReplyUserId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumReplySchema = createInsertSchema(forum_replies).omit({
  id: true,
  isEdited: true,
  editedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumLikeSchema = createInsertSchema(forum_likes).omit({
  id: true,
  createdAt: true,
});

// Admin-specific schemas
// Video management schemas
export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSectionSchema = createInsertSchema(courseSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoAttachmentSchema = createInsertSchema(videoAttachments).omit({
  id: true,
  downloadCount: true,
  createdAt: true,
});

export const insertVideoProgressSchema = createInsertSchema(videoProgress).omit({
  id: true,
  lastWatchedAt: true,
  createdAt: true,
});

export const insertSectionProgressSchema = createInsertSchema(sectionProgress).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  downloadCount: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['student', 'instructor', 'moderator', 'admin']),
});

export const adminAuditLogSchema = createInsertSchema(admin_audit_log).omit({
  id: true,
  createdAt: true,
});

export const insertPageContentSchema = createInsertSchema(page_content).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePageContentSchema = z.object({
  contentValue: z.string(),
  description: z.string().optional(),
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUser = z.infer<typeof loginSchema>;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;
export type Newsletter = typeof newsletter_subscribers.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumCategory = typeof forum_categories.$inferSelect;

export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumThread = typeof forum_threads.$inferSelect;

export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = typeof forum_replies.$inferSelect;

export type InsertForumLike = z.infer<typeof insertForumLikeSchema>;
export type ForumLike = typeof forum_likes.$inferSelect;

// Admin-specific types
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
export type AdminAuditLog = typeof admin_audit_log.$inferSelect;

export type InsertPageContent = z.infer<typeof insertPageContentSchema>;
export type PageContent = typeof page_content.$inferSelect;
export type UpdatePageContent = z.infer<typeof updatePageContentSchema>;

// Trust document downloads table
export const trustDownloads = pgTable("trust_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
});

export const insertTrustDownloadSchema = createInsertSchema(trustDownloads).omit({ id: true });
export type InsertTrustDownload = z.infer<typeof insertTrustDownloadSchema>;
export type TrustDownload = typeof trustDownloads.$inferSelect;

// Proof Vault - timestamped proof records
export const proofs = pgTable("proofs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  mode: proofModeEnum("mode").notNull(),
  originalFilename: text("original_filename"),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  sha256: text("sha256").notNull(),
  provider: text("provider").default('opentimestamps'),
  status: proofStatusEnum("status").default('pending'),
  otsProof: text("ots_proof"), // base64-encoded OTS proof binary
  storageKey: text("storage_key"), // randomized key for stored file (if applicable)
  label: text("label"), // user-provided description
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastUpgradeAttemptAt: timestamp("last_upgrade_attempt_at"),
  errorMessage: text("error_message"),
}, (table) => [
  index("proofs_user_id_idx").on(table.userId),
  index("proofs_sha256_idx").on(table.sha256),
]);

export const proofRelations = relations(proofs, ({ one }) => ({
  user: one(users, {
    fields: [proofs.userId],
    references: [users.id],
  }),
}));

export const insertProofSchema = createInsertSchema(proofs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUpgradeAttemptAt: true,
  errorMessage: true,
});

export const createProofHashSchema = z.object({
  sha256: z.string().regex(/^[a-fA-F0-9]{64}$/, "Must be a valid SHA-256 hex string"),
  label: z.string().max(200).optional(),
});

export type InsertProof = z.infer<typeof insertProofSchema>;
export type Proof = typeof proofs.$inferSelect;

// Dictionary entries table for Black's Law Dictionary search
export const dictionaryEntries = pgTable("dictionary_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  term: text("term").notNull(),
  termLower: text("term_lower").notNull(),
  definition: text("definition").notNull(),
  letter: varchar("letter", { length: 1 }).notNull(),
  subContext: text("sub_context"),
  pageNumber: integer("page_number"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("dictionary_entries_term_lower_idx").on(table.termLower),
  index("dictionary_entries_letter_idx").on(table.letter),
]);

export const insertDictionaryEntrySchema = createInsertSchema(dictionaryEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertDictionaryEntry = z.infer<typeof insertDictionaryEntrySchema>;
export type DictionaryEntry = typeof dictionaryEntries.$inferSelect;

// Notifications
// NOTE: 'course_update' is unused in application code but retained to avoid a DB migration.
export const notificationTypeEnum = pgEnum('notification_type', ['forum_reply', 'course_update', 'system', 'welcome']);

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  linkUrl: text("link_url"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("notifications_user_id_idx").on(table.userId),
  index("notifications_user_unread_idx").on(table.userId, table.isRead),
]);

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Thread subscriptions (follow/unfollow threads)
export const threadSubscriptions = pgTable("thread_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  threadId: varchar("thread_id").notNull().references(() => forum_threads.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("uq_thread_subscriptions_user_thread").on(table.userId, table.threadId),
  index("thread_subscriptions_thread_id_idx").on(table.threadId),
]);

export const threadSubscriptionRelations = relations(threadSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [threadSubscriptions.userId],
    references: [users.id],
  }),
  thread: one(forum_threads, {
    fields: [threadSubscriptions.threadId],
    references: [forum_threads.id],
  }),
}));

export type ThreadSubscription = typeof threadSubscriptions.$inferSelect;

// Video management types
export type InsertCourseSection = z.infer<typeof insertCourseSectionSchema>;
export type CourseSection = typeof courseSections.$inferSelect;

export type InsertVideoAttachment = z.infer<typeof insertVideoAttachmentSchema>;
export type VideoAttachment = typeof videoAttachments.$inferSelect;

export type InsertVideoProgress = z.infer<typeof insertVideoProgressSchema>;
export type VideoProgress = typeof videoProgress.$inferSelect;

export type InsertSectionProgress = z.infer<typeof insertSectionProgressSchema>;
export type SectionProgress = typeof sectionProgress.$inferSelect;

// Comments (polymorphic for videos and lessons)
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetType: text("target_type").notNull(), // 'video' | 'lesson'
  targetId: varchar("target_id").notNull(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("comments_target_idx").on(table.targetType, table.targetId),
  index("comments_author_id_idx").on(table.authorId),
]);

export const commentRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  isEdited: true,
  editedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Newsletter Campaigns
export const newsletter_campaigns = pgTable("newsletter_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default('draft'), // 'draft' | 'sent'
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count"),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("newsletter_campaigns_status_idx").on(table.status),
]);

export const newsletterCampaignRelations = relations(newsletter_campaigns, ({ one }) => ({
  createdBy: one(users, {
    fields: [newsletter_campaigns.createdById],
    references: [users.id],
  }),
}));

export const insertNewsletterCampaignSchema = createInsertSchema(newsletter_campaigns).omit({
  id: true,
  status: true,
  sentAt: true,
  recipientCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNewsletterCampaign = z.infer<typeof insertNewsletterCampaignSchema>;
export type NewsletterCampaign = typeof newsletter_campaigns.$inferSelect;

// Subscription history/audit table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tier: text("tier").notNull(), // 'free' | 'premium'
  status: text("status").notNull(), // 'active' | 'cancelled' | 'expired' | 'trialing'
  source: text("source").notNull(), // 'admin_grant' | 'stripe' | 'manual'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  cancelledAt: timestamp("cancelled_at"),
  grantedByAdminId: varchar("granted_by_admin_id").references(() => users.id),
  stripeSubscriptionId: text("stripe_subscription_id"),
  squarePaymentId: text("square_payment_id"),
  squareSubscriptionId: text("square_subscription_id"),
  amount: integer("amount"), // in cents
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("subscriptions_user_id_idx").on(table.userId),
]);

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  grantedByAdmin: one(users, {
    fields: [subscriptions.grantedByAdminId],
    references: [users.id],
  }),
}));

// Subscription Zod schemas
export const subscriptionTierSchema = z.enum(['free', 'premium']);
export const subscriptionStatusSchema = z.enum(['none', 'active', 'cancelled', 'expired', 'trialing']);

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Beneficial Units: each beneficiary receives 1 unit representing equal share (1/N) of trust corpus
export const beneficialUnits = pgTable("beneficial_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  unitNumber: integer("unit_number").notNull().unique(),
  issuedAt: timestamp("issued_at").defaultNow(),
  status: text("status").default('active'),
  withdrawnAt: timestamp("withdrawn_at"),
});

export const beneficialUnitRelations = relations(beneficialUnits, ({ one }) => ({
  user: one(users, {
    fields: [beneficialUnits.userId],
    references: [users.id],
  }),
}));

export const insertBeneficialUnitSchema = createInsertSchema(beneficialUnits).omit({
  id: true,
  issuedAt: true,
  withdrawnAt: true,
});

export type InsertBeneficialUnit = z.infer<typeof insertBeneficialUnitSchema>;
export type BeneficialUnit = typeof beneficialUnits.$inferSelect;

// ====== TRUST STRUCTURE ======
// Biblical ecclesiology: Acceptance of the New Covenant (Granting Act) → Body of Christ → Internal Organs → Members

export const trustEntityLayerEnum = pgEnum('trust_entity_layer', [
  'covenant',        // Acceptance of the New Covenant IS the granting act: the individual becomes Grantor by accepting the pre-existing trust instrument (Jer 31:31-34, Heb 8:8-12, Heb 9:16-17, Eph 1:13-14, Rom 8:17)
  'body',            // Body of Christ: the collective you enter (1 Cor 12:12-27, Gal 3:27-28)
  'stewardship',     // Organs of the Body: asset stewardship (Matt 25:21, 1 Peter 4:10)
  'assembly',        // The gathered ecclesia: people governance (Matt 16:18, Acts 2:42)
  'region',          // City-churches / regional assemblies (Titus 1:5, Rev 2-3)
  'household',       // House-churches / oikos groups (Acts 2:46, Rom 16:5)
  'craft',           // Skilled workers / Bezalel pattern (Exodus 35:10)
  'ministry',        // Service initiatives / diakonia (Nehemiah pattern)
  'member',          // Joint heirs: members of the Body (Romans 8:17)
]);

// Governance roles within the trust structure
export const trustRoleEnum = pgEnum('trust_role', [
  'grantor',          // the individual who accepted the New Covenant, becoming Grantor by the act of acceptance — deposits old man, body, property into trust (Rom 6:6, Rom 12:1, Rom 8:17)
  'trustee',          // administrative authority
  'protector',        // protector council member: checks & balances
  'steward',          // chapter/commune leader
  'beneficiary',      // community participant
  'officer',          // operational role
  'elder',            // local governance: 1 Timothy 3:1-7, Titus 1:5-9
  'deacon',           // service governance: 1 Timothy 3:8-13
  'apostle',          // five-fold ministry: Ephesians 4:11
  'prophet',          // five-fold ministry: Ephesians 4:11
  'evangelist',       // five-fold ministry: Ephesians 4:11
  'pastor',           // five-fold ministry: Ephesians 4:11
  'teacher',          // five-fold ministry: Ephesians 4:11
]);

export const trustEntities = pgTable("trust_entities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subtitle: text("subtitle"),           // e.g. "Constitutional Root", "Governance Anchor"
  layer: trustEntityLayerEnum("layer").notNull(),
  entityType: text("entity_type").notNull(), // e.g. "covenant", "body", "stewardship", "assembly", "region"
  description: text("description"),
  // Governance
  trusteeLabel: text("trustee_label"),    // who serves as trustee
  protectorLabel: text("protector_label"),// protector council info
  // Location / physical
  location: text("location"),
  acreage: text("acreage"),             // e.g. "42 acres"
  // Financial
  totalValue: integer("total_value"),   // in cents
  annualRevenue: integer("annual_revenue"), // in cents
  // Membership
  memberCount: integer("member_count").default(0),
  // Status
  status: text("status").default('active'), // active, planned, dissolved
  // Visual / display
  color: text("color"),                  // hex color for diagram node
  icon: text("icon"),                    // lucide icon name
  sortOrder: integer("sort_order").default(0),
  // Metadata
  charter: text("charter"),              // governing document text / purpose statement
  legalBasis: text("legal_basis"),       // constitutional/legal foundation
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trustRelationshipTypeEnum = pgEnum('trust_relationship_type', [
  'authority',       // red: constitutional authority chain
  'grants',          // black: grants powers/rights
  'funds',           // blue: financial flows
  'land',            // green: land stewardship
  'remits',          // purple: remits/reports
  'establishes_pma', // dashed purple: establishes a PMA
  'oversees',        // dashed orange: oversight
  'coordinates',     // dashed gray: coordination
  'benefits',        // dashed teal: trusts hold assets for benefit of members
  'shepherds',       // pastoral care: 1 Peter 5:2
  'teaches',         // discipleship chain: Matthew 28:20
  'serves',          // diaconal service: Mark 10:45
  'tithes',          // storehouse giving: Malachi 3:10
  'enters',          // gateway: baptized into the Body (1 Cor 12:13)
]);

export const trustRelationships = pgTable("trust_relationships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromEntityId: varchar("from_entity_id").notNull().references(() => trustEntities.id),
  toEntityId: varchar("to_entity_id").notNull().references(() => trustEntities.id),
  relationshipType: trustRelationshipTypeEnum("relationship_type").notNull(),
  label: text("label"),                  // optional descriptive label on the edge
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("trust_rel_from_idx").on(table.fromEntityId),
  index("trust_rel_to_idx").on(table.toEntityId),
]);

export const trustEntityRelations = relations(trustEntities, ({ many }) => ({
  outgoingRelationships: many(trustRelationships, { relationName: "fromEntity" }),
  incomingRelationships: many(trustRelationships, { relationName: "toEntity" }),
}));

export const trustRelationshipRelations = relations(trustRelationships, ({ one }) => ({
  fromEntity: one(trustEntities, {
    fields: [trustRelationships.fromEntityId],
    references: [trustEntities.id],
    relationName: "fromEntity",
  }),
  toEntity: one(trustEntities, {
    fields: [trustRelationships.toEntityId],
    references: [trustEntities.id],
    relationName: "toEntity",
  }),
}));

export const insertTrustEntitySchema = createInsertSchema(trustEntities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrustRelationshipSchema = createInsertSchema(trustRelationships).omit({
  id: true,
  createdAt: true,
});

export type InsertTrustEntity = z.infer<typeof insertTrustEntitySchema>;
export type TrustEntity = typeof trustEntities.$inferSelect;
export type InsertTrustRelationship = z.infer<typeof insertTrustRelationshipSchema>;
export type TrustRelationship = typeof trustRelationships.$inferSelect;

// ═══════════════════════════════════════════════════════════
// TRUST DOCUMENT MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const trustDocumentTemplates = pgTable("trust_document_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  applicableLayers: text("applicable_layers").array(),
  isBuiltIn: boolean("is_built_in").default(false),
  status: text("status").default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trustTemplateSections = pgTable("trust_template_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => trustDocumentTemplates.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  contentTemplate: text("content_template").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const trustDocuments = pgTable("trust_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityId: varchar("entity_id").notNull().references(() => trustEntities.id),
  templateId: varchar("template_id").references(() => trustDocumentTemplates.id),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  version: integer("version").default(1),
  status: text("status").default('draft'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trustDocumentSections = pgTable("trust_document_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => trustDocuments.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").default(0),
});

// Relations
export const trustDocumentTemplateRelations = relations(trustDocumentTemplates, ({ many }) => ({
  sections: many(trustTemplateSections),
}));

export const trustTemplateSectionRelations = relations(trustTemplateSections, ({ one }) => ({
  template: one(trustDocumentTemplates, {
    fields: [trustTemplateSections.templateId],
    references: [trustDocumentTemplates.id],
  }),
}));

export const trustDocumentRelations = relations(trustDocuments, ({ one, many }) => ({
  entity: one(trustEntities, {
    fields: [trustDocuments.entityId],
    references: [trustEntities.id],
  }),
  template: one(trustDocumentTemplates, {
    fields: [trustDocuments.templateId],
    references: [trustDocumentTemplates.id],
  }),
  sections: many(trustDocumentSections),
}));

export const trustDocumentSectionRelations = relations(trustDocumentSections, ({ one }) => ({
  document: one(trustDocuments, {
    fields: [trustDocumentSections.documentId],
    references: [trustDocuments.id],
  }),
}));

// Insert schemas
export const insertTrustDocumentTemplateSchema = createInsertSchema(trustDocumentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrustTemplateSectionSchema = createInsertSchema(trustTemplateSections).omit({
  id: true,
});

export const insertTrustDocumentSchema = createInsertSchema(trustDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrustDocumentSectionSchema = createInsertSchema(trustDocumentSections).omit({
  id: true,
});

// Types
export type TrustDocumentTemplate = typeof trustDocumentTemplates.$inferSelect;
export type InsertTrustDocumentTemplate = z.infer<typeof insertTrustDocumentTemplateSchema>;
export type TrustTemplateSectionType = typeof trustTemplateSections.$inferSelect;
export type InsertTrustTemplateSection = z.infer<typeof insertTrustTemplateSectionSchema>;
export type TrustDocument = typeof trustDocuments.$inferSelect;
export type InsertTrustDocument = z.infer<typeof insertTrustDocumentSchema>;
export type TrustDocumentSection = typeof trustDocumentSections.$inferSelect;
export type InsertTrustDocumentSection = z.infer<typeof insertTrustDocumentSectionSchema>;

// Treasury enums and tables
export const treasuryTransactionTypeEnum = pgEnum('treasury_transaction_type', [
  'payment_allocation',
  'installment_allocation',
  'manual_adjustment',
  'crypto_conversion',
  'crypto_transfer',
  'disbursement',
]);

export const treasuryTransactions = pgTable("treasury_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: treasuryTransactionTypeEnum("type").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").default('USD'),
  description: text("description"),
  sourcePaymentId: text("source_payment_id"),
  sourceSubscriptionId: text("source_subscription_id"),
  sourceUserId: varchar("source_user_id").references(() => users.id),
  walletAddress: text("wallet_address"),
  cryptoAmount: text("crypto_amount"),
  cryptoCurrency: text("crypto_currency"),
  transactionHash: text("transaction_hash"),
  chainId: text("chain_id"),
  performedByAdminId: varchar("performed_by_admin_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("treasury_tx_type_idx").on(table.type),
  index("treasury_tx_source_user_idx").on(table.sourceUserId),
  index("treasury_tx_created_idx").on(table.createdAt),
]);

export const treasurySettings = pgTable("treasury_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedById: varchar("updated_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTreasuryTransactionSchema = createInsertSchema(treasuryTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertTreasurySettingSchema = createInsertSchema(treasurySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TreasuryTransaction = typeof treasuryTransactions.$inferSelect;
export type InsertTreasuryTransaction = z.infer<typeof insertTreasuryTransactionSchema>;
export type TreasurySetting = typeof treasurySettings.$inferSelect;
export type InsertTreasurySetting = z.infer<typeof insertTreasurySettingSchema>;

// Flagged content schemas and types
export const insertFlaggedContentSchema = createInsertSchema(flaggedContent).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
});

export type InsertFlaggedContent = z.infer<typeof insertFlaggedContentSchema>;
export type FlaggedContent = typeof flaggedContent.$inferSelect;

// User warnings schemas and types
export const insertUserWarningSchema = createInsertSchema(userWarnings).omit({
  id: true,
  createdAt: true,
});

export type InsertUserWarning = z.infer<typeof insertUserWarningSchema>;
export type UserWarning = typeof userWarnings.$inferSelect;
