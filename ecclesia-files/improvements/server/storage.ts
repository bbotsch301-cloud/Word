import {
  type User,
  type InsertUser,
  type LoginUser,
  type Contact,
  type InsertContact,
  type Newsletter,
  type InsertNewsletter,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Enrollment,
  type InsertEnrollment,
  type Download,
  type InsertDownload,
  type ForumCategory,
  type InsertForumCategory,
  type ForumThread,
  type InsertForumThread,
  type ForumReply,
  type InsertForumReply,
  type ForumLike,
  type InsertForumLike,
  type Video,
  type InsertVideo,
  type Resource,
  type InsertResource,
  type UpdateUserRole,
  type AdminAuditLog,
  type PageContent,
  type InsertPageContent,
  type UpdatePageContent,
  type TrustDownload,
  type InsertTrustDownload,
  type CourseSection,
  type InsertCourseSection,
  type VideoAttachment,
  type InsertVideoAttachment,
  type VideoProgress,
  type InsertVideoProgress,
  type SectionProgress,
  type InsertSectionProgress,
  type DictionaryEntry,
  type InsertDictionaryEntry,
  type Notification,
  type InsertNotification,
  type ThreadSubscription,
  type Comment,
  type InsertComment,
  type NewsletterCampaign,
  type InsertNewsletterCampaign,
  type UserDownload,
  type Subscription,
  type InsertSubscription,
  users,
  subscriptions,
  contacts,
  newsletter_subscribers,
  courses,
  lessons,
  enrollments,
  downloads,
  lesson_progress,
  forum_categories,
  forum_threads,
  forum_replies,
  forum_likes,
  videos,
  resources,
  admin_audit_log,
  page_content,
  trustDownloads,
  courseSections,
  videoAttachments,
  videoProgress,
  sectionProgress,
  dictionaryEntries,
  notifications,
  threadSubscriptions,
  comments,
  newsletter_campaigns,
  userDownloads,
  proofs,
  type Proof,
  type InsertProof,
  beneficialUnits,
  trustEntities,
  trustRelationships,
  type TrustEntity,
  type InsertTrustEntity,
  type TrustRelationship,
  type InsertTrustRelationship,
  trustDocumentTemplates,
  trustTemplateSections,
  trustDocuments,
  trustDocumentSections,
  type TrustDocumentTemplate,
  type InsertTrustDocumentTemplate,
  type TrustTemplateSectionType,
  type InsertTrustTemplateSection,
  type TrustDocument,
  type InsertTrustDocument,
  type TrustDocumentSection,
  type InsertTrustDocumentSection,
  treasuryTransactions,
  treasurySettings,
  type TreasuryTransaction,
  type InsertTreasuryTransaction,
  type TreasurySetting,
  flaggedContent,
  userWarnings,
  type FlaggedContent,
  type InsertFlaggedContent,
  type UserWarning,
  type InsertUserWarning,
} from "@shared/schema";
import { eq, and, desc, sql, or, inArray, ilike } from "drizzle-orm";
import { db } from "./db";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByPasswordResetToken(token: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  getUserBySquareCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'pmaAgreementAccepted' | 'privacyAccepted'> & { termsAcceptedAt?: Date; pmaAgreementAcceptedAt?: Date }): Promise<User>;
  updateUser(userId: string, updates: Partial<InsertUser>): Promise<User>;
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  resetPassword(userId: string, hashedPassword: string): Promise<void>;
  verifyUserEmail(userId: string): Promise<User>;
  regenerateVerificationToken(userId: string): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;
  issueBeneficialUnit(userId: string): Promise<any>;
  getBeneficialUnit(userId: string): Promise<any>;
  getTotalActiveBeneficiaries(): Promise<number>;
  withdrawBeneficialUnit(userId: string): Promise<void>;

  // Contact & Newsletter
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  deleteContact(id: string): Promise<void>;
  createNewsletterSubscriber(subscriber: InsertNewsletter): Promise<Newsletter>;
  getNewsletterSubscriber(email: string): Promise<Newsletter | undefined>;
  
  // Course management
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  getCourseLessons(courseId: string): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | undefined>;

  // Enrollment management
  enrollUser(userId: string, courseId: string): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]>;
  isUserEnrolled(userId: string, courseId: string): Promise<boolean>;
  completeEnrollment(userId: string, courseId: string): Promise<Enrollment>;
  
  // Downloads
  getPublicDownloads(): Promise<Download[]>;
  getPublishedDownloads(): Promise<Download[]>;
  getCourseDownloads(courseId: string): Promise<Download[]>;
  getUserDownloads(userId: string): Promise<Download[]>;
  getAllDownloads(): Promise<Download[]>;
  getDownload(id: string): Promise<Download | undefined>;
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownload(id: string, download: Partial<InsertDownload>): Promise<Download>;
  deleteDownload(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<Download>;
  toggleDownloadPublished(id: string): Promise<Download>;
  trackUserDownload(userId: string, downloadId: string, ipAddress?: string): Promise<void>;
  getUserDownloadHistory(userId: string): Promise<any[]>;
  acceptTerms(userId: string): Promise<void>;

  // Admin: User Management
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  toggleUserActive(userId: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // Admin: Content Management
  createVideo(video: InsertVideo): Promise<Video>;
  getAllVideos(): Promise<Video[]>;
  updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video>;
  toggleVideoPublished(id: string): Promise<Video>;
  deleteVideo(id: string): Promise<void>;
  
  createResource(resource: InsertResource): Promise<Resource>;
  getAllResources(): Promise<Resource[]>;
  updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource>;
  toggleResourcePublished(id: string): Promise<Resource>;
  deleteResource(id: string): Promise<void>;
  
  // Admin: Course Management
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  toggleCoursePublished(id: string): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  reorderLessons(courseId: string, lessonIds: string[]): Promise<void>;
  duplicateLesson(lessonId: string): Promise<Lesson>;
  getCourseStats(courseId: string): Promise<{ enrollmentCount: number; completedCount: number; lessonStats: Array<{ lessonId: string; completedCount: number; totalStudents: number }> }>;
  getAuditLogForEntity(entityType: string, entityId: string): Promise<AdminAuditLog[]>;
  bulkDeleteLessons(lessonIds: string[]): Promise<void>;
  getCourseCategories(): Promise<string[]>;

  // Video Management
  createCourseSection(section: InsertCourseSection): Promise<CourseSection>;
  getCourseSections(courseId: string): Promise<CourseSection[]>;
  updateCourseSection(id: string, section: Partial<InsertCourseSection>): Promise<CourseSection>;
  deleteCourseSection(id: string): Promise<void>;
  
  // Video Attachments
  createVideoAttachment(attachment: InsertVideoAttachment): Promise<VideoAttachment>;
  getVideoAttachments(videoId: string): Promise<VideoAttachment[]>;
  deleteVideoAttachment(id: string): Promise<void>;
  
  // Progress Tracking
  getUserVideoProgress(userId: string, videoId: string): Promise<VideoProgress | undefined>;
  updateVideoProgress(userId: string, videoId: string, progress: Partial<InsertVideoProgress>): Promise<VideoProgress>;
  getUserSectionProgress(userId: string, sectionId: string): Promise<SectionProgress | undefined>;
  completeSectionForUser(userId: string, sectionId: string): Promise<SectionProgress>;
  getCourseProgressForUser(userId: string, courseId: string): Promise<{ totalSections: number; completedSections: number; completedSectionIds: string[] }>;
  
  // Admin: Forum Management
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  updateForumCategory(id: string, category: Partial<InsertForumCategory>): Promise<ForumCategory>;
  deleteForumCategory(id: string): Promise<void>;
  toggleThreadPinned(id: string): Promise<ForumThread>;
  toggleThreadLocked(id: string): Promise<ForumThread>;
  deleteForumThread(id: string): Promise<void>;
  deleteForumReply(id: string): Promise<void>;
  
  // Admin: Analytics & Monitoring
  getSystemStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalVideos: number;
    totalResources: number;
    totalEnrollments: number;
    totalForumThreads: number;
    totalForumReplies: number;
    totalPremiumUsers: number;
    totalFreeUsers: number;
  }>;
  getRecentActivity(): Promise<AdminAuditLog[]>;
  createAuditLog(log: Omit<AdminAuditLog, 'id' | 'createdAt'>): Promise<AdminAuditLog>;
  
  // Admin: Page Content Management
  getAllPageContent(): Promise<PageContent[]>;
  getPageContent(pageName: string): Promise<PageContent[]>;
  getPageContentById(id: string): Promise<PageContent | undefined>;
  upsertPageContent(content: InsertPageContent): Promise<PageContent>;
  updatePageContent(id: string, updates: UpdatePageContent & { updatedById: string }): Promise<PageContent>;
  deletePageContent(id: string): Promise<void>;

  // Trust Document Downloads
  createTrustDownload(download: InsertTrustDownload): Promise<TrustDownload>;
  getTrustDownloadByEmail(email: string): Promise<TrustDownload | undefined>;
  getAllTrustDownloads(): Promise<TrustDownload[]>;

  // Public listings
  getPublishedVideos(): Promise<Video[]>;
  getPublishedResources(): Promise<Resource[]>;
  getRecentForumThreads(offset?: number, limit?: number): Promise<{ threads: Array<ForumThread & { author: User; category: ForumCategory }>; total: number }>;
  searchForumThreads(query: string): Promise<Array<ForumThread & { author: Pick<User, 'id' | 'firstName' | 'lastName' | 'username'>; category: ForumCategory }>>;
  getCoursesWithLessonCount(): Promise<(Course & { lessonCount: number })[]>;
  getAllCoursesWithLessonCount(): Promise<(Course & { lessonCount: number })[]>;

  // Forum: edit/delete helpers
  getForumReply(id: string): Promise<ForumReply | undefined>;
  updateForumThread(id: string, updates: { title?: string; content?: string }): Promise<ForumThread>;
  updateForumReply(id: string, updates: { content: string }): Promise<ForumReply>;

  // Newsletter: unsubscribe
  deleteNewsletterSubscriber(email: string): Promise<void>;

  // Dictionary
  searchDictionary(query: string, limit?: number): Promise<DictionaryEntry[]>;
  getDictionaryEntry(id: string): Promise<DictionaryEntry | undefined>;
  getDictionaryStats(): Promise<{ totalEntries: number; letters: string[] }>;
  getAllDictionaryTerms(): Promise<Pick<DictionaryEntry, 'id' | 'term' | 'termLower' | 'letter'>[]>;
  getDictionaryBatch(offset: number, limit: number): Promise<DictionaryEntry[]>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotification(id: string): Promise<Notification | undefined>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<Notification>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // Global search
  searchGlobal(query: string): Promise<{ courses: any[]; threads: any[]; downloads: any[] }>;

  // Forum likes
  likeThread(userId: string, threadId: string): Promise<void>;
  unlikeThread(userId: string, threadId: string): Promise<void>;
  likeReply(userId: string, replyId: string): Promise<void>;
  unlikeReply(userId: string, replyId: string): Promise<void>;
  getThreadLikeCounts(threadIds: string[]): Promise<Record<string, number>>;
  getReplyLikeCounts(replyIds: string[]): Promise<Record<string, number>>;
  getUserLikedThreadIds(userId: string, threadIds: string[]): Promise<Set<string>>;
  getUserLikedReplyIds(userId: string, replyIds: string[]): Promise<Set<string>>;
  getCategoryThreadCounts(): Promise<Record<string, number>>;

  // Thread subscriptions
  subscribeToThread(userId: string, threadId: string): Promise<ThreadSubscription>;
  unsubscribeFromThread(userId: string, threadId: string): Promise<void>;
  isSubscribedToThread(userId: string, threadId: string): Promise<boolean>;
  getThreadSubscribers(threadId: string): Promise<string[]>;

  // Public profile
  getPublicProfile(userId: string): Promise<{ user: any; threadCount: number; replyCount: number } | null>;

  // Dashboard
  getDashboardStats(userId: string): Promise<{
    coursesInProgress: number;
    coursesCompleted: number;
    availableCourses: number;
    forumPosts: number;
    videosWatched: number;
  }>;
  getRecentUserActivity(userId: string, limit?: number): Promise<any[]>;

  // Comments
  getCommentsByTarget(targetType: string, targetId: string): Promise<(Comment & { author: { id: string; firstName: string; lastName: string; username: string | null; role: string | null } })[]>;
  createComment(data: InsertComment): Promise<Comment>;
  getComment(id: string): Promise<Comment | undefined>;
  updateComment(id: string, data: { content: string }): Promise<Comment>;
  deleteComment(id: string): Promise<void>;

  // Newsletter Campaigns
  getAllNewsletterCampaigns(): Promise<NewsletterCampaign[]>;
  getNewsletterCampaign(id: string): Promise<NewsletterCampaign | undefined>;
  createNewsletterCampaign(data: InsertNewsletterCampaign): Promise<NewsletterCampaign>;
  updateNewsletterCampaign(id: string, data: Partial<InsertNewsletterCampaign>): Promise<NewsletterCampaign>;
  markNewsletterCampaignSent(id: string, recipientCount: number): Promise<NewsletterCampaign>;
  deleteNewsletterCampaign(id: string): Promise<void>;
  getAllNewsletterSubscribers(): Promise<Newsletter[]>;

  // Subscription management
  updateUserSubscription(userId: string, updates: Partial<{
    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date | null;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    squareCustomerId: string;
    squareSubscriptionId: string;
    premiumGrantedBy: string;
    premiumGrantedAt: Date;
  }>): Promise<User>;
  createSubscriptionRecord(data: InsertSubscription): Promise<Subscription>;
  getSubscriptionHistory(userId: string): Promise<Subscription[]>;
  getActiveSubscribers(): Promise<User[]>;
  getSubscriptionStats(): Promise<{ totalPremium: number; totalFree: number; recentSubscriptions: number }>;
  getAllSubscribers(search?: string): Promise<User[]>;
  getSubscriptionStatsWithChurn(): Promise<{ totalPremium: number; totalFree: number; recentSubscriptions: number; churnRate: number }>;
  adminUpdateSubscription(userId: string, updates: { status: string; plan: string; endDate: string | null }): Promise<User>;

  // GDPR data export helpers
  getUserForumThreads(userId: string): Promise<any[]>;
  getUserForumReplies(userId: string): Promise<any[]>;
  getUserComments(userId: string): Promise<any[]>;

  // GDPR account deletion
  deleteAllUserData(userId: string): Promise<void>;

  // Trust Structure
  getTrustEntities(): Promise<TrustEntity[]>;
  getTrustEntity(id: string): Promise<TrustEntity | undefined>;
  createTrustEntity(entity: InsertTrustEntity): Promise<TrustEntity>;
  updateTrustEntity(id: string, updates: Partial<InsertTrustEntity>): Promise<TrustEntity>;
  deleteTrustEntity(id: string): Promise<void>;
  getTrustRelationships(): Promise<TrustRelationship[]>;
  createTrustRelationship(rel: InsertTrustRelationship): Promise<TrustRelationship>;
  deleteTrustRelationship(id: string): Promise<void>;
  getTrustStructure(): Promise<{ entities: TrustEntity[]; relationships: TrustRelationship[] }>;
  seedTrustStructure(): Promise<void>;
  resetTrustStructure(): Promise<void>;

  // Trust Document Templates
  getTrustDocumentTemplates(): Promise<(TrustDocumentTemplate & { sections: TrustTemplateSectionType[] })[]>;
  getTrustDocumentTemplate(id: string): Promise<(TrustDocumentTemplate & { sections: TrustTemplateSectionType[] }) | undefined>;
  createTrustDocumentTemplate(data: InsertTrustDocumentTemplate): Promise<TrustDocumentTemplate>;
  updateTrustDocumentTemplate(id: string, updates: Partial<InsertTrustDocumentTemplate>): Promise<TrustDocumentTemplate>;
  deleteTrustDocumentTemplate(id: string): Promise<void>;
  replaceTrustTemplateSections(templateId: string, sections: Omit<InsertTrustTemplateSection, 'templateId'>[]): Promise<TrustTemplateSectionType[]>;
  seedTrustDocumentTemplates(): Promise<void>;
  reseedTrustDocumentTemplates(): Promise<void>;

  // Trust Documents
  getTrustDocuments(): Promise<(TrustDocument & { sections: TrustDocumentSection[] })[]>;
  getTrustDocumentById(id: string): Promise<(TrustDocument & { sections: TrustDocumentSection[] }) | undefined>;
  createTrustDocumentWithSections(doc: InsertTrustDocument, sections: Omit<InsertTrustDocumentSection, 'documentId'>[]): Promise<TrustDocument & { sections: TrustDocumentSection[] }>;
  updateTrustDocumentMeta(id: string, updates: Partial<InsertTrustDocument>): Promise<TrustDocument>;
  updateTrustDocumentSectionContent(sectionId: string, content: string): Promise<TrustDocumentSection>;
  resetTrustDocumentFromTemplate(id: string, sections: Omit<InsertTrustDocumentSection, 'documentId'>[]): Promise<TrustDocument & { sections: TrustDocumentSection[] }>;
  deleteTrustDocumentById(id: string): Promise<void>;

  // Treasury
  createTreasuryTransaction(data: InsertTreasuryTransaction): Promise<TreasuryTransaction>;
  getTreasuryTransactions(limit: number, offset: number): Promise<TreasuryTransaction[]>;
  getTreasuryBalance(): Promise<number>;
  getTreasuryStats(): Promise<{
    balance: number;
    totalInflow: number;
    totalOutflow: number;
    transactionCount: number;
    breakdownByType: Record<string, number>;
  }>;
  getTreasurySetting(key: string): Promise<TreasurySetting | undefined>;
  upsertTreasurySetting(key: string, value: string, updatedById: string): Promise<TreasurySetting>;

  // Forum moderation
  flagContent(data: InsertFlaggedContent): Promise<FlaggedContent>;
  getFlaggedContent(status?: string): Promise<FlaggedContent[]>;
  reviewFlag(id: string, reviewedBy: string, status: string): Promise<FlaggedContent>;
  createWarning(data: InsertUserWarning): Promise<UserWarning>;
  getUserWarnings(userId: string): Promise<UserWarning[]>;
  banUser(userId: string, reason: string): Promise<User>;
  unbanUser(userId: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }

  async getUserByPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.passwordResetToken, token));
    return user;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  async getUserBySquareCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.squareCustomerId, customerId));
    return user;
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db.update(users)
      .set({ passwordResetToken: token, passwordResetExpires: expires, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async resetPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUser(userId: string, updates: Partial<Record<string, any>>): Promise<User> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async verifyUserEmail(userId: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ 
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async regenerateVerificationToken(userId: string): Promise<User> {
    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const [user] = await db.update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createUser(insertUser: Omit<InsertUser, 'pmaAgreementAccepted' | 'privacyAccepted'> & { termsAcceptedAt?: Date; pmaAgreementAcceptedAt?: Date }): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const verificationToken = randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const [user] = await db
      .insert(users)
      .values({ 
        ...insertUser,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isActive: true
      })
      .returning();
    return user;
  }

  async issueBeneficialUnit(userId: string): Promise<any> {
    // Get next unit number
    const result = await db.select({ maxNum: sql<number>`COALESCE(MAX(${beneficialUnits.unitNumber}), 0)` }).from(beneficialUnits);
    const nextNumber = (result[0]?.maxNum || 0) + 1;

    const [unit] = await db
      .insert(beneficialUnits)
      .values({
        userId,
        unitNumber: nextNumber,
        status: 'active',
      })
      .returning();

    // Update user with unit reference
    await db.update(users).set({ beneficialUnitId: unit.id }).where(eq(users.id, userId));

    return unit;
  }

  async getBeneficialUnit(userId: string): Promise<any> {
    const [unit] = await db
      .select()
      .from(beneficialUnits)
      .where(eq(beneficialUnits.userId, userId));
    return unit || null;
  }

  async getTotalActiveBeneficiaries(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(beneficialUnits)
      .where(eq(beneficialUnits.status, 'active'));
    return Number(result[0]?.count || 0);
  }

  async withdrawBeneficialUnit(userId: string): Promise<void> {
    await db
      .update(beneficialUnits)
      .set({ status: 'withdrawn', withdrawnAt: new Date() })
      .where(eq(beneficialUnits.userId, userId));
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Contact & Newsletter
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.created_at));
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async createNewsletterSubscriber(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const [subscriber] = await db
      .insert(newsletter_subscribers)
      .values(insertNewsletter)
      .returning();
    return subscriber;
  }

  async getNewsletterSubscriber(email: string): Promise<Newsletter | undefined> {
    const [subscriber] = await db
      .select()
      .from(newsletter_subscribers)
      .where(eq(newsletter_subscribers.email, email));
    return subscriber;
  }

  // Course management
  async getCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.isPublished, true));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, id), eq(courses.isPublished, true)));
    return course;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.order);
  }

  async getLessonById(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  // Enrollment management
  async enrollUser(userId: string, courseId: string): Promise<Enrollment> {
    const [enrollment] = await db
      .insert(enrollments)
      .values({ userId, courseId })
      .returning();
    return enrollment;
  }

  async getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]> {
    return await db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        enrolledAt: enrollments.enrolledAt,
        completedAt: enrollments.completedAt,
        progress: enrollments.progress,
        course: courses
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));
  }

  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    return !!enrollment;
  }

  async completeEnrollment(userId: string, courseId: string): Promise<Enrollment> {
    const [updated] = await db
      .update(enrollments)
      .set({ completedAt: new Date(), progress: 100 })
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
      .returning();
    if (!updated) throw new Error("Enrollment not found");
    return updated;
  }

  // Downloads
  async getPublicDownloads(): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .where(eq(downloads.isPublic, true));
  }

  async getPublishedDownloads(): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .where(eq(downloads.isPublished, true))
      .orderBy(desc(downloads.createdAt));
  }

  async getAllDownloads(): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .orderBy(desc(downloads.createdAt));
  }

  async getDownload(id: string): Promise<Download | undefined> {
    const [download] = await db.select().from(downloads).where(eq(downloads.id, id));
    return download;
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const [newDownload] = await db.insert(downloads).values(download).returning();
    return newDownload;
  }

  async updateDownload(id: string, updates: Partial<InsertDownload>): Promise<Download> {
    const [updated] = await db
      .update(downloads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(downloads.id, id))
      .returning();
    return updated;
  }

  async deleteDownload(id: string): Promise<void> {
    await db.delete(downloads).where(eq(downloads.id, id));
  }

  async incrementDownloadCount(id: string): Promise<Download> {
    const [updated] = await db
      .update(downloads)
      .set({ downloadCount: sql`${downloads.downloadCount} + 1` })
      .where(eq(downloads.id, id))
      .returning();
    return updated;
  }

  async toggleDownloadPublished(id: string): Promise<Download> {
    const download = await this.getDownload(id);
    if (!download) throw new Error("Download not found");
    const [updated] = await db
      .update(downloads)
      .set({ isPublished: !download.isPublished, updatedAt: new Date() })
      .where(eq(downloads.id, id))
      .returning();
    return updated;
  }

  async trackUserDownload(userId: string, downloadId: string, ipAddress?: string): Promise<void> {
    await db
      .insert(userDownloads)
      .values({ userId, downloadId, ipAddress: ipAddress ?? null });
  }

  async getUserDownloadHistory(userId: string): Promise<any[]> {
    return await db
      .select({
        id: userDownloads.id,
        userId: userDownloads.userId,
        downloadId: userDownloads.downloadId,
        downloadedAt: userDownloads.downloadedAt,
        ipAddress: userDownloads.ipAddress,
        title: downloads.title,
        fileType: downloads.fileType,
        category: downloads.category,
      })
      .from(userDownloads)
      .innerJoin(downloads, eq(userDownloads.downloadId, downloads.id))
      .where(eq(userDownloads.userId, userId))
      .orderBy(desc(userDownloads.downloadedAt))
      .limit(100);
  }

  async acceptTerms(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ termsAcceptedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getCourseDownloads(courseId: string): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .where(eq(downloads.courseId, courseId));
  }

  async getUserDownloads(userId: string): Promise<Download[]> {
    // Get downloads from enrolled courses + public downloads
    const userEnrollments = await this.getUserEnrollments(userId);
    const courseIds = userEnrollments.map(e => e.courseId);

    if (courseIds.length === 0) {
      return await this.getPublicDownloads();
    }

    return await db
      .select()
      .from(downloads)
      .where(
        or(
          eq(downloads.isPublic, true),
          inArray(downloads.courseId, courseIds)
        )
      )
      .orderBy(desc(downloads.createdAt));
  }

  // Forum Categories
  async getForumCategories(): Promise<ForumCategory[]> {
    return await db.select().from(forum_categories).where(eq(forum_categories.isActive, true)).orderBy(forum_categories.order, forum_categories.name);
  }

  async getForumCategoryById(id: string): Promise<ForumCategory | undefined> {
    const [category] = await db.select().from(forum_categories).where(eq(forum_categories.id, id));
    return category;
  }

  async createForumCategory(category: InsertForumCategory): Promise<ForumCategory> {
    const [newCategory] = await db.insert(forum_categories).values(category).returning();
    return newCategory;
  }

  // Forum Threads
  async getForumThreadsByCategory(categoryId: string): Promise<Array<ForumThread & { author: User; category: ForumCategory; lastReplyUser?: User }>> {
    const threads = await db
      .select({
        thread: forum_threads,
        author: users,
        category: forum_categories,
        lastReplyUser: {
          id: sql<string>`last_user.id`,
          username: sql<string>`last_user.username`,
          email: sql<string>`last_user.email`,
          createdAt: sql<Date>`last_user.created_at`,
        }
      })
      .from(forum_threads)
      .innerJoin(users, eq(forum_threads.authorId, users.id))
      .innerJoin(forum_categories, eq(forum_threads.categoryId, forum_categories.id))
      .leftJoin(sql`users as last_user`, sql`${forum_threads.lastReplyUserId} = last_user.id`)
      .where(eq(forum_threads.categoryId, categoryId))
      .orderBy(desc(forum_threads.isPinned), desc(forum_threads.lastReplyAt), desc(forum_threads.createdAt));

    return threads.map(t => ({
      ...t.thread,
      author: t.author,
      category: t.category,
      lastReplyUser: t.lastReplyUser.id ? t.lastReplyUser as User : undefined
    }));
  }

  async getForumThreadById(id: string): Promise<(ForumThread & { author: User; category: ForumCategory }) | undefined> {
    const [thread] = await db
      .select({
        thread: forum_threads,
        author: users,
        category: forum_categories,
      })
      .from(forum_threads)
      .innerJoin(users, eq(forum_threads.authorId, users.id))
      .innerJoin(forum_categories, eq(forum_threads.categoryId, forum_categories.id))
      .where(eq(forum_threads.id, id));

    if (!thread) return undefined;

    return {
      ...thread.thread,
      author: thread.author,
      category: thread.category,
    };
  }

  async createForumThread(thread: InsertForumThread): Promise<ForumThread> {
    const [newThread] = await db.insert(forum_threads).values({
      ...thread,
      lastReplyAt: new Date(),
    }).returning();
    return newThread;
  }

  async incrementThreadViews(threadId: string): Promise<void> {
    await db.update(forum_threads)
      .set({ viewCount: sql`${forum_threads.viewCount} + 1` })
      .where(eq(forum_threads.id, threadId));
  }

  // Forum Replies
  async getForumRepliesByThread(threadId: string): Promise<Array<ForumReply & { author: User }>> {
    const replies = await db
      .select({
        reply: forum_replies,
        author: users,
      })
      .from(forum_replies)
      .innerJoin(users, eq(forum_replies.authorId, users.id))
      .where(eq(forum_replies.threadId, threadId))
      .orderBy(forum_replies.createdAt);

    return replies.map(r => ({
      ...r.reply,
      author: r.author,
    }));
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forum_replies).values(reply).returning();
    
    // Update thread reply count and last reply info
    await db.update(forum_threads)
      .set({
        replyCount: sql`${forum_threads.replyCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyUserId: reply.authorId,
      })
      .where(eq(forum_threads.id, reply.threadId));

    return newReply;
  }

  // Admin: User Management
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async toggleUserActive(userId: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ 
        isActive: sql`NOT ${users.isActive}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  // Admin: Video Management
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async updateVideo(id: string, video: Partial<InsertVideo>): Promise<Video> {
    const [updatedVideo] = await db.update(videos)
      .set({ ...video, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo;
  }

  async toggleVideoPublished(id: string): Promise<Video> {
    const [video] = await db.update(videos)
      .set({ 
        isPublished: sql`NOT ${videos.isPublished}`,
        updatedAt: new Date()
      })
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Admin: Resource Management
  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources).orderBy(desc(resources.createdAt));
  }

  async updateResource(id: string, resource: Partial<InsertResource>): Promise<Resource> {
    const [updatedResource] = await db.update(resources)
      .set({ ...resource, updatedAt: new Date() })
      .where(eq(resources.id, id))
      .returning();
    return updatedResource;
  }

  async toggleResourcePublished(id: string): Promise<Resource> {
    const [resource] = await db.update(resources)
      .set({ 
        isPublished: sql`NOT ${resources.isPublished}`,
        updatedAt: new Date()
      })
      .where(eq(resources.id, id))
      .returning();
    return resource;
  }

  async deleteResource(id: string): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }

  // Admin: Course Management
  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db.update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async toggleCoursePublished(id: string): Promise<Course> {
    const [course] = await db.update(courses)
      .set({ 
        isPublished: sql`NOT ${courses.isPublished}`,
        updatedAt: new Date()
      })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    // Delete related lessons and enrollments in a transaction to ensure data integrity
    await db.transaction(async (tx) => {
      await tx.delete(lesson_progress).where(
        sql`${lesson_progress.lessonId} IN (SELECT id FROM ${lessons} WHERE ${lessons.courseId} = ${id})`
      );
      await tx.delete(lessons).where(eq(lessons.courseId, id));
      await tx.delete(enrollments).where(eq(enrollments.courseId, id));
      await tx.delete(courses).where(eq(courses.id, id));
    });
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const [newLesson] = await db.insert(lessons).values(lesson).returning();
    return newLesson;
  }

  async updateLesson(id: string, lesson: Partial<InsertLesson>): Promise<Lesson> {
    const [updatedLesson] = await db.update(lessons)
      .set(lesson)
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await db.delete(lesson_progress).where(eq(lesson_progress.lessonId, id));
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  async reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
    await Promise.all(
      lessonIds.map((id, i) =>
        db.update(lessons).set({ order: i + 1 }).where(and(eq(lessons.id, id), eq(lessons.courseId, courseId)))
      )
    );
  }

  async duplicateLesson(lessonId: string): Promise<Lesson> {
    const [original] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    if (!original) throw new Error("Lesson not found");
    const [newLesson] = await db.insert(lessons).values({
      courseId: original.courseId,
      title: `${original.title} (Copy)`,
      description: original.description,
      content: original.content,
      videoUrl: original.videoUrl,
      order: original.order + 1,
      duration: original.duration,
    }).returning();
    return newLesson;
  }

  async getCourseStats(courseId: string): Promise<{ enrollmentCount: number; completedCount: number; lessonStats: Array<{ lessonId: string; completedCount: number; totalStudents: number }> }> {
    const enrollmentRows = await db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
    const enrollmentCount = enrollmentRows.length;
    const completedCount = enrollmentRows.filter(e => e.completedAt !== null).length;

    // Get lessons for this course
    const courseLessons = await db.select().from(lessons).where(eq(lessons.courseId, courseId));
    const lessonIds = courseLessons.map(l => l.id);

    // Get progress for these lessons
    const progressRows = lessonIds.length > 0
      ? await db.select().from(lesson_progress).where(inArray(lesson_progress.lessonId, lessonIds))
      : [];

    const lessonStats = courseLessons.map(l => ({
      lessonId: l.id,
      completedCount: progressRows.filter(p => p.lessonId === l.id && p.completed).length,
      totalStudents: enrollmentCount,
    }));

    return { enrollmentCount, completedCount, lessonStats };
  }

  async getAuditLogForEntity(entityType: string, entityId: string): Promise<AdminAuditLog[]> {
    return db.select().from(admin_audit_log)
      .where(and(eq(admin_audit_log.entityType, entityType), eq(admin_audit_log.entityId, entityId)))
      .orderBy(desc(admin_audit_log.createdAt))
      .limit(50);
  }

  async bulkDeleteLessons(lessonIds: string[]): Promise<void> {
    if (lessonIds.length === 0) return;
    await db.delete(lesson_progress).where(inArray(lesson_progress.lessonId, lessonIds));
    await db.delete(lessons).where(inArray(lessons.id, lessonIds));
  }

  async getCourseCategories(): Promise<string[]> {
    const rows = await db.selectDistinct({ category: courses.category }).from(courses).orderBy(courses.category);
    return rows.map(r => r.category);
  }

  // Admin: Forum Management
  async updateForumCategory(id: string, category: Partial<InsertForumCategory>): Promise<ForumCategory> {
    const [updatedCategory] = await db.update(forum_categories)
      .set(category)
      .where(eq(forum_categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteForumCategory(id: string): Promise<void> {
    // Cascade deletes handle threads → replies → likes automatically
    await db.delete(forum_categories).where(eq(forum_categories.id, id));
  }

  async toggleThreadPinned(id: string): Promise<ForumThread> {
    const [thread] = await db.update(forum_threads)
      .set({ 
        isPinned: sql`NOT ${forum_threads.isPinned}`,
        updatedAt: new Date()
      })
      .where(eq(forum_threads.id, id))
      .returning();
    return thread;
  }

  async toggleThreadLocked(id: string): Promise<ForumThread> {
    const [thread] = await db.update(forum_threads)
      .set({ 
        isLocked: sql`NOT ${forum_threads.isLocked}`,
        updatedAt: new Date()
      })
      .where(eq(forum_threads.id, id))
      .returning();
    return thread;
  }

  async deleteForumThread(id: string): Promise<void> {
    // Cascade deletes handle replies → likes and thread subscriptions automatically
    await db.delete(forum_threads).where(eq(forum_threads.id, id));
  }

  async deleteForumReply(id: string): Promise<void> {
    // Get the thread ID before deleting so we can update the count
    const [reply] = await db.select({ threadId: forum_replies.threadId })
      .from(forum_replies)
      .where(eq(forum_replies.id, id));

    // Cascade deletes handle likes automatically
    await db.delete(forum_replies).where(eq(forum_replies.id, id));

    // Update thread reply count
    if (reply) {
      await db.update(forum_threads)
        .set({ replyCount: sql`${forum_threads.replyCount} - 1` })
        .where(eq(forum_threads.id, reply.threadId));
    }
  }

  // Admin: Analytics & Monitoring
  async getSystemStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalVideos: number;
    totalResources: number;
    totalEnrollments: number;
    totalForumThreads: number;
    totalForumReplies: number;
    totalPremiumUsers: number;
    totalFreeUsers: number;
  }> {
    const [stats] = await db.select({
      totalUsers: sql<number>`(SELECT COUNT(*) FROM ${users})`,
      totalCourses: sql<number>`(SELECT COUNT(*) FROM ${courses})`,
      totalVideos: sql<number>`(SELECT COUNT(*) FROM ${videos})`,
      totalResources: sql<number>`(SELECT COUNT(*) FROM ${resources})`,
      totalEnrollments: sql<number>`(SELECT COUNT(*) FROM ${enrollments})`,
      totalForumThreads: sql<number>`(SELECT COUNT(*) FROM ${forum_threads})`,
      totalForumReplies: sql<number>`(SELECT COUNT(*) FROM ${forum_replies})`,
      totalPremiumUsers: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE subscription_tier = 'premium' AND subscription_status = 'active')`,
      totalFreeUsers: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE subscription_tier = 'free' OR subscription_tier IS NULL)`,
    }).from(sql`(SELECT 1) as dummy`);

    return stats;
  }

  async getRecentActivity(): Promise<AdminAuditLog[]> {
    return await db.select().from(admin_audit_log)
      .orderBy(desc(admin_audit_log.createdAt))
      .limit(50);
  }

  async createAuditLog(log: Omit<AdminAuditLog, 'id' | 'createdAt'>): Promise<AdminAuditLog> {
    const [newLog] = await db.insert(admin_audit_log).values(log).returning();
    return newLog;
  }

  // Admin: Page Content Management
  async getAllPageContent(): Promise<PageContent[]> {
    return await db.select().from(page_content)
      .orderBy(page_content.pageName, page_content.contentKey);
  }

  async getPageContent(pageName: string): Promise<PageContent[]> {
    return await db.select().from(page_content)
      .where(eq(page_content.pageName, pageName))
      .orderBy(page_content.contentKey);
  }

  async getPageContentById(id: string): Promise<PageContent | undefined> {
    const [content] = await db.select().from(page_content)
      .where(eq(page_content.id, id));
    return content;
  }

  async upsertPageContent(content: InsertPageContent): Promise<PageContent> {
    // First try to find existing content by page + key
    const [existing] = await db.select().from(page_content)
      .where(
        and(
          eq(page_content.pageName, content.pageName),
          eq(page_content.contentKey, content.contentKey)
        )
      );

    if (existing) {
      // Update existing
      const [updated] = await db.update(page_content)
        .set({
          contentValue: content.contentValue,
          contentType: content.contentType,
          description: content.description,
          updatedById: content.updatedById,
          updatedAt: new Date()
        })
        .where(eq(page_content.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new
      const [newContent] = await db.insert(page_content)
        .values(content)
        .returning();
      return newContent;
    }
  }

  async updatePageContent(id: string, updates: UpdatePageContent & { updatedById: string }): Promise<PageContent> {
    const [updated] = await db.update(page_content)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(page_content.id, id))
      .returning();
    return updated;
  }

  async deletePageContent(id: string): Promise<void> {
    await db.delete(page_content).where(eq(page_content.id, id));
  }

  // Trust Document Downloads
  async createTrustDownload(downloadData: InsertTrustDownload): Promise<TrustDownload> {
    const [download] = await db.insert(trustDownloads)
      .values(downloadData)
      .returning();
    return download;
  }

  async getTrustDownloadByEmail(email: string): Promise<TrustDownload | undefined> {
    const [download] = await db.select().from(trustDownloads)
      .where(eq(trustDownloads.email, email));
    return download;
  }

  async getAllTrustDownloads(): Promise<TrustDownload[]> {
    return await db.select().from(trustDownloads)
      .orderBy(desc(trustDownloads.downloadedAt));
  }

  // Video Management Implementation
  async createCourseSection(section: InsertCourseSection): Promise<CourseSection> {
    const [newSection] = await db.insert(courseSections)
      .values(section)
      .returning();
    return newSection;
  }

  async getCourseSections(courseId: string): Promise<CourseSection[]> {
    return await db.select().from(courseSections)
      .where(eq(courseSections.courseId, courseId))
      .orderBy(courseSections.sectionOrder);
  }

  async updateCourseSection(id: string, section: Partial<InsertCourseSection>): Promise<CourseSection> {
    const [updated] = await db.update(courseSections)
      .set({ ...section, updatedAt: new Date() })
      .where(eq(courseSections.id, id))
      .returning();
    return updated;
  }

  async getSectionById(id: string): Promise<CourseSection | undefined> {
    const [section] = await db.select().from(courseSections).where(eq(courseSections.id, id));
    return section;
  }

  async deleteCourseSection(id: string): Promise<void> {
    await db.delete(courseSections).where(eq(courseSections.id, id));
  }

  // Video Attachments
  async createVideoAttachment(attachment: InsertVideoAttachment): Promise<VideoAttachment> {
    const [newAttachment] = await db.insert(videoAttachments)
      .values(attachment)
      .returning();
    return newAttachment;
  }

  async getVideoAttachments(videoId: string): Promise<VideoAttachment[]> {
    return await db.select().from(videoAttachments)
      .where(eq(videoAttachments.videoId, videoId))
      .orderBy(videoAttachments.createdAt);
  }

  async deleteVideoAttachment(id: string): Promise<void> {
    await db.delete(videoAttachments).where(eq(videoAttachments.id, id));
  }

  // Progress Tracking
  async getUserVideoProgress(userId: string, videoId: string): Promise<VideoProgress | undefined> {
    const [progress] = await db.select().from(videoProgress)
      .where(and(
        eq(videoProgress.userId, userId),
        eq(videoProgress.videoId, videoId)
      ));
    return progress;
  }

  async updateVideoProgress(userId: string, videoId: string, progress: Partial<InsertVideoProgress>): Promise<VideoProgress> {
    // Check if progress record exists
    const existing = await this.getUserVideoProgress(userId, videoId);
    
    if (existing) {
      const [updated] = await db.update(videoProgress)
        .set({ ...progress, lastWatchedAt: new Date() })
        .where(and(
          eq(videoProgress.userId, userId),
          eq(videoProgress.videoId, videoId)
        ))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(videoProgress)
        .values({
          userId,
          videoId,
          ...progress,
        })
        .returning();
      return newProgress;
    }
  }

  async getUserSectionProgress(userId: string, sectionId: string): Promise<SectionProgress | undefined> {
    const [progress] = await db.select().from(sectionProgress)
      .where(and(
        eq(sectionProgress.userId, userId),
        eq(sectionProgress.sectionId, sectionId)
      ));
    return progress;
  }

  async completeSectionForUser(userId: string, sectionId: string): Promise<SectionProgress> {
    // Check if progress record exists
    const existing = await this.getUserSectionProgress(userId, sectionId);
    
    if (existing) {
      const [updated] = await db.update(sectionProgress)
        .set({ 
          isCompleted: true, 
          completedAt: new Date() 
        })
        .where(and(
          eq(sectionProgress.userId, userId),
          eq(sectionProgress.sectionId, sectionId)
        ))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(sectionProgress)
        .values({
          userId,
          sectionId,
          isCompleted: true,
          completedAt: new Date(),
        })
        .returning();
      return newProgress;
    }
  }

  async getCourseProgressForUser(userId: string, courseId: string): Promise<{ totalSections: number; completedSections: number; completedSectionIds: string[] }> {
    // Get total sections for course
    const totalSections = await db.select({ count: sql<number>`count(*)` })
      .from(courseSections)
      .where(eq(courseSections.courseId, courseId));

    // Get completed sections for user (with IDs)
    const completedRows = await db.select({ sectionId: sectionProgress.sectionId })
      .from(sectionProgress)
      .innerJoin(courseSections, eq(sectionProgress.sectionId, courseSections.id))
      .where(and(
        eq(sectionProgress.userId, userId),
        eq(courseSections.courseId, courseId),
        eq(sectionProgress.isCompleted, true)
      ));

    const completedSectionIds = completedRows.map(r => r.sectionId);

    return {
      totalSections: totalSections[0]?.count || 0,
      completedSections: completedSectionIds.length,
      completedSectionIds,
    };
  }
  // Forum: edit/delete helpers
  async getForumReply(id: string): Promise<ForumReply | undefined> {
    const [reply] = await db.select().from(forum_replies).where(eq(forum_replies.id, id));
    return reply;
  }

  async updateForumThread(id: string, updates: { title?: string; content?: string }): Promise<ForumThread> {
    const [thread] = await db.update(forum_threads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forum_threads.id, id))
      .returning();
    return thread;
  }

  async updateForumReply(id: string, updates: { content: string }): Promise<ForumReply> {
    const [reply] = await db.update(forum_replies)
      .set({ content: updates.content, isEdited: true, editedAt: new Date(), updatedAt: new Date() })
      .where(eq(forum_replies.id, id))
      .returning();
    return reply;
  }

  // Newsletter: unsubscribe
  async deleteNewsletterSubscriber(email: string): Promise<void> {
    await db.delete(newsletter_subscribers).where(eq(newsletter_subscribers.email, email));
  }

  // Public listings
  async getPublishedVideos(): Promise<Video[]> {
    return await db.select().from(videos)
      .where(eq(videos.isPublished, true))
      .orderBy(desc(videos.createdAt));
  }

  async getPublishedResources(): Promise<Resource[]> {
    return await db.select().from(resources)
      .where(eq(resources.isPublished, true))
      .orderBy(desc(resources.createdAt));
  }

  async getRecentForumThreads(offset = 0, limit = 20): Promise<{ threads: Array<ForumThread & { author: User; category: ForumCategory }>; total: number }> {
    const [totalResult, threads] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(forum_threads),
      db
        .select({
          thread: forum_threads,
          author: users,
          category: forum_categories,
        })
        .from(forum_threads)
        .innerJoin(users, eq(forum_threads.authorId, users.id))
        .innerJoin(forum_categories, eq(forum_threads.categoryId, forum_categories.id))
        .orderBy(desc(forum_threads.isPinned), desc(forum_threads.lastReplyAt), desc(forum_threads.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    return {
      threads: threads.map(t => ({
        ...t.thread,
        author: t.author,
        category: t.category,
      })),
      total: totalResult[0]?.count ?? 0,
    };
  }

  async searchForumThreads(query: string): Promise<Array<ForumThread & { author: Pick<User, 'id' | 'firstName' | 'lastName' | 'username'>; category: ForumCategory }>> {
    const searchPattern = `%${query}%`;

    const threads = await db
      .select({
        thread: forum_threads,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
        },
        category: forum_categories,
        relevance: sql<number>`CASE WHEN ${forum_threads.title} ILIKE ${searchPattern} THEN 1 ELSE 2 END`,
      })
      .from(forum_threads)
      .innerJoin(users, eq(forum_threads.authorId, users.id))
      .innerJoin(forum_categories, eq(forum_threads.categoryId, forum_categories.id))
      .where(
        or(
          sql`${forum_threads.title} ILIKE ${searchPattern}`,
          sql`${forum_threads.content} ILIKE ${searchPattern}`
        )
      )
      .orderBy(sql`CASE WHEN ${forum_threads.title} ILIKE ${searchPattern} THEN 1 ELSE 2 END`, desc(forum_threads.createdAt))
      .limit(50);

    return threads.map(t => ({
      ...t.thread,
      author: t.author as any,
      category: t.category,
    }));
  }

  async getCoursesWithLessonCount(): Promise<(Course & { lessonCount: number })[]> {
    const result = await db
      .select({
        course: courses,
        lessonCount: sql<number>`count(${lessons.id})::int`,
      })
      .from(courses)
      .leftJoin(lessons, eq(courses.id, lessons.courseId))
      .where(eq(courses.isPublished, true))
      .groupBy(courses.id);

    return result.map(r => ({
      ...r.course,
      lessonCount: r.lessonCount || 0,
    }));
  }

  async getAllCoursesWithLessonCount(): Promise<(Course & { lessonCount: number })[]> {
    const result = await db
      .select({
        course: courses,
        lessonCount: sql<number>`count(${lessons.id})::int`,
      })
      .from(courses)
      .leftJoin(lessons, eq(courses.id, lessons.courseId))
      .groupBy(courses.id);

    return result.map(r => ({
      ...r.course,
      lessonCount: r.lessonCount || 0,
    }));
  }

  // Dictionary
  async searchDictionary(query: string, limit: number = 20): Promise<DictionaryEntry[]> {
    const maxLimit = Math.min(limit, 50);
    const lowerQuery = query.toLowerCase().trim();

    if (lowerQuery.length < 2) return [];

    // Use a union approach: exact matches first, then prefix, then substring
    const results = await db.select().from(dictionaryEntries)
      .where(
        or(
          eq(dictionaryEntries.termLower, lowerQuery),
          sql`${dictionaryEntries.termLower} LIKE ${lowerQuery + '%'}`,
          sql`${dictionaryEntries.termLower} LIKE ${'%' + lowerQuery + '%'}`
        )
      )
      .orderBy(
        // Exact match first, then prefix, then substring
        sql`CASE
          WHEN ${dictionaryEntries.termLower} = ${lowerQuery} THEN 0
          WHEN ${dictionaryEntries.termLower} LIKE ${lowerQuery + '%'} THEN 1
          ELSE 2
        END`,
        sql`length(${dictionaryEntries.definition}) DESC`,
        dictionaryEntries.termLower
      )
      .limit(maxLimit);

    return results;
  }

  async getDictionaryEntry(id: string): Promise<DictionaryEntry | undefined> {
    const [entry] = await db.select().from(dictionaryEntries)
      .where(eq(dictionaryEntries.id, id));
    return entry;
  }

  async getDictionaryStats(): Promise<{ totalEntries: number; letters: string[] }> {
    const [countResult] = await db.select({
      count: sql<number>`count(*)`,
    }).from(dictionaryEntries);

    const letterResults = await db.selectDistinct({
      letter: dictionaryEntries.letter,
    }).from(dictionaryEntries)
      .orderBy(dictionaryEntries.letter);

    return {
      totalEntries: countResult?.count || 0,
      letters: letterResults.map(r => r.letter),
    };
  }

  async getAllDictionaryTerms(): Promise<Pick<DictionaryEntry, 'id' | 'term' | 'termLower' | 'letter'>[]> {
    return db.select({
      id: dictionaryEntries.id,
      term: dictionaryEntries.term,
      termLower: dictionaryEntries.termLower,
      letter: dictionaryEntries.letter,
    }).from(dictionaryEntries)
      .orderBy(dictionaryEntries.termLower);
  }

  async getDictionaryBatch(offset: number, limit: number): Promise<DictionaryEntry[]> {
    const maxLimit = Math.min(limit, 500);
    return db.select().from(dictionaryEntries)
      .orderBy(dictionaryEntries.termLower)
      .offset(offset)
      .limit(maxLimit);
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [n] = await db.insert(notifications).values(notification).returning();
    return n;
  }

  async getUserNotifications(userId: string, limit: number = 30): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    const [n] = await db.select().from(notifications).where(eq(notifications.id, id));
    return n;
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [n] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return n;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result?.count || 0;
  }

  // Global search
  async searchGlobal(query: string): Promise<{ courses: any[]; threads: any[]; downloads: any[] }> {
    const term = query.trim();
    if (term.length < 2) return { courses: [], threads: [], downloads: [] };

    const pattern = `%${term}%`;

    const [courseResults, threadResults, downloadResults] = await Promise.all([
      db.select({ id: courses.id, title: courses.title, description: courses.description, category: courses.category })
        .from(courses)
        .where(and(
          eq(courses.isPublished, true),
          or(sql`${courses.title} ILIKE ${pattern}`, sql`${courses.description} ILIKE ${pattern}`)
        ))
        .limit(5),
      db.select({
          id: forum_threads.id,
          title: forum_threads.title,
          categoryId: forum_threads.categoryId,
          createdAt: forum_threads.createdAt,
        })
        .from(forum_threads)
        .where(or(sql`${forum_threads.title} ILIKE ${pattern}`, sql`${forum_threads.content} ILIKE ${pattern}`))
        .orderBy(desc(forum_threads.createdAt))
        .limit(5),
      db.select({ id: downloads.id, title: downloads.title, description: downloads.description, category: downloads.category })
        .from(downloads)
        .where(and(
          eq(downloads.isPublished, true),
          or(sql`${downloads.title} ILIKE ${pattern}`, sql`${downloads.description} ILIKE ${pattern}`)
        ))
        .limit(5),
    ]);

    return {
      courses: courseResults,
      threads: threadResults,
      downloads: downloadResults,
    };
  }

  // Thread subscriptions
  async subscribeToThread(userId: string, threadId: string): Promise<ThreadSubscription> {
    const [sub] = await db.insert(threadSubscriptions)
      .values({ userId, threadId })
      .onConflictDoNothing()
      .returning();
    // If conflict (already subscribed), fetch existing
    if (!sub) {
      const [existing] = await db.select().from(threadSubscriptions)
        .where(and(eq(threadSubscriptions.userId, userId), eq(threadSubscriptions.threadId, threadId)));
      return existing;
    }
    return sub;
  }

  async unsubscribeFromThread(userId: string, threadId: string): Promise<void> {
    await db.delete(threadSubscriptions)
      .where(and(eq(threadSubscriptions.userId, userId), eq(threadSubscriptions.threadId, threadId)));
  }

  async isSubscribedToThread(userId: string, threadId: string): Promise<boolean> {
    const [sub] = await db.select({ id: threadSubscriptions.id }).from(threadSubscriptions)
      .where(and(eq(threadSubscriptions.userId, userId), eq(threadSubscriptions.threadId, threadId)));
    return !!sub;
  }

  async getThreadSubscribers(threadId: string): Promise<string[]> {
    const subs = await db.select({ userId: threadSubscriptions.userId }).from(threadSubscriptions)
      .where(eq(threadSubscriptions.threadId, threadId));
    return subs.map(s => s.userId);
  }

  // Forum likes
  async likeThread(userId: string, threadId: string): Promise<void> {
    await db.insert(forum_likes).values({ userId, threadId }).onConflictDoNothing();
  }

  async unlikeThread(userId: string, threadId: string): Promise<void> {
    await db.delete(forum_likes)
      .where(and(eq(forum_likes.userId, userId), eq(forum_likes.threadId, threadId)));
  }

  async likeReply(userId: string, replyId: string): Promise<void> {
    await db.insert(forum_likes).values({ userId, replyId }).onConflictDoNothing();
  }

  async unlikeReply(userId: string, replyId: string): Promise<void> {
    await db.delete(forum_likes)
      .where(and(eq(forum_likes.userId, userId), eq(forum_likes.replyId, replyId)));
  }

  async getThreadLikeCounts(threadIds: string[]): Promise<Record<string, number>> {
    if (threadIds.length === 0) return {};
    const rows = await db.select({
      threadId: forum_likes.threadId,
      count: sql<number>`count(*)::int`,
    }).from(forum_likes)
      .where(inArray(forum_likes.threadId!, threadIds))
      .groupBy(forum_likes.threadId);
    const map: Record<string, number> = {};
    for (const r of rows) if (r.threadId) map[r.threadId] = r.count;
    return map;
  }

  async getReplyLikeCounts(replyIds: string[]): Promise<Record<string, number>> {
    if (replyIds.length === 0) return {};
    const rows = await db.select({
      replyId: forum_likes.replyId,
      count: sql<number>`count(*)::int`,
    }).from(forum_likes)
      .where(inArray(forum_likes.replyId!, replyIds))
      .groupBy(forum_likes.replyId);
    const map: Record<string, number> = {};
    for (const r of rows) if (r.replyId) map[r.replyId] = r.count;
    return map;
  }

  async getUserLikedThreadIds(userId: string, threadIds: string[]): Promise<Set<string>> {
    if (threadIds.length === 0) return new Set();
    const rows = await db.select({ threadId: forum_likes.threadId }).from(forum_likes)
      .where(and(eq(forum_likes.userId, userId), inArray(forum_likes.threadId!, threadIds)));
    return new Set(rows.map(r => r.threadId!).filter(Boolean));
  }

  async getUserLikedReplyIds(userId: string, replyIds: string[]): Promise<Set<string>> {
    if (replyIds.length === 0) return new Set();
    const rows = await db.select({ replyId: forum_likes.replyId }).from(forum_likes)
      .where(and(eq(forum_likes.userId, userId), inArray(forum_likes.replyId!, replyIds)));
    return new Set(rows.map(r => r.replyId!).filter(Boolean));
  }

  async getCategoryThreadCounts(): Promise<Record<string, number>> {
    const rows = await db.select({
      categoryId: forum_threads.categoryId,
      count: sql<number>`count(*)::int`,
    }).from(forum_threads)
      .groupBy(forum_threads.categoryId);
    const map: Record<string, number> = {};
    for (const r of rows) map[r.categoryId] = r.count;
    return map;
  }

  // Public profile
  async getPublicProfile(userId: string): Promise<{ user: any; threadCount: number; replyCount: number } | null> {
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, userId));

    if (!user) return null;

    const [threadStats] = await db.select({ count: sql<number>`count(*)` })
      .from(forum_threads).where(eq(forum_threads.authorId, userId));

    const [replyStats] = await db.select({ count: sql<number>`count(*)` })
      .from(forum_replies).where(eq(forum_replies.authorId, userId));

    return {
      user,
      threadCount: threadStats?.count || 0,
      replyCount: replyStats?.count || 0,
    };
  }

  // Dashboard
  async getDashboardStats(userId: string): Promise<{
    coursesInProgress: number;
    coursesCompleted: number;
    availableCourses: number;
    forumPosts: number;
    videosWatched: number;
  }> {
    const [inProgressResult] = await db.select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), sql`${enrollments.completedAt} IS NULL`));

    const [completedResult] = await db.select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), sql`${enrollments.completedAt} IS NOT NULL`));

    const [availableResult] = await db.select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.isPublished, true));

    const [threadCount] = await db.select({ count: sql<number>`count(*)` })
      .from(forum_threads).where(eq(forum_threads.authorId, userId));

    const [replyCount] = await db.select({ count: sql<number>`count(*)` })
      .from(forum_replies).where(eq(forum_replies.authorId, userId));

    const [videosResult] = await db.select({ count: sql<number>`count(*)` })
      .from(videoProgress)
      .where(and(eq(videoProgress.userId, userId), eq(videoProgress.isCompleted, true)));

    return {
      coursesInProgress: inProgressResult?.count || 0,
      coursesCompleted: completedResult?.count || 0,
      availableCourses: availableResult?.count || 0,
      forumPosts: (threadCount?.count || 0) + (replyCount?.count || 0),
      videosWatched: videosResult?.count || 0,
    };
  }

  async getRecentUserActivity(userId: string, limit: number = 10): Promise<any[]> {
    // Get recent enrollments
    const recentEnrollments = await db.select({
      id: enrollments.id,
      type: sql<string>`'enrollment'`,
      title: courses.title,
      date: enrollments.enrolledAt,
    })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(limit);

    // Get recent forum threads
    const recentThreads = await db.select({
      id: forum_threads.id,
      type: sql<string>`'forum_thread'`,
      title: forum_threads.title,
      date: forum_threads.createdAt,
    })
      .from(forum_threads)
      .where(eq(forum_threads.authorId, userId))
      .orderBy(desc(forum_threads.createdAt))
      .limit(limit);

    // Get recent forum replies
    const recentReplies = await db.select({
      id: forum_replies.id,
      type: sql<string>`'forum_reply'`,
      title: forum_threads.title,
      date: forum_replies.createdAt,
    })
      .from(forum_replies)
      .innerJoin(forum_threads, eq(forum_replies.threadId, forum_threads.id))
      .where(eq(forum_replies.authorId, userId))
      .orderBy(desc(forum_replies.createdAt))
      .limit(limit);

    // Get recent video watches
    const recentVideos = await db.select({
      id: videoProgress.id,
      type: sql<string>`'video_watch'`,
      title: videos.title,
      date: videoProgress.lastWatchedAt,
    })
      .from(videoProgress)
      .innerJoin(videos, eq(videoProgress.videoId, videos.id))
      .where(eq(videoProgress.userId, userId))
      .orderBy(desc(videoProgress.lastWatchedAt))
      .limit(limit);

    // Combine and sort by date
    const allActivity = [
      ...recentEnrollments,
      ...recentThreads,
      ...recentReplies,
      ...recentVideos,
    ].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    return allActivity.slice(0, limit);
  }

  // Comments
  async getCommentsByTarget(targetType: string, targetId: string): Promise<(Comment & { author: { id: string; firstName: string; lastName: string; username: string | null; role: string | null } })[]> {
    const results = await db
      .select({
        comment: comments,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          role: users.role,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(and(eq(comments.targetType, targetType), eq(comments.targetId, targetId)))
      .orderBy(comments.createdAt);

    return results.map(r => ({
      ...r.comment,
      author: r.author,
    }));
  }

  async createComment(data: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }

  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async updateComment(id: string, data: { content: string }): Promise<Comment> {
    const [comment] = await db.update(comments)
      .set({ content: data.content, isEdited: true, editedAt: new Date(), updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Newsletter Campaigns
  async getAllNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
    return await db.select().from(newsletter_campaigns)
      .orderBy(desc(newsletter_campaigns.createdAt));
  }

  async getNewsletterCampaign(id: string): Promise<NewsletterCampaign | undefined> {
    const [campaign] = await db.select().from(newsletter_campaigns)
      .where(eq(newsletter_campaigns.id, id));
    return campaign;
  }

  async createNewsletterCampaign(data: InsertNewsletterCampaign): Promise<NewsletterCampaign> {
    const [campaign] = await db.insert(newsletter_campaigns).values(data).returning();
    return campaign;
  }

  async updateNewsletterCampaign(id: string, data: Partial<InsertNewsletterCampaign>): Promise<NewsletterCampaign> {
    const [campaign] = await db.update(newsletter_campaigns)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(newsletter_campaigns.id, id))
      .returning();
    return campaign;
  }

  async markNewsletterCampaignSent(id: string, recipientCount: number): Promise<NewsletterCampaign> {
    const [campaign] = await db.update(newsletter_campaigns)
      .set({ status: 'sent', sentAt: new Date(), recipientCount, updatedAt: new Date() })
      .where(eq(newsletter_campaigns.id, id))
      .returning();
    return campaign;
  }

  async deleteNewsletterCampaign(id: string): Promise<void> {
    await db.delete(newsletter_campaigns).where(eq(newsletter_campaigns.id, id));
  }

  async getAllNewsletterSubscribers(): Promise<Newsletter[]> {
    return await db.select().from(newsletter_subscribers)
      .orderBy(desc(newsletter_subscribers.subscribed_at));
  }
  // Subscription management
  async updateUserSubscription(userId: string, updates: Partial<{
    subscriptionTier: string;
    subscriptionStatus: string;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date | null;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    squareCustomerId: string;
    squareSubscriptionId: string;
    premiumGrantedBy: string;
    premiumGrantedAt: Date;
  }>): Promise<User> {
    const [updated] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async createSubscriptionRecord(data: InsertSubscription): Promise<Subscription> {
    const [record] = await db.insert(subscriptions).values(data).returning();
    return record;
  }

  async getSubscriptionHistory(userId: string): Promise<Subscription[]> {
    return await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
  }

  async getActiveSubscribers(): Promise<User[]> {
    return await db.select().from(users)
      .where(and(
        eq(users.subscriptionTier, 'premium'),
        eq(users.subscriptionStatus, 'active'),
      ))
      .orderBy(desc(users.subscriptionStartDate));
  }

  // Proof Vault operations
  async createProof(data: InsertProof): Promise<Proof> {
    const [proof] = await db.insert(proofs).values(data).returning();
    return proof;
  }

  async getProof(id: string, userId: string): Promise<Proof | undefined> {
    const [proof] = await db.select().from(proofs)
      .where(and(eq(proofs.id, id), eq(proofs.userId, userId)));
    return proof;
  }

  async getUserProofs(userId: string): Promise<Proof[]> {
    return db.select().from(proofs)
      .where(eq(proofs.userId, userId))
      .orderBy(desc(proofs.createdAt));
  }

  async getUserProofsByStatus(userId: string, status: string): Promise<Proof[]> {
    return db.select().from(proofs)
      .where(and(eq(proofs.userId, userId), eq(proofs.status, status as any)))
      .orderBy(desc(proofs.createdAt));
  }

  async updateProof(id: string, updates: Partial<{ status: string; otsProof: string | null; lastUpgradeAttemptAt: Date; updatedAt: Date; errorMessage: string | null }>, userId?: string): Promise<Proof> {
    const condition = userId
      ? and(eq(proofs.id, id), eq(proofs.userId, userId))
      : eq(proofs.id, id);
    const [updated] = await db.update(proofs)
      .set(updates as any)
      .where(condition)
      .returning();
    return updated;
  }

  async findProofsByHash(sha256: string, userId: string): Promise<Proof[]> {
    return db.select().from(proofs)
      .where(and(eq(proofs.sha256, sha256), eq(proofs.userId, userId)));
  }

  async getSubscriptionStats(): Promise<{ totalPremium: number; totalFree: number; recentSubscriptions: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [stats] = await db.select({
      totalPremium: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE subscription_tier = 'premium' AND subscription_status = 'active')`,
      totalFree: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE subscription_tier = 'free' OR subscription_tier IS NULL)`,
      recentSubscriptions: sql<number>`(SELECT COUNT(*) FROM ${subscriptions} WHERE created_at > ${thirtyDaysAgo})`,
    }).from(sql`(SELECT 1) as dummy`);

    return stats;
  }

  async getAllSubscribers(search?: string): Promise<User[]> {
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      return await db.select().from(users)
        .where(
          or(
            ilike(users.firstName, term),
            ilike(users.lastName, term),
            ilike(users.email, term),
          )
        )
        .orderBy(desc(users.createdAt));
    }
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getSubscriptionStatsWithChurn(): Promise<{ totalPremium: number; totalFree: number; recentSubscriptions: number; churnRate: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [stats] = await db.select({
      totalPremium: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE subscription_tier = 'premium' AND subscription_status = 'active')`,
      totalFree: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE subscription_tier = 'free' OR subscription_tier IS NULL OR subscription_status = 'none' OR subscription_status IS NULL)`,
      recentSubscriptions: sql<number>`(SELECT COUNT(*) FROM ${subscriptions} WHERE created_at > ${thirtyDaysAgo})`,
      cancelledLast30: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE subscription_status = 'cancelled' AND updated_at > ${thirtyDaysAgo})`,
      totalEverPremium: sql<number>`(SELECT COUNT(*) FROM ${users} WHERE subscription_tier = 'premium' OR subscription_status IN ('active', 'cancelled', 'expired'))`,
    }).from(sql`(SELECT 1) as dummy`);

    const churnRate = Number(stats.totalEverPremium) > 0
      ? Math.round((Number(stats.cancelledLast30) / Number(stats.totalEverPremium)) * 100 * 10) / 10
      : 0;

    return {
      totalPremium: Number(stats.totalPremium),
      totalFree: Number(stats.totalFree),
      recentSubscriptions: Number(stats.recentSubscriptions),
      churnRate,
    };
  }

  async adminUpdateSubscription(userId: string, updates: { status: string; plan: string; endDate: string | null }): Promise<User> {
    const subscriptionUpdates: Record<string, any> = {
      subscriptionStatus: updates.status,
      subscriptionTier: updates.plan,
      updatedAt: new Date(),
    };

    if (updates.endDate) {
      subscriptionUpdates.subscriptionEndDate = new Date(updates.endDate);
    } else {
      subscriptionUpdates.subscriptionEndDate = null;
    }

    // If setting to active and no start date exists, set one
    if (updates.status === 'active') {
      const user = await this.getUser(userId);
      if (user && !user.subscriptionStartDate) {
        subscriptionUpdates.subscriptionStartDate = new Date();
      }
    }

    const [updated] = await db.update(users)
      .set(subscriptionUpdates)
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  // GDPR data export helpers
  async getUserForumThreads(userId: string): Promise<any[]> {
    return await db.select().from(forum_threads).where(eq(forum_threads.authorId, userId)).orderBy(desc(forum_threads.createdAt));
  }

  async getUserForumReplies(userId: string): Promise<any[]> {
    return await db.select().from(forum_replies).where(eq(forum_replies.authorId, userId)).orderBy(desc(forum_replies.createdAt));
  }

  async getUserComments(userId: string): Promise<any[]> {
    return await db.select().from(comments).where(eq(comments.authorId, userId)).orderBy(desc(comments.createdAt));
  }

  // GDPR account deletion - delete all user data in a transaction
  async deleteAllUserData(userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete in order respecting foreign key constraints
      await tx.delete(notifications).where(eq(notifications.userId, userId));
      await tx.delete(comments).where(eq(comments.authorId, userId));
      await tx.delete(forum_likes).where(eq(forum_likes.userId, userId));
      await tx.delete(forum_replies).where(eq(forum_replies.authorId, userId));
      await tx.delete(forum_threads).where(eq(forum_threads.authorId, userId));
      await tx.delete(lesson_progress).where(eq(lesson_progress.userId, userId));
      await tx.delete(sectionProgress).where(eq(sectionProgress.userId, userId));
      await tx.delete(videoProgress).where(eq(videoProgress.userId, userId));
      await tx.delete(enrollments).where(eq(enrollments.userId, userId));
      await tx.delete(userDownloads).where(eq(userDownloads.userId, userId));
      await tx.delete(proofs).where(eq(proofs.userId, userId));
      await tx.delete(subscriptions).where(eq(subscriptions.userId, userId));
      await tx.delete(threadSubscriptions).where(eq(threadSubscriptions.userId, userId));
      // Clear lastReplyUserId references on threads before deleting user
      await tx.update(forum_threads).set({ lastReplyUserId: null }).where(eq(forum_threads.lastReplyUserId, userId));
      // Finally delete the user record
      await tx.delete(users).where(eq(users.id, userId));
    });
  }

  // ====== Trust Structure ======

  async getTrustEntities(): Promise<TrustEntity[]> {
    return await db.select().from(trustEntities).orderBy(trustEntities.sortOrder);
  }

  async getTrustEntity(id: string): Promise<TrustEntity | undefined> {
    const [entity] = await db.select().from(trustEntities).where(eq(trustEntities.id, id));
    return entity;
  }

  async createTrustEntity(entity: InsertTrustEntity): Promise<TrustEntity> {
    const [created] = await db.insert(trustEntities).values(entity).returning();
    return created;
  }

  async updateTrustEntity(id: string, updates: Partial<InsertTrustEntity>): Promise<TrustEntity> {
    const [updated] = await db
      .update(trustEntities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trustEntities.id, id))
      .returning();
    return updated;
  }

  async deleteTrustEntity(id: string): Promise<void> {
    // Delete relationships first
    await db.delete(trustRelationships).where(
      or(eq(trustRelationships.fromEntityId, id), eq(trustRelationships.toEntityId, id))
    );
    await db.delete(trustEntities).where(eq(trustEntities.id, id));
  }

  async getTrustRelationships(): Promise<TrustRelationship[]> {
    return await db.select().from(trustRelationships);
  }

  async createTrustRelationship(rel: InsertTrustRelationship): Promise<TrustRelationship> {
    const [created] = await db.insert(trustRelationships).values(rel).returning();
    return created;
  }

  async deleteTrustRelationship(id: string): Promise<void> {
    await db.delete(trustRelationships).where(eq(trustRelationships.id, id));
  }

  async getTrustStructure(): Promise<{ entities: TrustEntity[]; relationships: TrustRelationship[] }> {
    const [entities, relationships] = await Promise.all([
      this.getTrustEntities(),
      this.getTrustRelationships(),
    ]);
    return { entities, relationships };
  }

  async seedTrustStructure(): Promise<void> {
    // Only seed if empty
    const existing = await db.select().from(trustEntities).limit(1);
    if (existing.length > 0) return;

    // ══════════════════════════════════════════════════════════
    // BIBLICAL ECCLESIOLOGY: COVENANT GATEWAY → BODY OF CHRIST
    //
    //   [Individual] → [NCLT] (Covenant Gateway)
    //                     ↓ enters
    //                  [EB] (Body of Christ)
    //                ┌──────────────────────┐
    //                │   STEWARDSHIP ORGANS  │
    //                │   (5 trusts)          │
    //                │   ASSEMBLY (PMA)      │
    //                │   REGIONS → HOUSEHOLDS│
    //                │   CRAFTS / MINISTRIES │
    //                │   MEMBERS (joint heirs)│
    //                └──────────────────────┘
    // ══════════════════════════════════════════════════════════

    // === COVENANT GATEWAY ===
    const [nclt] = await db.insert(trustEntities).values({
      name: "New Covenant Legacy Trust",
      subtitle: "Acceptance of the New Covenant — The Granting Act",
      layer: "covenant",
      entityType: "covenant",
      description: 'Your acceptance of the New Covenant IS the granting act. The New Covenant (the Bible/New Testament) is the pre-existing Trust Instrument — the divine legal framework established by God Himself: "But this shall be the covenant that I will make with the house of Israel; After those days, saith the LORD, I will put my law in their inward parts, and write it in their hearts; and will be their God, and they shall be my people" (Jeremiah 31:31-33, Hebrews 8:8-12). By faith, confession, and baptism, you became the Grantor — depositing the old man (death with Christ, Romans 6:3-4), the body (temple of the Holy Spirit, 1 Corinthians 6:19-20), and all property into the trust. Christ is the Testator whose death activated the testament (Hebrews 9:16-17), the Mediator (Hebrews 9:15, 12:24), and eternal High Priest administering the covenant (Hebrews 7:24-25). The Holy Spirit is the Executor, Seal, and Guarantor (Ephesians 1:13-14, 2 Corinthians 1:21-22). "For he is not a Jew, which is one outwardly; neither is that circumcision, which is outward in the flesh: But he is a Jew, which is one inwardly; and circumcision is that of the heart, in the spirit, and not in the letter" (Romans 2:28-29). The NCLT is the individual\'s irrevocable entry into the pre-existing divine trust: a circumcision of heart establishing the singular relationship between man and God through Christ. The Grantor simultaneously becomes Beneficiary — heir of God, joint-heir with Christ (Romans 8:17). This trust is self-executing upon acceptance — no probate, court order, or administrative act required.',
      charter: 'The New Covenant, as set forth in the Holy Scriptures, is the pre-existing Trust Instrument — authored by God (Jeremiah 31:31-34, Hebrews 8:8-12), sealed by the blood of Christ the Testator (Hebrews 9:16-17), and administered by Christ as eternal High Priest and Mediator (Hebrews 7:24-25, Hebrews 9:15, 12:24). "But now hath he obtained a more excellent ministry, by how much also he is the mediator of a better covenant, which was established upon better promises" (Hebrews 8:6). The individual does not create a new trust; the individual ACCEPTS the pre-existing New Covenant, and that acceptance — by faith, confession, and baptism — IS the granting act that makes the individual the Grantor. As baptism effects the death of the old man and resurrection of the new (Romans 6:3-4), so this acceptance constitutes the irrevocable deposit of the old man, the body, and all property into the trust. "The earth is the LORD\'s, and the fulness thereof" (Psalm 24:1); all property held herein is stewarded, not owned. The trust is self-executing upon the individual\'s acceptance — requiring no probate, court order, or administrative act.',
      legalBasis: 'Divine law: "All scripture is given by inspiration of God" (2 Timothy 3:16); Natural law: inalienable rights endowed by the Creator; Common law of trusts: express private trust, not organized under any state trust code or Uniform Trust Code; First Amendment: free exercise, free association, peaceable assembly; Ninth Amendment: rights retained by the people; Tenth Amendment: powers reserved to the people; UCC 1-308: all rights reserved without prejudice; NAACP v. Alabama, 357 U.S. 449 (1958): right of free association; This trust does not seek, require, or operate under any statutory license, franchise, 501(c)(3) status, or governmental permission.',
      trusteeLabel: "The Individual (Covenant Maker)",
      protectorLabel: "Protector Council (3-member elder oversight body: 1 Timothy 5:17)",
      notes: 'The NCLT is irrevocable — the Grantor made the grant by accepting the New Covenant and cannot un-accept. "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62). This is not an organizational charter but the formal record of the individual\'s acceptance of the pre-existing New Covenant: the granting act that constitutes the circumcision of heart (Romans 2:29), entry through the narrow gate (Matthew 7:13-14), and the irrevocable deposit of the old man, body, and all property. Through this acceptance, the individual becomes the Grantor, a "new creature" (2 Corinthians 5:17), simultaneously Grantor and Beneficiary — heir of God, joint-heir with Christ (Romans 8:17) — and enters the Body. All disputes resolved under the Matthew 18 Protocol.',
      color: "#8B2500",
      icon: "scroll",
      sortOrder: 1,
      status: "active",
    }).returning();

    // === BODY OF CHRIST ===
    const [ebt] = await db.insert(trustEntities).values({
      name: "Ecclesia Basilikos",
      subtitle: "Body of Christ",
      layer: "body",
      entityType: "body",
      description: '"For as the body is one, and hath many members, and all the members of that one body, being many, are one body: so also is Christ. For by one Spirit are we all baptized into one body" (1 Corinthians 12:12-13). "And the multitude of them that believed were of one heart and of one soul: neither said any of them that ought of the things which he possessed was his own; but they had all things common" (Acts 4:32). The Body of Christ: the collective assembly of those who have entered through the covenant gateway. Everything exists within the Body: stewardship organs, the gathered assembly, regional churches, households, crafts, ministries, and all members. "There is neither Jew nor Greek, there is neither bond nor free, there is neither male nor female: for ye are all one in Christ Jesus" (Galatians 3:28).',
      charter: 'To be the living Body of Christ: the collective of all who have entered through the covenant. "And he is the head of the body, the church" (Colossians 1:18). The Body commissions stewardship organs, gathers the assembly, establishes regional churches, and nurtures households. All internal structures serve the Body and its members. "From whom the whole body fitly joined together and compacted by that which every joint supplieth, according to the effectual working in the measure of every part, maketh increase of the body unto the edifying of itself in love" (Ephesians 4:16).',
      legalBasis: 'Express trust under common law, not organized under any statutory code; First Amendment ecclesiastical governance: the right of the ecclesia to govern its own affairs without state interference; Common law fiduciary duty: the Trustee is bound by conscience and equity to administer the trust faithfully; "Render therefore unto Caesar the things which are Caesar\'s; and unto God the things that are God\'s" (Matthew 22:21).',
      trusteeLabel: "Administrative Steward (Trustee): 'a faithful and wise steward' (Luke 12:42)",
      protectorLabel: "Protector Council: elder oversight body per 1 Timothy 5:17, Titus 1:5-9",
      notes: '"Let all things be done decently and in order" (1 Corinthians 14:40). The Body is the living organism within which all operations take place. Christ is the Head (Colossians 1:18); the Body coordinates all its members and organs. "Now ye are the body of Christ, and members in particular" (1 Corinthians 12:27). "Where no counsel is, the people fall: but in the multitude of counsellors there is safety" (Proverbs 11:14).',
      color: "#1E3A5F",
      icon: "crown",
      sortOrder: 2,
      status: "active",
    }).returning();

    // === STEWARDSHIP ORGANS (within the Body) ===
    const [landTrust] = await db.insert(trustEntities).values({
      name: "Land Trust",
      subtitle: "Stewardship of Land",
      layer: "stewardship",
      entityType: "stewardship",
      description: '"And the LORD God took the man, and put him into the garden of Eden to dress it and to keep it" (Genesis 2:15). "The earth is the LORD\'s, and the fulness thereof" (Psalm 24:1). An organ of the Body responsible for dominion stewardship per Genesis 1:28. Holds and administers all real property, acreage, and land-based assets. Legal title is held by the trust; members receive beneficial use rights. "The land shall not be sold for ever: for the land is mine; for ye are strangers and sojourners with me" (Leviticus 25:23).',
      charter: 'To hold, protect, and steward all real property assets for the benefit of the Body. Following the Levitical model where land was allotted for use but belonged ultimately to God (Leviticus 25:23). Land is held in perpetuity for the community, never to be individually alienated, speculated upon, or encumbered. "Blessed are the meek: for they shall inherit the earth" (Matthew 5:5).',
      legalBasis: 'Land trust doctrine under common law; Beneficial interest separated from legal title; Spendthrift protections: no creditor may reach trust-held land; Not subject to partition or forced sale.',
      trusteeLabel: "Land Steward (Trustee): 'a good steward of the manifold grace of God' (1 Peter 4:10)",
      protectorLabel: "Body Oversight + Protector Council",
      notes: '"The land shall rest a sabbath unto the LORD" (Leviticus 25:4). Land is held in trust and never individually owned. Members have beneficial use rights through their membership in the Body. The Jubilee principle (Leviticus 25) governs long-term land allocation.',
      color: "#16A34A",
      icon: "map-pin",
      sortOrder: 10,
      status: "active",
    }).returning();

    const [housingTrust] = await db.insert(trustEntities).values({
      name: "Housing Trust",
      subtitle: "Shelter & Buildings",
      layer: "stewardship",
      entityType: "stewardship",
      description: '"My people shall dwell in a peaceable habitation, and in sure dwellings, and in quiet resting places" (Isaiah 32:18). An organ of the Body providing shelter. Administers housing structures, shelters, and buildings. Ensures members of the Body have access to covenant-aligned shelter. "In my Father\'s house are many mansions" (John 14:2).',
      charter: 'To provide and maintain shelter and dwelling infrastructure for the benefit of members of the Body. As Christ prepares a place for His people, so this organ of the Body prepares shelter for the covenant community.',
      legalBasis: 'Express trust under common law; Cooperative housing principles; Beneficial use rights: members use but do not own dwellings; Spendthrift protections.',
      trusteeLabel: "Housing Steward (Trustee)",
      protectorLabel: "Body Oversight + Protector Council",
      notes: '"By wisdom a house is built, and by understanding it is established" (Proverbs 24:3-4). Housing is allocated based on need, contribution, and family size. Members do not own dwellings; they have beneficial use rights as members of the Body.',
      color: "#6366F1",
      icon: "home",
      sortOrder: 11,
      status: "active",
    }).returning();

    const [treasuryTrust] = await db.insert(trustEntities).values({
      name: "Treasury Trust",
      subtitle: "Finances & Resources",
      layer: "stewardship",
      entityType: "stewardship",
      description: '"Bring ye all the tithes into the storehouse, that there may be meat in mine house" (Malachi 3:10). The treasury organ of the Body: the central storehouse. Manages financial contributions, allocations, reserves, and the economic infrastructure of the Body.',
      charter: 'To receive, hold, and allocate financial resources for the operations and growth of the Body according to the covenant mandate. "Honour the LORD with thy substance, and with the firstfruits of all thine increase" (Proverbs 3:9-10). Distribution follows the Acts 2:45 model: "as every man had need."',
      legalBasis: 'Express trust under common law; Private member contributions (not commercial transactions or taxable income); This treasury operates in the private domain.',
      trusteeLabel: "Treasury Steward (Trustee): 'the faithful and wise steward' (Luke 12:42)",
      protectorLabel: "Body Oversight + Annual Audit Committee (3 members: 2 Corinthians 13:1)",
      notes: '"For the love of money is the root of all evil" (1 Timothy 6:10). All financial flows are private member contributions, not commercial transactions. The treasury operates under lawful money principles, with complete financial transparency and quarterly reports to all members.',
      color: "#CA8A04",
      icon: "banknote",
      sortOrder: 12,
      status: "active",
    }).returning();

    const [enterpriseTrust] = await db.insert(trustEntities).values({
      name: "Enterprise Trust",
      subtitle: "Commerce & Innovation",
      layer: "stewardship",
      entityType: "stewardship",
      description: '"She considereth a field, and buyeth it: with the fruit of her hands she planteth a vineyard" (Proverbs 31:16). The enterprise organ of the Body, overseeing revenue-generating activities for community sustenance. Isolates commercial liability. Also administers the digital platform and community coordination infrastructure. "Whatsoever thy hand findeth to do, do it with thy might" (Ecclesiastes 9:10).',
      charter: 'To develop and manage revenue-generating enterprises and digital infrastructure for the sustenance and growth of the Body. "Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things" (Matthew 25:21).',
      legalBasis: 'Express trust under common law; Commercial liability isolation: each enterprise activity is a separate trust operation; Revenue flows to the Treasury Trust as first-fruits.',
      trusteeLabel: "Enterprise Steward (Trustee): 'a Proverbs 31 steward'",
      protectorLabel: "Body Oversight + Protector Council",
      notes: '"The hand of the diligent maketh rich" (Proverbs 10:4). Each enterprise operates as a separate activity under this trust for liability isolation. Revenue flows to the Treasury Trust for redistribution. "Not slothful in business; fervent in spirit; serving the Lord" (Romans 12:11).',
      color: "#0F766E",
      icon: "building",
      sortOrder: 13,
      status: "active",
    }).returning();

    const [educationTrust] = await db.insert(trustEntities).values({
      name: "Education Trust",
      subtitle: "Knowledge & Training",
      layer: "stewardship",
      entityType: "stewardship",
      description: '"Train up a child in the way he should go: and when he is old, he will not depart from it" (Proverbs 22:6). "Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth" (2 Timothy 2:15). The education organ of the Body, administering educational programs, courses, curriculum development, and training infrastructure.',
      charter: 'To develop, deliver, and steward educational resources that equip members of the Body for covenant community life and leadership. "And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also" (2 Timothy 2:2).',
      legalBasis: 'Express trust under common law; First Amendment religious education: the ecclesia has the inherent right to educate its members.',
      trusteeLabel: "Education Steward (Trustee): 'apt to teach' (1 Timothy 3:2)",
      protectorLabel: "Body Oversight + Protector Council",
      notes: '"My people are destroyed for lack of knowledge" (Hosea 4:6). Curriculum is developed by crafts and delivered through regions. Discipleship chains (2 Timothy 2:2) ensure knowledge passes from generation to generation.',
      color: "#0EA5E9",
      icon: "graduation-cap",
      sortOrder: 14,
      status: "active",
    }).returning();

    // === ASSEMBLY (within the Body) ===
    const [mainPma] = await db.insert(trustEntities).values({
      name: "Private Membership Association",
      subtitle: "The Gathered Ecclesia",
      layer: "assembly",
      entityType: "assembly",
      description: '"And I say also unto thee, That thou art Peter, and upon this rock I will build my church [ecclesia]; and the gates of hell shall not prevail against it" (Matthew 16:18). The gathered ecclesia within the Body: the voluntary assembly of believers. "For where two or three are gathered together in my name, there am I in the midst of them" (Matthew 18:20). The assembly organizes the people; the stewardship organs hold the assets for their benefit.',
      charter: 'To organize the voluntary assembly of members within the Body, establishing their rights, obligations, and mutual commitments. "Stand fast therefore in the liberty wherewith Christ hath made us free, and be not entangled again with the yoke of bondage" (Galatians 5:1). This assembly is not a state-chartered institution but a gathering of those who have entered the Body through the covenant.',
      legalBasis: 'First Amendment right of free association; NAACP v. Alabama, 357 U.S. 449 (1958); Roberts v. U.S. Jaycees, 468 U.S. 609 (1984); Boy Scouts of America v. Dale, 530 U.S. 640 (2000); Private contract law: voluntary agreement between private parties; This PMA is NOT a public accommodation, statutory entity, or 501(c)(3) organization.',
      trusteeLabel: "PMA Administrator: 'he that is greatest among you shall be your servant' (Matthew 23:11)",
      protectorLabel: "Membership Council: elder body per 1 Timothy 5:17",
      notes: '"Now ye are the body of Christ, and members in particular" (1 Corinthians 12:27). Membership is voluntary and requires signing the PMA agreement. Members are beneficiaries of trust assets, not owners. All disputes resolved through the Matthew 18 Protocol, never before civil courts (1 Corinthians 6:1-8).',
      color: "#7C3AED",
      icon: "users",
      sortOrder: 20,
      status: "active",
    }).returning();

    // === REGIONS (city-churches within the Body) ===
    const [regions] = await db.insert(trustEntities).values({
      name: "Regional Assemblies",
      subtitle: "City-Churches",
      layer: "region",
      entityType: "region",
      description: '"For this cause left I thee in Crete, that thou shouldest set in order the things that are wanting, and ordain elders in every city, as I had appointed thee" (Titus 1:5). "And when they had ordained them elders in every church, and had prayed with fasting, they commended them to the Lord" (Acts 14:23). Regional assemblies organized geographically within the Body: city-churches following the pattern of the seven churches of Revelation (Rev 2-3).',
      charter: 'To organize and govern regional community units within the Body, following the New Testament pattern of city-by-city establishment of the early church. Each region coordinates local members, worship, resource sharing, pastoral care, and ministry launches within its geographic area.',
      legalBasis: 'Derives authority from the assembly and covenant; First Amendment free exercise and assembly; Right of local ecclesia self-governance as practiced by the early church in every city (Acts 14:23, Titus 1:5).',
      trusteeLabel: "Region Steward: 'a bishop then must be... given to hospitality' (1 Timothy 3:2)",
      protectorLabel: "Assembly Oversight + Local Elder Body",
      notes: '"Obey them that have the rule over you, and submit yourselves: for they watch for your souls" (Hebrews 13:17). Regions are the geographic organizing unit within the Body. Each region appoints local elders per the qualifications of 1 Timothy 3:1-7 and Titus 1:5-9.',
      color: "#7C3AED",
      icon: "map-pin",
      sortOrder: 30,
      status: "active",
    }).returning();

    // === HOUSEHOLDS (house-churches within the Body) ===
    const [households] = await db.insert(trustEntities).values({
      name: "Households",
      subtitle: "House-Churches",
      layer: "household",
      entityType: "household",
      description: '"And they, continuing daily with one accord in the temple, and breaking bread from house to house, did eat their meat with gladness and singleness of heart" (Acts 2:46). "Greet the church that is in their house" (Romans 16:5). House-churches and oikos groups: the intimate gatherings within the Body where daily fellowship, shared meals, common labor, and worship take place.',
      charter: 'To organize shared living and resource-sharing groups within regions, following the koinonia model of Acts 2:42-47. "Behold, how good and how pleasant it is for brethren to dwell together in unity!" (Psalm 133:1).',
      legalBasis: 'Derives authority from parent region and assembly; Private cooperative living arrangement within the Body; Not a statutory co-op or HOA, but a private ecclesial household under common law trust.',
      trusteeLabel: "Household Lead: 'a servant of all' (Mark 9:35)",
      protectorLabel: "Region Steward + Local Elders",
      notes: '"Bear ye one another\'s burdens, and so fulfil the law of Christ" (Galatians 6:2). Households operate within their parent region. They share daily life, meals, labor, and resources.',
      color: "#7C3AED",
      icon: "sprout",
      sortOrder: 31,
      status: "active",
    }).returning();

    // === CRAFTS (Bezalel pattern within the Body) ===
    const [crafts] = await db.insert(trustEntities).values({
      name: "Crafts",
      subtitle: "Skilled Workers: Bezalel Pattern",
      layer: "craft",
      entityType: "craft",
      description: '"And I have filled him with the spirit of God, in wisdom, and in understanding, and in knowledge, and in all manner of workmanship" (Exodus 31:3). "Every wise hearted among you shall come, and make all that the LORD hath commanded" (Exodus 35:10). Functional groups within the Body organized around skills, trades, and areas of expertise following the Bezalel pattern. Crafts cross regional boundaries, connecting skilled workers across the Body.',
      charter: 'To organize functional working groups that develop and deploy specialized skills across the Body. "Seest thou a man diligent in his business? he shall stand before kings" (Proverbs 22:29). "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend" (Proverbs 27:17).',
      legalBasis: 'Derives authority from the assembly and covenant; Cross-regional functional authority delegated by the Body; First Amendment right of association for vocational fellowship.',
      trusteeLabel: "Craft Master: 'a workman that needeth not to be ashamed' (2 Timothy 2:15)",
      protectorLabel: "Assembly Oversight + Craft Council",
      notes: '"Whatsoever thy hand findeth to do, do it with thy might" (Ecclesiastes 9:10). Crafts include farming, construction, education, technology, healing arts, and other vocational groups. Three-tier membership: Apprentice, Journeyman, Master.',
      color: "#D97706",
      icon: "users",
      sortOrder: 32,
      status: "active",
    }).returning();

    // === MINISTRIES (diakonia within the Body) ===
    const [ministries] = await db.insert(trustEntities).values({
      name: "Ministries",
      subtitle: "Service Initiatives: Diakonia",
      layer: "ministry",
      entityType: "ministry",
      description: '"Then I told them of the hand of my God which was good upon me... And they said, Let us rise up and build. So they strengthened their hands for this good work" (Nehemiah 2:18). "For which of you, intending to build a tower, sitteth not down first, and counteth the cost, whether he have sufficient to finish it?" (Luke 14:28). Service initiatives and focused ministries within the Body, following the Nehemiah pattern of organized building and the diakonia (service) of the early church.',
      charter: 'To coordinate specific service initiatives and deliverables within the Body. "Commit thy works unto the LORD, and thy thoughts shall be established" (Proverbs 16:3). Each ministry has a defined scope and purpose, counting the cost before building (Luke 14:28).',
      legalBasis: 'Derives authority from parent entity (region, craft, or assembly); Resources allocated from stewardship organs through the Body.',
      trusteeLabel: "Ministry Lead: 'as Nehemiah organized the builders' (Nehemiah 3)",
      protectorLabel: "Assembly Oversight + Sponsoring Entity",
      notes: '"And let us not be weary in well doing: for in due season we shall reap, if we faint not" (Galatians 6:9). Ministries draw resources from stewardship organs and labor from craft and regional members.',
      color: "#6B7280",
      icon: "folder-open",
      sortOrder: 33,
      status: "active",
    }).returning();

    // === MEMBERS (joint heirs within the Body) ===
    const [members] = await db.insert(trustEntities).values({
      name: "Members of the Body",
      subtitle: "Joint Heirs with Christ",
      layer: "member",
      entityType: "member",
      description: '"And if children, then heirs; heirs of God, and joint-heirs with Christ" (Romans 8:17). "The Spirit itself beareth witness with our spirit, that we are the children of God" (Romans 8:16). All who have entered the Body through the covenant are members: both recipients (receiving from the community) and participants (giving back). "For we are labourers together with God" (1 Corinthians 3:9). "As every man hath received the gift, even so minister the same one to another, as good stewards of the manifold grace of God" (1 Peter 4:10).',
      charter: 'All members participate as both beneficiaries and stewards of the Body, receiving benefits and contributing to the common good. Each member holds one Beneficial Unit: an equal, undivided interest (1/N) in the trust corpus, analogous to being joint-heirs (Romans 8:17). Beneficial interest is non-transferable, non-attachable, and contingent on active covenant participation.',
      legalBasis: 'Beneficial interest under common law trust doctrine; Spendthrift trust protections: no external creditor may reach the Beneficial Unit; Interest is equitable, not legal: members have use rights, not ownership.',
      trusteeLabel: "Individual Members: 'ye are the body of Christ, and members in particular' (1 Corinthians 12:27)",
      protectorLabel: "Assembly Membership Council + Protector Council",
      notes: '"For even when we were with you, this we commanded you, that if any would not work, neither should he eat" (2 Thessalonians 3:10). Members are not owners; they are beneficiaries with use rights and stewards with responsibilities. Beneficial Units are non-transferable, non-attachable, and revocable only by voluntary withdrawal or covenant violation after the Matthew 18 process.',
      color: "#6B7280",
      icon: "users",
      sortOrder: 40,
      status: "active",
    }).returning();

    // ══════════════════════════════════════════════════════════
    // RELATIONSHIPS
    // ══════════════════════════════════════════════════════════

    // NCLT → EB (Enters: covenant gateway into the Body)
    await db.insert(trustRelationships).values({
      fromEntityId: nclt.id, toEntityId: ebt.id,
      relationshipType: "enters", label: "Baptized into the Body", notes: "'For by one Spirit are we all baptized into one body'. 1 Corinthians 12:13",
    });

    // === Body commissions stewardship organs ===
    await db.insert(trustRelationships).values([
      { fromEntityId: ebt.id, toEntityId: landTrust.id, relationshipType: "grants", label: "Commissions stewardship", notes: "Stewardship mandate. Genesis 2:15" },
      { fromEntityId: ebt.id, toEntityId: housingTrust.id, relationshipType: "grants", label: "Commissions stewardship", notes: "Shelter provision. Isaiah 32:18" },
      { fromEntityId: ebt.id, toEntityId: treasuryTrust.id, relationshipType: "grants", label: "Commissions stewardship", notes: "Storehouse principle. Malachi 3:10" },
      { fromEntityId: ebt.id, toEntityId: enterpriseTrust.id, relationshipType: "grants", label: "Commissions stewardship", notes: "Fruitful enterprise. Proverbs 31:16-18" },
      { fromEntityId: ebt.id, toEntityId: educationTrust.id, relationshipType: "grants", label: "Commissions stewardship", notes: "Teaching mandate. Deuteronomy 6:7" },
    ]);

    // === Body establishes the assembly ===
    await db.insert(trustRelationships).values({
      fromEntityId: ebt.id, toEntityId: mainPma.id,
      relationshipType: "establishes_pma", label: "Gathers the assembly", notes: "Ecclesia assembly. Matthew 16:18 'Upon this rock I will build my ecclesia'",
    });

    // === Assembly → Community Structure ===
    await db.insert(trustRelationships).values([
      { fromEntityId: mainPma.id, toEntityId: regions.id, relationshipType: "oversees", label: "Elder oversight", notes: "Elder governance. 1 Timothy 5:17" },
      { fromEntityId: mainPma.id, toEntityId: crafts.id, relationshipType: "oversees", label: "Organizes", notes: "Gift coordination. 1 Corinthians 12:28" },
      { fromEntityId: mainPma.id, toEntityId: ministries.id, relationshipType: "oversees", label: "Commissions", notes: "Kingdom works. Nehemiah 2:17-18" },
    ]);

    // Regions → Households (house churches within regions)
    await db.insert(trustRelationships).values({
      fromEntityId: regions.id, toEntityId: households.id,
      relationshipType: "oversees", label: "Contains", notes: "House churches within assembly. Romans 16:5",
    });

    // === Stewardship organs benefit members ===
    await db.insert(trustRelationships).values([
      { fromEntityId: landTrust.id, toEntityId: members.id, relationshipType: "benefits", label: "Benefits", notes: "Inheritance of the land. Psalm 37:11" },
      { fromEntityId: housingTrust.id, toEntityId: members.id, relationshipType: "benefits", label: "Benefits", notes: "Shelter for the household. Proverbs 24:3-4" },
      { fromEntityId: treasuryTrust.id, toEntityId: members.id, relationshipType: "benefits", label: "Benefits", notes: "Distribution as every man had need. Acts 4:35" },
      { fromEntityId: enterpriseTrust.id, toEntityId: members.id, relationshipType: "benefits", label: "Benefits", notes: "The laborer is worthy. 1 Timothy 5:18" },
      { fromEntityId: educationTrust.id, toEntityId: members.id, relationshipType: "benefits", label: "Benefits", notes: "Teaching all nations. Matthew 28:19-20" },
    ]);

    // === Assembly organizes members ===
    await db.insert(trustRelationships).values({
      fromEntityId: mainPma.id, toEntityId: members.id,
      relationshipType: "oversees", label: "Organizes members", notes: "Shepherd the flock. 1 Peter 5:2",
    });

    // === Members contribute back (remits: upward flow) ===
    await db.insert(trustRelationships).values({
      fromEntityId: members.id, toEntityId: mainPma.id,
      relationshipType: "remits", label: "Contributes labor & resources", notes: "Each according to ability. Acts 11:29",
    });

    // === Treasury funds other stewardship organs ===
    await db.insert(trustRelationships).values([
      { fromEntityId: treasuryTrust.id, toEntityId: landTrust.id, relationshipType: "funds", label: "Allocates funds", notes: "Storehouse distribution. Acts 4:34-35" },
      { fromEntityId: treasuryTrust.id, toEntityId: housingTrust.id, relationshipType: "funds", label: "Allocates funds", notes: "Storehouse distribution. Acts 4:34-35" },
      { fromEntityId: treasuryTrust.id, toEntityId: enterpriseTrust.id, relationshipType: "funds", label: "Allocates funds", notes: "Parable of talents. Matthew 25:14-30" },
      { fromEntityId: treasuryTrust.id, toEntityId: educationTrust.id, relationshipType: "funds", label: "Allocates funds", notes: "Investment in wisdom. Proverbs 4:7" },
    ]);

    // === Enterprise revenue flows to treasury ===
    await db.insert(trustRelationships).values({
      fromEntityId: enterpriseTrust.id, toEntityId: treasuryTrust.id,
      relationshipType: "remits", label: "Revenue flows", notes: "Firstfruits to the storehouse. Proverbs 3:9-10",
    });

    // ══════════════════════════════════════════════════════════
    // ECCLESIASTICAL RELATIONSHIPS
    // ══════════════════════════════════════════════════════════

    // === SHEPHERDING (Pastoral Care. 1 Peter 5:2) ===
    await db.insert(trustRelationships).values([
      { fromEntityId: ebt.id, toEntityId: mainPma.id, relationshipType: "shepherds", label: "Pastoral oversight", notes: "'Feed the flock of God which is among you, taking the oversight thereof'. 1 Peter 5:2" },
      { fromEntityId: mainPma.id, toEntityId: regions.id, relationshipType: "shepherds", label: "Shepherds regions", notes: "'The elders which are among you I exhort... Feed the flock of God'. 1 Peter 5:1-2" },
      { fromEntityId: regions.id, toEntityId: households.id, relationshipType: "shepherds", label: "Shepherds households", notes: "'He shall feed his flock like a shepherd'. Isaiah 40:11" },
    ]);

    // === TEACHING (Discipleship. 2 Timothy 2:2) ===
    await db.insert(trustRelationships).values([
      { fromEntityId: educationTrust.id, toEntityId: mainPma.id, relationshipType: "teaches", label: "Equips the ecclesia", notes: "'For the perfecting of the saints, for the work of the ministry'. Ephesians 4:12" },
      { fromEntityId: educationTrust.id, toEntityId: crafts.id, relationshipType: "teaches", label: "Trains craft members", notes: "'The same commit thou to faithful men, who shall be able to teach others also'. 2 Timothy 2:2" },
      { fromEntityId: mainPma.id, toEntityId: regions.id, relationshipType: "teaches", label: "Doctrinal teaching", notes: "'Teaching them to observe all things whatsoever I have commanded you'. Matthew 28:20" },
      { fromEntityId: crafts.id, toEntityId: regions.id, relationshipType: "teaches", label: "Skills training", notes: "'Every wise hearted among you shall come, and make all that the LORD hath commanded'. Exodus 35:10" },
    ]);

    // === SERVICE (Diaconal. Mark 10:45) ===
    await db.insert(trustRelationships).values([
      { fromEntityId: mainPma.id, toEntityId: members.id, relationshipType: "serves", label: "Serves members", notes: "'Even as the Son of man came not to be ministered unto, but to minister'. Matthew 20:28" },
      { fromEntityId: crafts.id, toEntityId: households.id, relationshipType: "serves", label: "Serves households", notes: "'By love serve one another'. Galatians 5:13" },
      { fromEntityId: regions.id, toEntityId: members.id, relationshipType: "serves", label: "Serves local members", notes: "'As we have therefore opportunity, let us do good unto all men'. Galatians 6:10" },
    ]);

    // === TITHING (Storehouse. Malachi 3:10) ===
    await db.insert(trustRelationships).values([
      { fromEntityId: members.id, toEntityId: treasuryTrust.id, relationshipType: "tithes", label: "Tithes & offerings", notes: "'Bring ye all the tithes into the storehouse'. Malachi 3:10" },
      { fromEntityId: regions.id, toEntityId: treasuryTrust.id, relationshipType: "tithes", label: "Regional tithes", notes: "'Upon the first day of the week let every one of you lay by him in store'. 1 Corinthians 16:2" },
      { fromEntityId: households.id, toEntityId: treasuryTrust.id, relationshipType: "tithes", label: "Household contributions", notes: "'Honour the LORD with thy substance, and with the firstfruits of all thine increase'. Proverbs 3:9" },
      { fromEntityId: crafts.id, toEntityId: treasuryTrust.id, relationshipType: "tithes", label: "Craft revenue share", notes: "'The labourer is worthy of his reward'. 1 Timothy 5:18" },
    ]);
  }

  async resetTrustStructure(): Promise<void> {
    // Delete all relationships first (foreign key constraints)
    await db.delete(trustRelationships);
    // Delete all entities
    await db.delete(trustEntities);
    // Re-seed with defaults
    await this.seedTrustStructure();
  }

  // ====== Trust Document Templates ======

  async getTrustDocumentTemplates(): Promise<(TrustDocumentTemplate & { sections: TrustTemplateSectionType[] })[]> {
    const templates = await db.select().from(trustDocumentTemplates).orderBy(trustDocumentTemplates.name);
    const allSections = await db.select().from(trustTemplateSections).orderBy(trustTemplateSections.sortOrder);
    return templates.map(t => ({
      ...t,
      sections: allSections.filter(s => s.templateId === t.id),
    }));
  }

  async getTrustDocumentTemplate(id: string): Promise<(TrustDocumentTemplate & { sections: TrustTemplateSectionType[] }) | undefined> {
    const [template] = await db.select().from(trustDocumentTemplates).where(eq(trustDocumentTemplates.id, id));
    if (!template) return undefined;
    const sections = await db.select().from(trustTemplateSections)
      .where(eq(trustTemplateSections.templateId, id))
      .orderBy(trustTemplateSections.sortOrder);
    return { ...template, sections };
  }

  async createTrustDocumentTemplate(data: InsertTrustDocumentTemplate): Promise<TrustDocumentTemplate> {
    const [created] = await db.insert(trustDocumentTemplates).values(data).returning();
    return created;
  }

  async updateTrustDocumentTemplate(id: string, updates: Partial<InsertTrustDocumentTemplate>): Promise<TrustDocumentTemplate> {
    const [updated] = await db.update(trustDocumentTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trustDocumentTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteTrustDocumentTemplate(id: string): Promise<void> {
    await db.delete(trustDocumentTemplates).where(eq(trustDocumentTemplates.id, id));
  }

  async replaceTrustTemplateSections(templateId: string, sections: Omit<InsertTrustTemplateSection, 'templateId'>[]): Promise<TrustTemplateSectionType[]> {
    await db.delete(trustTemplateSections).where(eq(trustTemplateSections.templateId, templateId));
    if (sections.length === 0) return [];
    const rows = sections.map((s, i) => ({
      ...s,
      templateId,
      sortOrder: s.sortOrder ?? i,
    }));
    return await db.insert(trustTemplateSections).values(rows).returning();
  }

  async reseedTrustDocumentTemplates(): Promise<void> {
    // Delete all existing built-in templates, their sections, AND any documents that reference them
    const builtIn = await db.select({ id: trustDocumentTemplates.id })
      .from(trustDocumentTemplates)
      .where(eq(trustDocumentTemplates.isBuiltIn, true));
    for (const t of builtIn) {
      // Find documents referencing this template
      const docs = await db.select({ id: trustDocuments.id })
        .from(trustDocuments)
        .where(eq(trustDocuments.templateId, t.id));
      // Delete document sections, then documents
      for (const d of docs) {
        await db.delete(trustDocumentSections).where(eq(trustDocumentSections.documentId, d.id));
      }
      await db.delete(trustDocuments).where(eq(trustDocuments.templateId, t.id));
      // Now delete template sections and template
      await db.delete(trustTemplateSections).where(eq(trustTemplateSections.templateId, t.id));
      await db.delete(trustDocumentTemplates).where(eq(trustDocumentTemplates.id, t.id));
    }
    // Now seed fresh
    await this.seedTrustDocumentTemplatesCore();
  }

  async seedTrustDocumentTemplates(): Promise<void> {
    const existing = await db.select().from(trustDocumentTemplates).limit(1);
    if (existing.length > 0) return;
    await this.seedTrustDocumentTemplatesCore();
  }

  private async seedTrustDocumentTemplatesCore(): Promise<void> {

    const templates: { name: string; description: string; layers: string[]; sections: { title: string; content: string }[] }[] = [
      // ═══════════════════════════════════════════════════════════════════════════
      // 1. DECLARATION OF TRUST. Individual Covenant Gateway
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Declaration of Trust",
        description: "Acceptance of the New Covenant: the granting act by which the individual becomes Grantor, entering the pre-existing divine trust framework",
        layers: ["covenant"],
        sections: [
          { title: "Scripture Preamble", content: '"The earth is the LORD\'s, and the fulness thereof; the world, and they that dwell therein."\n— Psalm 24:1\n\n"But now hath he obtained a more excellent ministry, by how much also he is the mediator of a better covenant, which was established upon better promises."\n— Hebrews 8:6\n\n"If ye be willing and obedient, ye shall eat the good of the land."\n— Isaiah 1:19\n\n"Know ye not, that so many of us as were baptized into Jesus Christ were baptized into his death? Therefore we are buried with him by baptism into death: that like as Christ was raised up from the dead by the glory of the Father, even so we also should walk in newness of life. For if we have been planted together in the likeness of his death, we shall be also in the likeness of his resurrection: Knowing this, that our old man is crucified with him, that the body of sin might be destroyed, that henceforth we should not serve sin. For he that is dead is freed from sin. Now if we be dead with Christ, we believe that we shall also live with him: Knowing that Christ being raised from the dead dieth no more; death hath no more dominion over him. For in that he died, he died unto sin once: but in that he liveth, he liveth unto God. Likewise reckon ye also yourselves to be dead indeed unto sin, but alive unto God through Jesus Christ our Lord."\n— Romans 6:3-11\n\n"I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me."\n— Galatians 2:20\n\n"Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new."\n— 2 Corinthians 5:17\n\n"In whom also ye are circumcised with the circumcision made without hands, in putting off the body of the sins of the flesh by the circumcision of Christ: Buried with him in baptism, wherein also ye are risen with him through the faith of the operation of God, who hath raised him from the dead. And you, being dead in your sins and the uncircumcision of your flesh, hath he quickened together with him, having forgiven you all trespasses; Blotting out the handwriting of ordinances that was against us, which was contrary to us, and took it out of the way, nailing it to his cross; And having spoiled principalities and powers, he made a shew of them openly, triumphing over them in it."\n— Colossians 2:11-15\n\n"And for this cause he is the mediator of the new testament, that by means of death, for the redemption of the transgressions that were under the first testament, they which are called might receive the promise of eternal inheritance. For where a testament is, there must also of necessity be the death of the testator. For a testament is of force after men are dead: otherwise it is of no strength at all while the testator liveth."\n— Hebrews 9:15-17\n\n"In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him; and without him was not any thing made that was made. In him was life; and the life was the light of men. And the light shineth in darkness; and the darkness comprehended it not. ... And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth."\n— John 1:1-5, 14' },
          { title: "Recitals", content: 'WHEREAS, the Creator of Heaven and Earth is the ultimate owner and sovereign over all property, and mankind is appointed as steward thereof (Genesis 1:28, Psalm 24:1);\n\nWHEREAS, the New Covenant, as set forth in the Holy Scriptures (the New Testament), constitutes the Trust Instrument — the divine, pre-existing legal framework established by God Himself: "Behold, the days come, saith the LORD, that I will make a new covenant with the house of Israel, and with the house of Judah" (Jeremiah 31:31-34, Hebrews 8:8-12);\n\nWHEREAS, the individual\'s acceptance of the New Covenant — by faith, confession, and baptism — constitutes the irrevocable granting act whereby the individual becomes the Grantor, depositing the old man, the body, and all associated property into the trust;\n\nWHEREAS, this granting act is not the creation of a new trust but the individual\'s entry into the pre-existing divine trust framework, the New Covenant having been authored by God, sealed by the blood of Christ, and administered by the Holy Spirit before the individual\'s acceptance;\n\nWHEREAS, the right of the People to freely associate, worship, contract, and hold property in trust is antecedent to any civil government, recognized but not granted by the First, Ninth, and Tenth Amendments to the Constitution of the United States;\n\nWHEREAS, the common law of trusts has existed since antiquity, predating all statutory codes, and an express private trust is not a creation of statute but a creature of equity, governed by the intent of the Grantor and the conscience of the Trustee;\n\nWHEREAS, the Supreme Court has repeatedly affirmed that the right of free association is protected (NAACP v. Alabama, 357 U.S. 449 (1958)), and that private trust instruments are governed by trust law and equity, not by statutory regulatory schemes designed for public or commercial entities;\n\nWHEREAS, the early church (ecclesia) operated as a self-governing body of believers holding all things in common (Acts 2:44-45, Acts 4:32-35), governed by elders and deacons, accountable to Christ alone as Head;\n\nWHEREAS, the Holy Spirit is given as the Executor, Seal, and Guarantor of the New Covenant, in whom the believer is sealed unto the day of redemption and who serves as the earnest of the inheritance (Ephesians 1:13-14, 2 Corinthians 1:21-22);\n\nWHEREAS, the body of each covenant member is the temple of the Holy Spirit, held in trust and not their own, for they are bought with a price and are to glorify God in body and spirit, which are God\'s (1 Corinthians 6:19-20);\n\nWHEREAS, the New Covenant is self-executing upon the individual\'s acceptance — requiring no external probate, court order, or administrative act to become effective — for as many as have been baptized into Christ have been buried with Him and raised to walk in newness of life (Romans 6:3-4, Colossians 2:12);\n\nWHEREAS, the Grantor, by accepting the New Covenant, has been crucified with Christ and the life now lived is lived by faith in the Son of God who loved him and gave Himself for him (Galatians 2:20), constituting a complete novation of identity from the old man to the new man in Christ;\n\nWHEREAS, the deposit of the body as trust corpus is made by the granting act of acceptance, voluntarily and irrevocably, as the Grantor is bought with a price and is therefore not his own but belongs to God (1 Corinthians 6:20, 1 Corinthians 7:23);\n\nWHEREAS, the old man is dead and the new man is raised in Christ, constituting a decedent estate from which all worldly claims, debts, and obligations are discharged, for he that is dead is freed from sin and from the law (Romans 6:6-7, Colossians 3:3);\n\nWHEREAS, the New Covenant established by the blood of Jesus Christ supersedes and fulfills all prior covenants, constitutions, and agreements, for in that He saith a new covenant He hath made the first old, and that which decayeth and waxeth old is ready to vanish away (Hebrews 8:13, Hebrews 10:9);\n\nWHEREAS, by the granting act of acceptance, the Grantor simultaneously becomes Beneficiary — heir of God and joint-heir with Christ (Romans 8:17) — possessing beneficial interest in the entire estate of the Kingdom, having received the spirit of adoption whereby they cry Abba, Father;\n\nWHEREAS, Jesus Christ is the Mediator of the New Covenant (Hebrews 9:15, 12:24), the Testator whose death activated the testament (Hebrews 9:16-17), and the High Priest who administers the covenant in perpetuity after the order of Melchisedec, ever living to make intercession (Hebrews 7:24-25);\n\nNOW, THEREFORE, this Declaration of Trust is established on {{date}} under divine law, natural law, common law, and the inherent sovereign right of the People.' },
          { title: "Article I. Creation & Name", content: 'The Grantor, by accepting the New Covenant, hereby declares entry into the irrevocable express trust to be known as "{{entity.name}}", organized as a private, non-statutory, ecclesiastical trust.\n\nThis Trust is not organized under any state trust code, Uniform Trust Code, business organization statute, or Internal Revenue Code provision. It exists under the common law of trusts and the equitable jurisdiction of any court of competent jurisdiction.\n\nAuthority chain: {{authority.chain}}\n\nFOUNDATION:\nThe Trust Instrument is the New Covenant itself — the divine, pre-existing legal framework authored by God (Jeremiah 31:31-34, Hebrews 8:8-12), sealed by the blood of Christ the Testator (Hebrews 9:16-17), and administered by Christ as eternal High Priest and Mediator (Hebrews 7:24-25, Hebrews 9:15, 12:24). The individual does not create a new trust; the individual accepts the pre-existing New Covenant. The foundation is not any human institution, civil charter, or statutory grant, but the eternal and unchangeable covenant sealed by the blood of Christ (Hebrews 13:20). The Holy Spirit serves as Executor, Seal, and Guarantor of this covenant (Ephesians 1:13-14, 2 Corinthians 1:21-22).\n\nTHE GRANTING ACT:\nThe individual\'s acceptance of the New Covenant — by faith, confession, and baptism — IS the granting act. This is the moment at which the individual becomes the Grantor: the moment of believing in the heart and confessing with the mouth (Romans 10:9-10), sealed in baptism (Romans 6:3-4). By this acceptance, the Grantor irrevocably deposits the old man (death with Christ), the body (temple of the Holy Spirit, 1 Corinthians 6:19-20), and all property, labor, and increase into the trust. The Grantor simultaneously becomes Beneficiary — heir of God, joint-heir with Christ (Romans 8:17). This granting act is irrevocable: "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62).\n\nSOVEREIGN IDENTITY:\nThe Grantor, having accepted the New Covenant and thereby died with Christ in baptism (Romans 6:3-4) and been raised a new creature (2 Corinthians 5:17), operates exclusively in the capacity of the new man, created in righteousness and true holiness (Ephesians 4:24). The old man is dead (Colossians 3:3). This Trust is the juridical expression of the Grantor\'s acceptance of the New Covenant and the new identity that acceptance confers.\n\nEMBODIED PARTICIPATION:\nThis Trust is not a mere legal fiction or abstract arrangement but the embodied participation of the Grantor in the death, burial, and resurrection of Jesus Christ, entered into by the granting act of acceptance. Every provision herein flows from the living reality of union with Christ and membership in His Body (1 Corinthians 12:12-27).\n\nDEPOSIT OF BODY:\nBy the granting act of acceptance, the Grantor deposits as the initial trust corpus: the body, being the temple of the Holy Spirit (1 Corinthians 6:19), together with all labor, increase, and productivity thereof, all faculties of mind, will, and strength, and all tangible and intangible property now held or hereafter acquired. This deposit is made voluntarily and irrevocably, in recognition that the Grantor is bought with a price (1 Corinthians 6:20) and holds all things as a steward, not as an owner.\n\nPERPETUAL DURATION:\nThis Trust shall endure in perpetuity, for the covenant upon which it is founded is an everlasting covenant (Hebrews 13:20), and the priesthood of Christ under which it is administered is unchangeable (Hebrews 7:24). No rule against perpetuities, statutory limitation, or civil decree shall operate to terminate or limit the duration of this Trust.\n\nSELF-EXECUTING NATURE:\nThis Trust is self-executing upon the Grantor\'s acceptance of the New Covenant. No probate, no court order, no administrative act is required to activate, validate, or give effect to this instrument. The death of the Testator (Christ) has already occurred (Hebrews 9:16-17), the testament is in force, and the inheritance is secured by the resurrection of Jesus Christ from the dead (1 Peter 1:3-4). The individual\'s acceptance activates the grant; no further act is needed.' },
          { title: "Article II. Covenant Purpose", content: '{{entity.charter}}\n\nThe purpose of this Trust is exclusively ecclesiastical, charitable, educational, and eleemosynary in nature, consistent with the biblical pattern of the early church:\n\n• To establish and maintain a covenant community of believers operating as an ecclesia (Matthew 18:20, Acts 2:42-47)\n• To hold, manage, and steward property and resources for the common benefit of all members\n• To provide for the spiritual, material, educational, and physical needs of the community\n• To operate all affairs under biblical governance: elders, deacons, and the five-fold ministry (Ephesians 4:11-13)\n• To maintain the private, non-commercial, non-statutory character of all trust operations\n\nGOVERNING LAW AND TRUST INSTRUMENT: THE NEW COVENANT:\nThe New Covenant is not merely the governing law of this Trust — it IS the Trust Instrument itself: the divine, pre-existing legal framework established by God (Jeremiah 31:31-34, Hebrews 8:8-12), activated by the death of Christ the Testator (Hebrews 9:16-17, Luke 22:20), mediated by Christ as eternal High Priest (Hebrews 7:24-25, Hebrews 9:15), and executed by the Holy Spirit as Seal and Guarantor (Ephesians 1:13-14, 2 Corinthians 1:21-22). This covenant supersedes all prior covenants, constitutions, codes, and statutory schemes. The Scripture, as the written expression of the New Covenant and the Trust Instrument, is the supreme and final authority for all matters of faith, practice, governance, and administration within this Trust (2 Timothy 3:16-17). The individual\'s acceptance of this pre-existing Trust Instrument is the granting act that makes the individual the Grantor.\n\nAUTHORITY FROM IDENTITY:\nThe authority of this Trust derives not from any grant of government, charter of incorporation, or statutory permission, but from the identity of the Grantor as a new creature in Christ (2 Corinthians 5:17) and from the sovereign will of Almighty God who has appointed His people as stewards of His creation. This authority is inherent, not delegated by any civil power, and exists independent of any recognition or approval by any earthly institution.\n\nTHREE JURISDICTIONAL REALMS:\nThis Trust operates simultaneously within three jurisdictional realms, each deriving from the Grantor\'s union with Christ:\n\n1. HEAVENLY JURISDICTION: The Grantor is seated with Christ in heavenly places (Ephesians 2:6), possessing citizenship in heaven (Philippians 3:20), and operating under the direct authority of the throne of God. This is the primary and supreme jurisdiction.\n\n2. ECCLESIASTICAL JURISDICTION: The Grantor is a member of the Body of Christ (1 Corinthians 12:27), subject to the governance of the ecclesia as established by Christ and administered through elders, deacons, and the five-fold ministry. This jurisdiction governs all internal affairs of the covenant community.\n\n3. NATURAL JURISDICTION: The Grantor exercises dominion stewardship over creation (Genesis 1:28), managing the natural resources, property, and affairs entrusted by God, in accordance with the principles of the New Covenant.\n\nTERMINATION OF OLD JURISDICTIONS:\nAll prior jurisdictional claims arising from the Grantor\'s former identity (including but not limited to citizenship obligations, statutory subjection, commercial entanglements, and contractual obligations of the old man) are terminated by operation of death (Romans 7:1-6). As the Grantor has died with Christ, the law has no more dominion, for the law hath dominion over a man only as long as he liveth. The Grantor, being dead to the law by the body of Christ, is married to another, even to Him who is raised from the dead (Romans 7:4).\n\nIMMUNITIES:\nBy virtue of the Grantor\'s death with Christ and resurrection to new life, this Trust and its parties claim all immunities arising from:\n• Death to the law and its penalties (Romans 6:7, Romans 7:4, Galatians 2:19)\n• Citizenship in heaven, not subject to earthly jurisdiction as a primary allegiance (Philippians 3:20)\n• The spoiling of principalities and powers by Christ on the cross (Colossians 2:15)\n• The blotting out of the handwriting of ordinances that was against us (Colossians 2:14)' },
          { title: "Article III. Legal Foundation & Reservations", content: '{{entity.legalBasis}}\n\nThis Trust operates under and reserves all rights pursuant to:\n\n1. DIVINE LAW: The supreme authority of Scripture as the governing document of this ecclesia (2 Timothy 3:16-17)\n2. NATURAL LAW: The inalienable rights endowed by the Creator, which no civil authority may abridge\n3. COMMON LAW OF TRUSTS: The ancient body of trust law developed in courts of equity, independent of any statutory code\n4. FIRST AMENDMENT: Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble\n5. NINTH AMENDMENT: The enumeration in the Constitution of certain rights shall not be construed to deny or disparage others retained by the people\n6. TENTH AMENDMENT: Powers not delegated to the United States by the Constitution are reserved to the States respectively, or to the people\n7. UCC 1-308: All rights reserved without prejudice. No action taken under this trust shall be construed as a waiver of any right\n\nThis Trust does not seek, require, or operate under any license, franchise, privilege, or permission from any federal, state, or local government. It is a private ecclesiastical trust operating in the private capacity of the parties hereto.' },
          { title: "Article IV. Governance Structure", content: 'The governance of this Trust follows the biblical pattern of the early church:\n\nTRUSTEE (Administrative Authority): {{entity.trusteeLabel}}\nThe Trustee serves as the administrative steward, responsible for the faithful execution of this Declaration. The Trustee holds legal title to all trust property and administers it according to the covenant purpose. The Trustee is accountable first to God, then to the Protector Council.\n\nPROTECTOR COUNCIL (Oversight & Accountability): {{entity.protectorLabel}}\nThe Protector Council serves in the role of the elder body (presbyterion), providing oversight, counsel, and correction (1 Timothy 5:17, Titus 1:5-9). The Protector Council has authority to:\n• Remove and replace the Trustee for cause (violation of the covenant purpose)\n• Approve or veto distributions exceeding established thresholds\n• Approve amendments to this Declaration (requires unanimous consent)\n• Ensure all operations align with Scripture and the covenant purpose\n\nECCLESIASTICAL OFFICES:\nThe Trust recognizes the five-fold ministry gifts (Ephesians 4:11) and the offices of elder and deacon as the governing structure for all spiritual and operational matters. Appointment to these offices follows the qualifications set forth in 1 Timothy 3:1-13 and Titus 1:5-9.' },
          { title: "Article V. Trust Property & Stewardship", content: '{{entity.description}}\n\nAll property conveyed to or acquired by this Trust is held in trust, not owned in the commercial or statutory sense, but stewarded for the benefit of the covenant community.\n\nThe trust corpus includes but is not limited to: real property, personal property, intellectual property, labor contributions, tithes, offerings, and all increase thereof.\n\nNo Beneficiary has any legal or equitable ownership interest in any specific trust asset. Beneficial interest is:\n• Non-transferable: it cannot be sold, traded, pledged, or hypothecated\n• Non-attachable: it cannot be seized, garnished, or levied upon by any creditor\n• Contingent upon active covenant participation and good standing\n• Equal among all members (1 Beneficial Unit per member, representing 1/N of the corpus)' },
          { title: "Article VI. Sub-Trusts & Authorized Entities", content: 'This Declaration authorizes the creation of subordinate trusts, Private Membership Associations, chapters, communes, guilds, and other entities as necessary to fulfill the covenant purpose. Each subordinate entity derives its authority from this Declaration and is bound by its terms.\n\nAuthorized entities:\n\n{{children.list}}\n\nEach sub-trust or entity shall maintain its own governing instrument, consistent with this Declaration, and shall report to the governance structure established herein.' },
          { title: "Article VII. Non-Statutory Character", content: 'This Trust expressly disclaims any statutory identity. It is NOT:\n• A corporation, LLC, partnership, or any statutory business entity\n• A 501(c)(3) organization or any entity organized under the Internal Revenue Code\n• A public charity, private foundation, or any entity requiring governmental approval\n• A commercial enterprise seeking profit or engaging in commerce as defined by the UCC\n\nThis Trust IS:\n• A private, irrevocable, express trust under common law\n• An ecclesiastical body organized under divine law and the right of free association\n• A non-statutory entity existing in the private capacity of its parties\n• A covenant community following the pattern of the early church (Acts 2:42-47)\n\nAny attempt by any governmental body to classify, regulate, license, tax, or otherwise assert jurisdiction over the private affairs of this Trust is hereby rejected as an unconstitutional infringement of the rights reserved to the People.' },
          { title: "Article VIII. Irrevocability & Duration", content: 'This Trust is IRREVOCABLE. The Grantor made the grant by accepting the New Covenant — and cannot un-accept. The granting act of acceptance is final and permanent: "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62). The Grantor has permanently divested all right, title, and interest in the trust corpus by the act of accepting the New Covenant and has no power to alter, amend, revoke, or terminate this Trust. As the New Covenant itself is the eternal Trust Instrument established by God and sealed by the blood of Christ (Hebrews 13:20), neither the instrument nor the grant made under it can be revoked by any human act.\n\nThis Trust shall continue in perpetuity, or for the maximum period allowed by the applicable rule against perpetuities, whichever is longer. In jurisdictions that have abolished the rule against perpetuities, this Trust shall continue forever.\n\nAmendments to this Declaration (other than revocation, which is prohibited) require:\n• Unanimous written consent of the Protector Council\n• Written approval of the Trustee\n• Consistency with the covenant purpose and Scripture\n\n{{entity.notes}}' },
          { title: "Article IX. Dispute Resolution", content: 'All disputes arising under this Trust shall be resolved according to the Matthew 18 Protocol:\n\n1. PRIVATE CONFERENCE: The aggrieved party shall approach the other party privately (Matthew 18:15)\n2. WITNESSES: If unresolved, bring one or two witnesses (Matthew 18:16)\n3. ELDER COUNCIL: If still unresolved, bring the matter before the Protector Council sitting as an elder tribunal (Matthew 18:17)\n4. BINDING ARBITRATION: The decision of the elder tribunal is final and binding on all parties\n\nNo party to this Trust shall bring any dispute before a civil court without first exhausting the above process (1 Corinthians 6:1-8). All parties consent to binding ecclesiastical arbitration.' },
          { title: "Article X. Subrogation of Rights to Jesus Christ", content: 'SUBROGATION AND CONVEYANCE TO THE REDEEMER:\n\nThe Grantor\'s acceptance of the New Covenant simultaneously subrogates all rights, claims, and causes of action to Jesus Christ as Redeemer and Subrogee. The granting act — by which the individual accepted the pre-existing Trust Instrument and became the Grantor — inherently and simultaneously conveys all rights to Christ, who as Testator, Mediator, and High Priest (Hebrews 9:15-17, 7:24-25, 12:24) holds supreme title. Christ, having paid the full price of redemption (1 Corinthians 6:20), stands in the place of the Grantor for all purposes, legal, equitable, spiritual, and temporal.\n\nAll rights, titles, interests, and claims of every kind, whether known or unknown, contingent or vested, present or future, in law or in equity, are hereby conveyed, transferred, and assigned to Christ as Head of the Body (Ephesians 1:22-23, Colossians 1:18). The Grantor retains no right, title, or interest in his own name, but holds and exercises all things as a steward and fiduciary of Christ.\n\nUNIVERSAL CONVEYANCE:\nThis conveyance includes but is not limited to: all real and personal property, all choses in action, all claims and causes of action whether at law or in equity, all contractual rights and obligations, all intellectual property, all labor and the fruits thereof, all accounts receivable and payable, all interests in estates, trusts, partnerships, and entities of every kind, all governmental entitlements and benefits, and all other property and rights of every nature and description whatsoever.\n\nThe Grantor acknowledges that this subrogation is not a future event but a present reality, effected at the moment of accepting the New Covenant, accomplished at the cross and applied through baptism into Christ\'s death (Romans 6:3-4). Christ is the true owner; the Grantor is the steward. This relationship is irrevocable and eternal — as irrevocable as the granting act of acceptance itself.\n\nNo third party may assert any claim against the Grantor or the trust corpus without first addressing the Subrogee, Jesus Christ, who holds superior title by right of redemption (1 Peter 1:18-19).' },
          { title: "Article XI. Totality of Agreement", content: 'SUPERSESSION:\nThe New Covenant, as the Trust Instrument, supersedes all prior agreements, covenants, contracts, and undertakings of the Grantor, whether written or oral, express or implied, voluntary or involuntary, known or unknown, to the extent that any such prior agreement is inconsistent with the terms, purpose, and identity established herein. The Grantor\'s acceptance of the New Covenant — the granting act — displaced all prior arrangements arising from the Grantor\'s former identity and status. In that He saith a new covenant He hath made the first old (Hebrews 8:13). The New Covenant as Trust Instrument is supreme and final, and by accepting it, the Grantor submitted all prior obligations to its authority.\n\nINTEGRATION:\nThe New Covenant itself, as set forth in the Holy Scriptures, IS the Trust Instrument and constitutes the foundational agreement. This Declaration is the formal memorialization of the Grantor\'s acceptance of that pre-existing Trust Instrument. Together, they constitute the entire agreement between the parties: the Grantor, the Trustee, the Protector Council, and Almighty God as Architect and ultimate Sovereign, with Christ as Testator and Mediator and the Holy Spirit as Executor. No prior representation, promise, agreement, or understanding not expressly set forth or incorporated herein shall be binding upon any party.\n\nSEVERABILITY:\nIf any provision of this Declaration is held invalid, unenforceable, or contrary to law by any tribunal of any jurisdiction, the remaining provisions shall continue in full force and effect, as the parties intend each provision to be independent and separable. No invalidity of any single provision shall affect the validity of this Declaration as a whole, nor shall any ruling by any civil tribunal operate to alter the covenant character of this instrument or the underlying Trust Instrument (the New Covenant) upon which it rests.' },
          { title: "Article XII. De-facto Nature of Worldly Systems", content: 'RECOGNITION AND DECLARATION:\nThe parties to this Trust recognize and declare that all civil, governmental, and commercial systems of the world operate as de facto authorities; that is, they exercise power in fact but not by ultimate right. Their authority exists by the permissive will of God (Romans 13:1-7) but is not the de jure sovereign authority, which belongs to the Kingdom of God alone.\n\nDE JURE AUTHORITY:\nThe de jure authority (authority by right) belongs to the Kingdom of God, administered through the New Covenant, and exercised by Jesus Christ as King of kings and Lord of lords (1 Timothy 6:15, Revelation 19:16). All earthly governments, courts, and institutions exercise delegated and temporary authority that is subject to the supreme authority of God.\n\nNO SUBMISSION BY PARTICIPATION:\nNo action taken within any de facto system (including but not limited to the use of civil courts, government-issued identification, banking systems, postal services, or any other instrumentality of civil government) shall be construed as submission to its jurisdiction, acknowledgment of its sovereignty, waiver of any right held under this Trust, or consent to be governed by any authority other than the New Covenant. Render unto Caesar the things which are Caesar\'s, and unto God the things that are God\'s (Matthew 22:21).\n\nThe parties engage with de facto systems as a matter of practical necessity and prudent stewardship, not as an act of allegiance or jurisdictional submission. All such engagement is undertaken with full reservation of rights under UCC 1-308 and under the sovereign authority of the New Covenant.' },
          { title: "Signatures & Attestation", content: 'IN WITNESS WHEREOF, the Grantor, having accepted the New Covenant and thereby executed the granting act, does hereby memorialize this Declaration of Trust on the date first written above, with full knowledge of its irrevocable nature and covenant obligations.\n\nGRANTOR / SETTLOR:\n(Having accepted the New Covenant and thereby executed the granting act)\n\n____________________________________\nDate: _______________\n\nTRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nWITNESS:\n____________________________________\nDate: _______________\n\nNOTARY (Optional: for recording purposes only; this Trust does not require notarization to be valid under common law):\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 2. TRUST ADMINISTRATION AGREEMENT: Body of Christ
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Trust Administration Agreement",
        description: "Body of Christ: the collective Body within which all stewardship, assembly, and community life takes place",
        layers: ["body"],
        sections: [
          { title: "Scripture Preamble", content: '"And all that believed were together, and had all things common; And sold their possessions and goods, and parted them to all men, as every man had need."\n— Acts 2:44-45\n\n"Moreover it is required in stewards, that a man be found faithful."\n— 1 Corinthians 4:2\n\n"And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also."\n— 2 Timothy 2:2' },
          { title: "Recitals", content: 'WHEREAS, the root charter "{{root.name}}" has been duly established as an irrevocable express trust under common law;\n\nWHEREAS, the governance of the trust ecosystem requires a dedicated administrative instrument to coordinate operations, stewardship, and accountability;\n\nWHEREAS, the early church in Jerusalem appointed deacons specifically for administrative duties so that the apostles could devote themselves to prayer and the ministry of the Word (Acts 6:1-7);\n\nWHEREAS, this Trust Administration Agreement is executed on {{date}} by authority delegated from {{parent.names}}, and derives all its power from the root charter;\n\nNOW, THEREFORE, this instrument establishes "{{entity.name}}" as the Body of Christ: the collective within which all stewardship and assembly takes place.' },
          { title: "Article I. Mission & Covenant Charter", content: '{{entity.charter}}\n\nThis administrative trust exists to faithfully execute the vision of the root charter through:\n• Coordinating all stewardship organs, assemblies, regions, households, crafts, and ministries\n• Managing the treasury and financial stewardship of the entire ecosystem\n• Ensuring accountability and transparency in all operations\n• Maintaining records, minutes, and documentation of all trust affairs\n• Facilitating communication and coordination between all entities' },
          { title: "Article II. Authority & Derivation", content: 'This trust derives its authority through the following chain:\n\n{{authority.chain}}\n\nParent authority: {{parent.names}}\n\n{{entity.legalBasis}}\n\nThis trust has no independent authority beyond what is delegated by the root charter. It serves as an instrument of administration, not a source of sovereignty. All authority flows from the New Covenant (the Trust Instrument) and the Grantor\'s original granting act — the acceptance of the New Covenant by faith, confession, and baptism, which constitutes the irrevocable deposit of the old man, the body, and all property into the trust.' },
          { title: "Article III. Governance & Officers", content: 'ADMINISTRATIVE TRUSTEE: {{entity.trusteeLabel}}\nThe Administrative Trustee bears fiduciary responsibility for the day-to-day operations of the trust ecosystem. This includes financial management, record-keeping, correspondence, and coordination of all subordinate entities.\n\nPROTECTOR / OVERSIGHT: {{entity.protectorLabel}}\nThe Protector provides check-and-balance oversight consistent with the elder body pattern. No major distribution, acquisition, or policy change may proceed without Protector approval.\n\nELDER COUNCIL: All ecclesiastical decisions are subject to the elder council, whose authority derives from Scripture (1 Timothy 5:17, Hebrews 13:17).\n\nPastoral oversight: {{shepherds.sources}}\nTeaching authority: {{teaches.sources}}\nDiaconal service: {{serves.sources}}' },
          { title: "Article IV. Scope of Operations", content: '{{entity.description}}\n\nThis trust administers the following entities:\n\n{{children.list}}\n\nOversight responsibilities:\n\n{{oversight.targets}}\n\nCoordination responsibilities:\n\n{{coordination.targets}}' },
          { title: "Article V. Financial Stewardship", content: 'All financial operations follow the storehouse principle (Malachi 3:10): tithes and offerings flow into the central trust for redistribution according to need.\n\nFunding sources:\n{{funding.sources}}\n\nFunding targets:\n{{funding.targets}}\n\nTithe flows:\n{{tithe.sources}}\n\nDistribution to:\n{{tithe.targets}}\n\nAll financial transactions shall be:\n• Recorded in transparent, accessible records\n• Approved according to the governance thresholds established by the Protector Council\n• Audited annually by a committee of at least three members in good standing\n• Used exclusively for the covenant purpose, never for private inurement' },
          { title: "Article VI. Beneficiaries", content: 'The beneficiaries of this trust are all covenant members in good standing:\n\n{{beneficiaries.list}}\n\nBeneficial interest is administered through the Beneficial Unit system, wherein each member holds an equal, undivided interest (1/N) in the trust corpus. This interest is:\n• Non-transferable and non-attachable\n• Contingent on active participation and covenant compliance\n• Administered by the Trustee for the common benefit of all' },
          { title: "Article VII. Additional Provisions", content: '{{entity.notes}}\n\nSEVERABILITY: If any provision of this Agreement is held invalid, the remaining provisions shall remain in full force.\n\nGOVERNING LAW: This Agreement is governed by common law trust principles, divine law, and natural law, not by any statutory code.\n\nENTIRE AGREEMENT: This instrument, together with the root charter, constitutes the entire agreement between the parties.' },
          { title: "Signatures & Attestation", content: 'IN WITNESS WHEREOF, the parties have executed this Trust Administration Agreement on {{date}}.\n\nADMINISTRATIVE TRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR / OVERSIGHT:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nWITNESS:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 3. SUB-TRUST DECLARATION. Stewardship Organs
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Sub-Trust Declaration",
        description: "Declaration for stewardship organs: land, housing, treasury, enterprise stewardship within the Body",
        layers: ["stewardship"],
        sections: [
          { title: "Scripture Preamble", content: '"He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much. If therefore ye have not been faithful in the unrighteous mammon, who will commit to your trust the true riches?"\n— Luke 16:10-11\n\n"The silver is mine, and the gold is mine, saith the LORD of hosts."\n— Haggai 2:8' },
          { title: "Recitals", content: 'WHEREAS, the root charter "{{root.name}}" and its administrative arm have authorized the creation of specialized stewardship organs for specific stewardship functions;\n\nWHEREAS, this Sub-Trust is created to fulfill a specific operational mandate within the broader trust ecosystem;\n\nWHEREAS, this instrument is executed on {{date}} under the delegated authority of {{parent.names}};\n\nNOW, THEREFORE, this Sub-Trust Declaration establishes "{{entity.name}}" as a subordinate express trust within the ecosystem.' },
          { title: "Article I. Purpose & Operational Mandate", content: '{{entity.charter}}\n\nThis Sub-Trust is established for the specific operational purpose described above and shall not exceed the scope of its mandate without written authorization from the parent authority.' },
          { title: "Article II. Authority & Chain of Trust", content: 'Authority chain: {{authority.chain}}\n\nParent authority: {{parent.names}}\n\n{{entity.legalBasis}}\n\nThis Sub-Trust is a creature of the root charter. It has no independent existence apart from the ecosystem and may be dissolved or restructured by the parent authority at any time, consistent with the covenant purpose. All authority flows from the New Covenant (the Trust Instrument) and the Grantor\'s original granting act — the acceptance of the New Covenant by faith, confession, and baptism.' },
          { title: "Article III. Scope of Operations", content: '{{entity.description}}\n\nLand stewardship responsibilities:\n{{land.stewardship}}\n\nEntities under coordination:\n{{coordination.targets}}' },
          { title: "Article IV. Governance", content: 'TRUSTEE: {{entity.trusteeLabel}}\nThe Sub-Trust Trustee administers the specific trust corpus assigned to this sub-trust. The Trustee reports to the parent trust and is accountable to the Protector Council.\n\nOVERSIGHT: {{entity.protectorLabel}}\nOversight is provided by the designated protector and ultimately by the elder council of the root charter.\n\nAuthority derived from: {{parent.names}}\n\nPastoral oversight: {{shepherds.sources}}\nDiaconal service: {{serves.sources}}' },
          { title: "Article V. Beneficiaries", content: 'Assets held by this Sub-Trust are stewarded for the benefit of the following:\n\n{{beneficiaries.list}}\n\nBenefit flows:\n{{benefit.sources}}\n\nAll beneficial interests are administered through the parent trust\'s Beneficial Unit system. No Sub-Trust beneficiary holds direct legal title to any trust asset.' },
          { title: "Article VI. Financial Provisions", content: 'Funding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}\n\nTithe flows: {{tithe.sources}}\nRemittances: {{remits.targets}}\n\nAll financial transactions within this Sub-Trust are subject to:\n• The financial stewardship policies of the parent trust\n• Annual accounting and transparency requirements\n• Approval thresholds established by the Protector Council\n\n{{entity.notes}}' },
          { title: "Article VII. Non-Statutory Character", content: 'This Sub-Trust shares the non-statutory character of the root charter. It is not a corporation, LLC, partnership, or any statutory entity. It is a private express trust under common law, operating in the private capacity of its parties.\n\nNo governmental license, registration, or approval is required or sought for the operation of this Sub-Trust.' },
          { title: "Signatures & Attestation", content: 'Executed on {{date}} under the authority of the parent trust.\n\nSUB-TRUST TRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nOVERSIGHT / PROTECTOR:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nPARENT TRUST AUTHORIZATION:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 4. PMA AGREEMENT. Private Membership Association
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "PMA Agreement",
        description: "Private Membership Association: voluntary assembly under ecclesia covenant, the gathered assembly within the Body",
        layers: ["assembly"],
        sections: [
          { title: "Scripture Preamble", content: '"For where two or three are gathered together in my name, there am I in the midst of them."\n— Matthew 18:20\n\n"And I say also unto thee, That thou art Peter, and upon this rock I will build my church [ecclesia]; and the gates of hell shall not prevail against it. And I will give unto thee the keys of the kingdom of heaven."\n— Matthew 16:18-19\n\n"Stand fast therefore in the liberty wherewith Christ hath made us free, and be not entangled again with the yoke of bondage."\n— Galatians 5:1' },
          { title: "Recitals & Constitutional Foundation", content: 'WHEREAS, the right of the People to freely associate for lawful purposes is an inalienable right, antecedent to the Constitution, recognized and protected (but not granted) by the First Amendment;\n\nWHEREAS, the Supreme Court has affirmed the right of private associations to govern their own affairs (Boy Scouts of America v. Dale, 530 U.S. 640 (2000); Roberts v. U.S. Jaycees, 468 U.S. 609 (1984));\n\nWHEREAS, a Private Membership Association (PMA) is not a statutory entity, is not subject to regulatory jurisdiction intended for public or commercial entities, and operates in the private domain;\n\nWHEREAS, the early church (ecclesia) was a voluntary assembly of believers, not a state-chartered institution, governed by its own internal discipline (Matthew 18:15-20, 1 Corinthians 5, Acts 15);\n\nWHEREAS, this PMA Agreement is established on {{date}} under the authority of {{parent.names}}, rooted in {{root.name}};\n\nNOW, THEREFORE, the undersigned parties voluntarily enter into this Private Membership Association Agreement.' },
          { title: "Article I. Name & Purpose", content: 'This Private Membership Association shall be known as "{{entity.name}}".\n\n{{entity.charter}}\n\nThis PMA exists as the "gathered assembly" of the trust ecosystem: the voluntary assembly through which members participate in community life, governance, ministry, and the beneficial enjoyment of trust assets.' },
          { title: "Article II. Legal Foundation & Private Character", content: '{{entity.legalBasis}}\n\nThis PMA is a PRIVATE association. It is:\n• NOT a public accommodation or place of public resort\n• NOT subject to regulatory jurisdiction over commercial or public entities\n• NOT a 501(c)(3) or any tax-exempt entity under the Internal Revenue Code\n• NOT a corporation, LLC, or statutory business organization\n\nThis PMA IS:\n• A voluntary assembly of private individuals exercising their constitutional right of free association\n• An ecclesia: a "called out" assembly in the biblical sense (Matthew 16:18, Acts 7:38)\n• A private body governed exclusively by this agreement, the root charter, and Scripture\n\nAll activities within this PMA are private, member-to-member transactions, not subject to public commercial regulation. No governmental body has jurisdiction over the private affairs of this association.' },
          { title: "Article III. Membership", content: '{{entity.description}}\n\nMEMBERSHIP REQUIREMENTS:\n• Voluntary written consent to this agreement\n• Acknowledgment of the covenant purpose and commitment to abide by it\n• Recommendation by at least one existing member in good standing\n• Approval by the PMA Administrator or elder body\n\nMEMBERSHIP IS:\n• Voluntary: no person may be compelled to join or remain\n• Private: the membership list is confidential and shall not be disclosed to any outside party\n• Equal: each member has one voice and one Beneficial Unit\n• Contingent: upon continued good standing and covenant compliance\n\nMEMBERSHIP TERMINATES BY:\n• Voluntary withdrawal at any time, with 30 days written notice\n• Covenant violation, after completion of the Matthew 18 discipline process\n• Death (beneficial interest does not pass to heirs; it reverts to the trust corpus)' },
          { title: "Article IV. Governance", content: 'PMA ADMINISTRATOR: {{entity.trusteeLabel}}\nThe Administrator serves as the day-to-day coordinator of PMA affairs, subject to the oversight of the elder body.\n\nOVERSIGHT BODY: {{entity.protectorLabel}}\n\nECCLESIASTICAL GOVERNANCE:\nThe PMA is governed according to the New Testament pattern:\n• ELDERS (presbyteroi): spiritual oversight, teaching, pastoral care (1 Timothy 3:1-7, Titus 1:5-9, 1 Peter 5:1-4)\n• DEACONS (diakonoi): practical service, administration, benevolence (1 Timothy 3:8-13, Acts 6:1-7)\n• FIVE-FOLD MINISTRY: apostles, prophets, evangelists, pastors, teachers (Ephesians 4:11-13)\n\nPastoral care: {{shepherds.sources}}\nTeaching: {{teaches.sources}}\nService: {{serves.sources}}\n\nAll governance decisions affecting the community require the counsel of the elder body. Major decisions require a supermajority (⅔) of the elder body.' },
          { title: "Article V. Community Structure", content: 'The following organizational units operate under this PMA:\n\n{{oversight.targets}}\n\nChildren entities:\n{{children.list}}\n\nCoordination:\n{{coordination.targets}}\n\nEach unit operates under its own charter, consistent with this agreement and the root charter.' },
          { title: "Article VI. Member Rights", content: 'Every member in good standing has the RIGHT to:\n\n1. BENEFICIAL USE: Use of trust assets as allocated by the governance structure, including housing, land, tools, equipment, and community resources\n2. PARTICIPATION: Voice and vote in community governance according to the established process\n3. MINISTRY: Exercise of spiritual gifts and calling within the community (1 Corinthians 12)\n4. EDUCATION: Access to all community educational programs, discipleship, and training\n5. BENEVOLENCE: Receive assistance in times of genuine need, as resources allow (Acts 2:45, Acts 4:34-35)\n6. DUE PROCESS: The Matthew 18 discipline process before any adverse action\n7. WITHDRAWAL: Voluntary departure at any time, without penalty to person or reputation\n8. PRIVACY: Protection of personal information from disclosure to outside parties\n9. CONSCIENCE: Freedom of conscience in matters not directly addressed by the covenant' },
          { title: "Article VII. Member Obligations", content: 'Every member voluntarily accepts the OBLIGATION to:\n\n1. COVENANT FIDELITY: Abide by the covenant charter and this agreement in all community dealings\n2. STEWARDSHIP: Contribute labor, skills, time, or resources as agreed upon with the governance body\n3. TITHING: Contribute to the common treasury according to biblical principle (Malachi 3:10) and personal conviction\n4. RESPECT: Honor the governance structure and submit to the elder body in matters of community discipline (Hebrews 13:17)\n5. PRIVACY: Maintain the private character of the association; not disclose membership, internal affairs, or proprietary information to outside parties\n6. PEACE: Pursue reconciliation through the Matthew 18 process, not through civil litigation (1 Corinthians 6:1-8)\n7. GROWTH: Pursue personal spiritual growth and contribute to the edification of the body (Ephesians 4:15-16)\n8. ACCOUNTABILITY: Submit to transparent financial accountability and community standards' },
          { title: "Article VIII. Waiver & Hold Harmless", content: 'By executing this agreement, each member acknowledges and agrees that:\n\n• Membership in this PMA is entirely voluntary\n• The PMA is a private association, not a public entity, and does not offer public services\n• All activities within the PMA are private, member-to-member interactions\n• The member waives any claim of regulatory protection that applies to public commercial transactions\n• The member agrees to resolve all disputes through the internal Matthew 18 process\n• The member holds harmless the PMA, its officers, and fellow members from any claim arising from voluntary participation in community activities\n• This waiver is knowing, voluntary, and made with full understanding of its implications' },
          { title: "Article IX. Additional Provisions", content: '{{entity.notes}}\n\nSEVERABILITY: If any provision of this Agreement is held invalid by any tribunal, the remaining provisions shall remain in full force and effect.\n\nAMENDMENTS: This Agreement may be amended by a supermajority (⅔) vote of the elder body, with written notice to all members.\n\nENTIRE AGREEMENT: This Agreement, together with the root charter, constitutes the entire agreement between the member and the PMA.' },
          { title: "Signatures & Attestation", content: 'I, the undersigned, being of sound mind and acting of my own free will, do hereby voluntarily enter into this Private Membership Association Agreement. I have read and understand all terms herein and agree to be bound by them.\n\nMEMBER:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nPMA ADMINISTRATOR:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nWITNESS / ELDER:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 5. CHAPTER CHARTER. Geographic Chapters
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Chapter Charter",
        description: "Charter for geographic chapters: local ecclesia following the Titus 1:5 pattern of elders in every city",
        layers: ["region"],
        sections: [
          { title: "Scripture Preamble", content: '"For this cause left I thee in Crete, that thou shouldest set in order the things that are wanting, and ordain elders in every city, as I had appointed thee."\n— Titus 1:5\n\n"Unto the angel of the church of Ephesus write... unto the angel of the church in Smyrna write... unto the angel of the church in Pergamos write..."\n— Revelation 2:1, 8, 12\n\nAs the early church established local assemblies in each city, so this chapter serves as the local expression of the covenant community.' },
          { title: "Recitals", content: 'WHEREAS, the root charter "{{root.name}}" and the PMA have authorized the establishment of geographic chapters to extend the covenant community into specific regions;\n\nWHEREAS, the biblical pattern for church governance is local: elders in every city (Titus 1:5), churches in every region (Revelation 2-3), and the house church model (Romans 16:5, Colossians 4:15);\n\nWHEREAS, this Chapter Charter is issued on {{date}}, authorized by {{parent.names}};\n\nNOW, THEREFORE, this Charter establishes "{{entity.name}}" as a geographic chapter within the trust ecosystem.' },
          { title: "Article I. Purpose & Mission", content: '{{entity.charter}}\n\nThis chapter serves as the local presence of the covenant community in its geographic area, providing:\n• Local worship, fellowship, and mutual edification\n• Pastoral care and elder governance at the local level\n• Coordination of local communes, projects, and ministry\n• Entry point for new members in the region\n• Land stewardship and local resource management' },
          { title: "Article II. Governance", content: 'CHAPTER STEWARD: {{entity.trusteeLabel}}\nThe Chapter Steward serves as the local administrative leader, appointed by and accountable to the parent trust governance.\n\nOVERSIGHT: {{entity.protectorLabel}}\n\nLOCAL ELDER BODY:\nEach chapter shall appoint local elders according to the qualifications of 1 Timothy 3:1-7 and Titus 1:5-9. The local elder body governs the spiritual affairs of the chapter.\n\nPastoral care provided by: {{shepherds.sources}}\nTeaching provided by: {{teaches.sources}}\nService coordination: {{serves.sources}}\n\nThe chapter elder body reports to the central Protector Council and operates within the authority delegated by the root charter.' },
          { title: "Article III. Geographic Scope & Location", content: '{{entity.description}}\n\nLocation: {{entity.location}}\n\nThis chapter has authority over community operations within its defined geographic area. Cross-chapter coordination is facilitated through guilds and the central administrative trust.' },
          { title: "Article IV. Sub-Units", content: 'The following units operate within this chapter:\n\n{{children.list}}\n\nOversight targets:\n{{oversight.targets}}\n\nLand stewardship:\n{{land.stewardship}}' },
          { title: "Article V. Financial Stewardship", content: 'Funding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}\nTithe flows: {{tithe.sources}}\nRemittances to parent: {{remits.targets}}\n\nThe chapter maintains transparent local accounts, subject to audit by the central administrative trust. A portion of all local tithes and offerings is remitted to the central storehouse per the established allocation formula.' },
          { title: "Article VI. Provisions", content: '{{entity.notes}}\n\nThis Chapter Charter is subordinate to and governed by the root charter and PMA Agreement. Any conflict between this Charter and the root documents shall be resolved in favor of the root documents.' },
          { title: "Signatures & Attestation", content: 'CHAPTER STEWARD:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nOVERSIGHT / PROTECTOR:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nPARENT TRUST AUTHORIZATION:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 6. COMMUNE OPERATING AGREEMENT
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Commune Operating Agreement",
        description: "Operating agreement for intentional communities: Acts 2 model of shared life, resources, and mission",
        layers: ["household"],
        sections: [
          { title: "Scripture Preamble", content: '"And they, continuing daily with one accord in the temple, and breaking bread from house to house, did eat their meat with gladness and singleness of heart, Praising God, and having favour with all the people. And the Lord added to the church daily such as should be saved."\n— Acts 2:46-47\n\n"And the multitude of them that believed were of one heart and of one soul: neither said any of them that ought of the things which he possessed was his own; but they had all things common."\n— Acts 4:32' },
          { title: "Recitals", content: 'WHEREAS, the early church in Jerusalem practiced intentional common life, sharing meals, resources, worship, and mutual care on a daily basis (Acts 2:42-47);\n\nWHEREAS, the monastic and intentional community traditions throughout church history have preserved this pattern of shared life;\n\nWHEREAS, this Commune Operating Agreement is issued on {{date}}, authorized by {{parent.names}}, within the chapter of {{entity.location}};\n\nNOW, THEREFORE, this Agreement establishes "{{entity.name}}" as an intentional community within the trust ecosystem.' },
          { title: "Article I. Purpose & Common Life", content: '{{entity.charter}}\n\nThis commune embodies the Acts 2 model of common life:\n• DAILY FELLOWSHIP: Breaking bread from house to house (Acts 2:46)\n• SHARED RESOURCES: All things held in common for the benefit of all (Acts 4:32)\n• MUTUAL CARE: Distribution according to need (Acts 2:45)\n• COMMON WORSHIP: Continuing daily with one accord (Acts 2:46)\n• SHARED LABOR: Each member contributing according to gifts and ability (1 Corinthians 12:4-7)\n• DISCIPLESHIP: Teaching and training in the faith (2 Timothy 2:2)' },
          { title: "Article II. Governance", content: 'COMMUNE STEWARD: {{entity.trusteeLabel}}\nThe Commune Steward coordinates daily operations, work assignments, and resource allocation.\n\nOVERSIGHT: {{entity.protectorLabel}}\n\nPastoral care: {{shepherds.sources}}\nTeaching: {{teaches.sources}}\nService: {{serves.sources}}\n\nAll major commune decisions are made by consensus of the adult members, with the elder body providing spiritual guidance and tiebreaking authority.' },
          { title: "Article III. Membership & Daily Life", content: '{{entity.description}}\n\nCommune membership requires:\n• Full PMA membership in good standing\n• A probationary period of at least 90 days\n• Written commitment to the commune covenant\n• Willingness to participate in shared labor, meals, and worship\n\nDaily life includes:\n• Morning devotion and prayer\n• Shared meals (at least one per day)\n• Assigned work responsibilities based on skills and commune needs\n• Weekly community meetings for planning and fellowship\n• Regular Sabbath rest and worship' },
          { title: "Article IV. Property & Resources", content: 'All commune property is held in trust through the parent sub-trust. No individual member holds title to commune assets.\n\nLand stewardship: {{land.stewardship}}\nFunding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}\n\nMembers may retain personal effects and a modest personal allowance as determined by the commune governance. All income-producing activity by members is contributed to the commune treasury for redistribution according to need.' },
          { title: "Article V. Sub-Units & Projects", content: 'Children entities:\n{{children.list}}\n\nCoordination:\n{{coordination.targets}}\n\nOversight:\n{{oversight.targets}}' },
          { title: "Article VI. Provisions", content: '{{entity.notes}}\n\nDEPARTURE: Any member may depart the commune voluntarily. Upon departure, the member takes their personal effects but has no claim to commune property or accumulated assets. The Beneficial Unit reverts to the trust corpus.\n\nDISCIPLINE: The Matthew 18 process governs all disputes. The commune elder body has authority to address issues of daily communal life.' },
          { title: "Signatures & Attestation", content: 'COMMUNE STEWARD:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nOVERSIGHT:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nPARENT CHAPTER AUTHORIZATION:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 7. GUILD CHARTER: Skill-Based Guilds
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Guild Charter",
        description: "Charter for skill-based guilds: Bezalel pattern of Spirit-filled craftsmanship across all chapters",
        layers: ["craft"],
        sections: [
          { title: "Scripture Preamble", content: '"And I have filled him with the spirit of God, in wisdom, and in understanding, and in knowledge, and in all manner of workmanship."\n— Exodus 31:3\n\n"Every wise hearted among you shall come, and make all that the LORD hath commanded."\n— Exodus 35:10\n\n"Whatsoever thy hand findeth to do, do it with thy might."\n— Ecclesiastes 9:10\n\nAs Bezalel and Oholiab were filled with the Spirit for skilled craftsmanship in building the Tabernacle, so each guild member exercises their God-given gifts and skills for the building up of the covenant community.' },
          { title: "Recitals", content: 'WHEREAS, the covenant community requires organized, cross-chapter coordination of specialized skills, trades, and expertise;\n\nWHEREAS, the biblical model includes both geographic organization (elders in every city) and functional organization (Levitical divisions, trade guilds of the ancient world);\n\nWHEREAS, this Guild Charter is issued on {{date}}, authorized by {{parent.names}};\n\nNOW, THEREFORE, this Charter establishes "{{entity.name}}" as a functional guild within the trust ecosystem.' },
          { title: "Article I. Purpose & Scope", content: '{{entity.charter}}\n\nThis guild exists to:\n• Organize and develop specialized skills and expertise for the benefit of the entire community\n• Provide training, apprenticeship, and mentorship in its domain\n• Coordinate cross-chapter deployment of skilled workers\n• Maintain standards of quality and craftsmanship\n• Preserve and transmit knowledge across generations\n• Serve the community through its specialized domain' },
          { title: "Article II. Cross-Chapter Authority", content: 'This guild operates across ALL chapters and geographic boundaries within the trust ecosystem. Members from any chapter may participate based on relevant skills, calling, and commitment.\n\nAuthority chain: {{authority.chain}}\nParent authority: {{parent.names}}\n\nThe guild does not replace or supersede chapter governance. Rather, it coordinates functional expertise across chapters. A guild member remains under the pastoral authority of their local chapter elder body.\n\nCross-chapter coordination:\n{{coordination.targets}}' },
          { title: "Article III. Governance", content: 'GUILD MASTER: {{entity.trusteeLabel}}\nThe Guild Master is appointed for expertise, character, and leadership ability in the guild\'s domain. The Guild Master coordinates guild activities, sets standards, and oversees training.\n\nOVERSIGHT: {{entity.protectorLabel}}\n\nTeaching/mentorship: {{teaches.targets}}\nService: {{serves.targets}}\n\nGUILD COUNCIL: The Guild Master is assisted by a council of senior guild members who help set standards, evaluate apprentices, and plan guild activities.' },
          { title: "Article IV. Membership & Apprenticeship", content: '{{entity.description}}\n\nGuild membership is organized in three tiers:\n\n1. APPRENTICE: Learning the trade under a master craftsman. Duration and requirements set by the Guild Council.\n2. JOURNEYMAN: Competent practitioner who can work independently. Confirmed by demonstration of skill before the Guild Council.\n3. MASTER: Expert practitioner who can train others. Elevated by the Guild Council after years of faithful service and demonstrated mastery.\n\nBeneficiaries:\n{{beneficiaries.list}}' },
          { title: "Article V. Financial Provisions", content: 'Funding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}\nTithe flows: {{tithe.sources}}\n\nGuild income (from products, services, or training) flows into the guild treasury, which is a sub-account of the parent trust. The guild retains operating funds and remits surplus to the central storehouse.\n\nRemittances: {{remits.targets}}' },
          { title: "Article VI. Provisions", content: '{{entity.notes}}\n\nINTELLECTUAL PROPERTY: All knowledge, techniques, designs, and innovations created within guild activities belong to the trust, not to individual members. The guild preserves and transmits this knowledge for the benefit of all.\n\nQUALITY STANDARDS: The Guild Council sets and enforces standards for all work produced under the guild\'s name.' },
          { title: "Signatures & Attestation", content: 'GUILD MASTER:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nOVERSIGHT:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nPARENT TRUST AUTHORIZATION:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 8. PROJECT AUTHORIZATION
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Project Authorization",
        description: "Authorization document for specific projects: Nehemiah pattern of organized, purposeful building",
        layers: ["ministry"],
        sections: [
          { title: "Scripture Preamble", content: '"Then I told them of the hand of my God which was good upon me... And they said, Let us rise up and build. So they strengthened their hands for this good work."\n— Nehemiah 2:18\n\n"For which of you, intending to build a tower, sitteth not down first, and counteth the cost, whether he have sufficient to finish it?"\n— Luke 14:28' },
          { title: "Recitals", content: 'WHEREAS, the covenant community has identified a specific need or opportunity that requires organized, time-bound effort;\n\nWHEREAS, this Project Authorization is issued on {{date}}, authorized by {{parent.names}};\n\nNOW, THEREFORE, this authorization establishes "{{entity.name}}" as an active project within the trust ecosystem.' },
          { title: "Article I. Scope & Deliverables", content: '{{entity.charter}}\n\n{{entity.description}}\n\nThis project operates under the Nehemiah principle: count the cost, organize the labor, build with purpose, and complete the work.' },
          { title: "Article II. Authority & Accountability", content: 'Authority chain: {{authority.chain}}\nParent authority: {{parent.names}}\n\nThis project is authorized for a specific scope and duration. Extension or expansion of scope requires written authorization from the parent authority.' },
          { title: "Article III. Governance", content: 'PROJECT LEAD: {{entity.trusteeLabel}}\nThe Project Lead is responsible for day-to-day coordination, resource management, and progress reporting.\n\nOVERSIGHT: {{entity.protectorLabel}}\n\nService teams: {{serves.targets}}\nCoordination: {{coordination.targets}}' },
          { title: "Article IV. Resources & Budget", content: 'Funding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}\n\nLand/property involved: {{land.stewardship}}\n\nAll project expenditures must be pre-approved according to the thresholds established by the parent trust. The Project Lead provides regular financial accounting to the parent trust.\n\n{{entity.notes}}' },
          { title: "Signatures & Attestation", content: 'PROJECT LEAD:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nOVERSIGHT:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nAUTHORIZING BODY:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 9. BENEFICIAL INTEREST DECLARATION
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Beneficial Interest Declaration",
        description: "Declaration of beneficial interest: joint-heir model, stewardship not ownership, spendthrift protections",
        layers: ["member"],
        sections: [
          { title: "Scripture Preamble", content: '"The earth is the LORD\'s, and the fulness thereof."\n— Psalm 24:1\n\n"The labourer is worthy of his reward."\n— 1 Timothy 5:18\n\n"And if children, then heirs; heirs of God, and joint-heirs with Christ."\n— Romans 8:17\n\n"Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over, shall men give into your bosom. For with the same measure that ye mete withal it shall be measured to you again."\n— Luke 6:38' },
          { title: "Recitals & Declaration", content: 'WHEREAS, the trust ecosystem is established on the principle that God is the ultimate owner of all property, and the community members are stewards, not owners (Psalm 24:1, 1 Chronicles 29:14);\n\nWHEREAS, the early church held all things in common, distributing to each according to need (Acts 2:44-45, Acts 4:32-35);\n\nWHEREAS, the concept of "beneficial interest" in trust law perfectly mirrors the biblical stewardship model: beneficial use without legal ownership;\n\nNOW, THEREFORE, this Beneficial Interest Declaration is issued on {{date}} for the members of the trust ecosystem rooted in {{root.name}}.\n\nAll members are hereby recognized as both BENEFICIARIES and STEWARDS: receiving from the community and giving back to it in a reciprocal covenant relationship.' },
          { title: "Article I. Nature of Beneficial Interest", content: '{{entity.charter}}\n\nEach member in good standing holds ONE (1) Beneficial Unit, representing an equal, undivided interest in the trust corpus. This is analogous to being "joint-heirs" (Romans 8:17); all share equally in the inheritance.\n\nThe Beneficial Unit represents:\n• The right to beneficial USE of trust assets as allocated by the governance structure\n• An EQUAL share (1/N, where N is the total number of members) in the trust corpus\n• A VOICE in community governance (one member, one voice)\n• ACCESS to community resources, programs, education, and benevolence\n\nThe Beneficial Unit does NOT represent:\n• Legal ownership of any specific trust asset\n• A marketable security or investment instrument\n• A claim against the trust that can be enforced in civil court\n• An interest that passes to heirs upon death' },
          { title: "Article II. Spendthrift Protections", content: 'The Beneficial Unit is protected by a SPENDTHRIFT PROVISION consistent with common law trust principles:\n\n1. NON-TRANSFERABLE: The Beneficial Unit cannot be sold, traded, gifted, pledged, hypothecated, or otherwise transferred to any party. It is personal to the member.\n\n2. NON-ATTACHABLE: No creditor, judgment holder, government agency, or other external party may attach, garnish, levy upon, or otherwise reach the Beneficial Unit or any distribution therefrom. The trust corpus is held for the benefit of the community, not as an asset of any individual member.\n\n3. NON-ASSIGNABLE: The member may not assign their Beneficial Unit or any rights thereunder to any third party.\n\n4. PROTECTED FROM DIVORCE: The Beneficial Unit is not marital property and is not subject to equitable distribution in any divorce proceeding. It belongs to the trust, not to the individual.\n\n5. PROTECTED FROM BANKRUPTCY: The Beneficial Unit is not an asset of the member\'s estate for bankruptcy purposes.\n\nThese protections exist because the member does not OWN the beneficial interest; they are merely the designated recipient of the trust\'s bounty, at the Trustee\'s discretion, according to the covenant purpose.' },
          { title: "Article III. Rights of Beneficiaries", content: 'Beneficial interest is derived from the following trust entities:\n\n{{benefit.sources}}\n\nRIGHTS:\n• Housing: Access to community housing as allocated\n• Food: Provision from community agricultural and food operations\n• Education: Full access to community educational programs\n• Healthcare: Access to community health and wellness resources\n• Ministry: Opportunity to exercise spiritual gifts within the community\n• Governance: Voice in community decisions through the established process\n• Benevolence: Assistance in times of genuine need\n• Sabbath: Rest from labor on the appointed day of rest' },
          { title: "Article IV. Obligations of Stewardship", content: 'The relationship between the community and its members is RECIPROCAL. Beneficial interest is contingent upon active stewardship participation:\n\n• LABOR: Contribute labor, skills, and time according to ability and assignment (2 Thessalonians 3:10)\n• TITHING: Contribute financially according to biblical principle and personal conviction\n• CHARACTER: Maintain conduct consistent with the covenant purpose\n• GROWTH: Pursue spiritual and personal growth through discipleship\n• SERVICE: Serve the community through the guild system, projects, or commune work assignments\n• ACCOUNTABILITY: Submit to the governance structure and the Matthew 18 discipline process\n\n"For even when we were with you, this we commanded you, that if any would not work, neither should he eat."\n— 2 Thessalonians 3:10\n\nThe Trustee may, with Protector approval, reduce or suspend distributions to members who fail to fulfill their stewardship obligations, after due process.' },
          { title: "Article V. Termination of Beneficial Interest", content: 'Beneficial interest terminates upon:\n\n1. VOLUNTARY WITHDRAWAL: The member may withdraw at any time. Upon withdrawal, the Beneficial Unit reverts to the trust corpus. The departing member takes their personal effects but has no claim to trust assets or accumulated distributions.\n\n2. COVENANT VIOLATION: After completion of the Matthew 18 discipline process, the elder body may revoke membership. The Beneficial Unit reverts to the trust corpus.\n\n3. DEATH: The Beneficial Unit does not pass to heirs. It reverts to the trust corpus for redistribution. (The community may, at its discretion, provide for the deceased member\'s family through the benevolence fund.)\n\n{{entity.notes}}' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 10. GENERIC TRUST ENTITY DOCUMENT
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Generic Trust Entity Document",
        description: "General-purpose document for any trust entity: basic framework with biblical foundations",
        layers: ["covenant", "body", "stewardship", "assembly", "region", "household", "craft", "ministry", "member"],
        sections: [
          { title: "Scripture Preamble", content: '"Commit thy works unto the LORD, and thy thoughts shall be established."\n— Proverbs 16:3' },
          { title: "Overview", content: 'This document is generated on {{date}} for "{{entity.name}}" within the trust ecosystem of {{root.name}}.\n\nAuthority chain: {{authority.chain}}\nParent authority: {{parent.names}}' },
          { title: "Purpose & Charter", content: '{{entity.charter}}\n\n{{entity.description}}' },
          { title: "Legal Foundation", content: '{{entity.legalBasis}}\n\nThis entity operates as part of a private, non-statutory trust ecosystem under common law, divine law, and the constitutional right of free association.' },
          { title: "Governance", content: 'Trustee / Steward: {{entity.trusteeLabel}}\nProtector / Oversight: {{entity.protectorLabel}}\n\nPastoral care: {{shepherds.sources}}\nTeaching: {{teaches.sources}}\nService: {{serves.sources}}' },
          { title: "Relationships", content: 'Children entities:\n{{children.list}}\n\nBeneficiaries:\n{{beneficiaries.list}}\n\nFunding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}\n\nOversight: {{oversight.targets}}\nCoordination: {{coordination.targets}}' },
          { title: "Additional Notes", content: '{{entity.notes}}' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 11. ECCLESIASTICAL OFFICE APPOINTMENT
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Ecclesiastical Office Appointment",
        description: "Appointment of elders, deacons, and five-fold ministry offices per 1 Timothy 3 and Ephesians 4:11",
        layers: ["covenant", "body", "assembly", "region", "household"],
        sections: [
          { title: "Scripture Preamble", content: '"And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers; For the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ."\n— Ephesians 4:11-12\n\n"This is a true saying, If a man desire the office of a bishop, he desireth a good work. A bishop then must be blameless, the husband of one wife, vigilant, sober, of good behaviour, given to hospitality, apt to teach."\n— 1 Timothy 3:1-2\n\n"The elders which are among you I exhort, who am also an elder, and a witness of the sufferings of Christ... Feed the flock of God which is among you, taking the oversight thereof, not by constraint, but willingly; not for filthy lucre, but of a ready mind."\n— 1 Peter 5:1-2' },
          { title: "Recitals", content: 'WHEREAS, the governance of the ecclesia is established by Scripture, not by human invention, and the offices of elder, deacon, and the five-fold ministry are divinely ordained (Ephesians 4:11, 1 Timothy 3:1-13, Titus 1:5-9);\n\nWHEREAS, the early church appointed leaders through prayer, fasting, and the laying on of hands (Acts 13:1-3, Acts 14:23, 1 Timothy 4:14);\n\nWHEREAS, the qualifications for office are set forth in Scripture and are non-negotiable; they reflect character, not mere competence;\n\nWHEREAS, the entity "{{entity.name}}" has identified a qualified individual for appointment to ecclesiastical office;\n\nNOW, THEREFORE, this Appointment is issued on {{date}} under the authority of {{parent.names}}.' },
          { title: "Article I. Office & Authority", content: '{{entity.charter}}\n\nThe appointed officer derives authority through the following chain:\n{{authority.chain}}\n\nThe nature of this office is SERVANT LEADERSHIP, not dominion:\n"But Jesus called them unto him, and said, Ye know that the princes of the Gentiles exercise dominion over them, and they that are great exercise authority upon them. But it shall not be so among you: but whosoever will be great among you, let him be your minister; And whosoever will be chief among you, let him be your servant.". Matthew 20:25-27' },
          { title: "Article II. Qualifications (Scriptural Standard)", content: 'FOR ELDERS / OVERSEERS (1 Timothy 3:1-7, Titus 1:5-9):\n• Blameless, husband of one wife, vigilant, sober, of good behaviour\n• Given to hospitality, apt to teach\n• Not given to wine, no striker, not greedy of filthy lucre\n• Patient, not a brawler, not covetous\n• One that ruleth well his own house\n• Not a novice\n• Must have a good report of them which are without\n\nFOR DEACONS (1 Timothy 3:8-13):\n• Grave, not doubletongued, not given to much wine, not greedy of filthy lucre\n• Holding the mystery of the faith in a pure conscience\n• First proved, then let them use the office of a deacon, being found blameless\n\nFOR FIVE-FOLD MINISTRY (Ephesians 4:11-13):\n• Apostle: sent ones, establishing and overseeing multiple communities\n• Prophet: hearing and speaking the counsel of God to the community\n• Evangelist: proclaiming the good news and bringing new members into the covenant\n• Pastor: shepherding and caring for the flock on a daily basis\n• Teacher: instructing in Scripture, doctrine, and practical application' },
          { title: "Article III. Duties & Responsibilities", content: '{{entity.description}}\n\nThe appointed officer shall:\n• Serve with humility, not lording authority over others (1 Peter 5:3)\n• Maintain the qualifications of the office at all times\n• Submit to the oversight of the Protector Council and fellow elders\n• Provide regular accounting of their stewardship\n• Maintain confidentiality of member matters\n• Pursue ongoing spiritual growth and doctrinal faithfulness\n\nPastoral responsibilities: {{shepherds.targets}}\nTeaching responsibilities: {{teaches.targets}}\nService responsibilities: {{serves.targets}}' },
          { title: "Article IV. Governance & Accountability", content: 'APPOINTED BY: {{entity.trusteeLabel}}\nACCOUNTABLE TO: {{entity.protectorLabel}}\n\nThe officer is accountable to:\n• God, first and foremost\n• The Protector Council / elder body\n• The covenant community\n\nThe officer may be removed for:\n• Failure to maintain the scriptural qualifications\n• Persistent covenant violation after the Matthew 18 process\n• Moral failure\n• Doctrinal deviation from the covenant purpose\n• Abuse of authority\n\nRemoval requires a supermajority (⅔) vote of the Protector Council after due investigation and the opportunity for the officer to respond.' },
          { title: "Article V. Provisions", content: '{{entity.notes}}\n\nCOMPENSATION: "Let the elders that rule well be counted worthy of double honour, especially they who labour in the word and doctrine. For the scripture saith, Thou shalt not muzzle the ox that treadeth out the corn. And, The labourer is worthy of his reward."\n— 1 Timothy 5:17-18\n\nThe community may provide material support to officers who serve full-time, according to the community\'s ability and the officer\'s need.' },
          { title: "Commissioning & Attestation", content: 'By the laying on of hands and the prayer of the elder body, the following individual is hereby appointed and commissioned to the office described herein:\n\nAPPOINTED OFFICER:\n____________________________________\nPrinted Name: ________________________\nOffice: ________________________\nDate: _______________\n\nAPPOINTING AUTHORITY:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nWITNESSING ELDER(S):\n____________________________________\nDate: _______________\n\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 12. MEMBER COVENANT AGREEMENT
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Member Covenant Agreement",
        description: "Formal memorialization of the individual\'s acceptance of the New Covenant — the granting act that makes them the Grantor — and their entry into the ecclesia with full understanding of rights and obligations",
        layers: ["assembly", "region", "household", "member"],
        sections: [
          { title: "Scripture Preamble", content: '"And they continued stedfastly in the apostles\' doctrine and fellowship, and in breaking of bread, and in prayers."\n— Acts 2:42\n\n"That which we have seen and heard declare we unto you, that ye also may have fellowship with us: and truly our fellowship is with the Father, and with his Son Jesus Christ."\n— 1 John 1:3\n\n"Bear ye one another\'s burdens, and so fulfil the law of Christ."\n— Galatians 6:2' },
          { title: "Recitals & Voluntary Declaration", content: 'WHEREAS, the undersigned individual (hereinafter "Member") has accepted the New Covenant — the pre-existing Trust Instrument established by God (Jeremiah 31:31-34, Hebrews 8:8-12) — and by that acceptance has become a Grantor, irrevocably depositing the old man, the body, and all property into the trust;\n\nWHEREAS, this Covenant Agreement is the formal memorialization of the Member\'s granting act — the acceptance of the New Covenant by faith, confession, and baptism — and the Member\'s voluntary entry into covenant fellowship with the community known as "{{entity.name}}", rooted in {{root.name}};\n\nWHEREAS, the Member understands that this is a PRIVATE association, not a public entity, and that membership flows from the granting act of accepting the New Covenant;\n\nWHEREAS, the Member has been instructed in the community\'s covenant purpose, governance structure, and operating principles, all of which derive from the New Covenant as Trust Instrument;\n\nNOW, THEREFORE, the Member, having accepted the New Covenant and thereby executed the granting act, being of sound mind and acting freely, enters into this Covenant Agreement on {{date}}.' },
          { title: "Article I. Confession of Faith & Purpose", content: '{{entity.charter}}\n\nBy entering this covenant, the Member affirms:\n• Belief in the God of Abraham, Isaac, and Jacob, and in Jesus Christ as Lord\n• Commitment to the authority of Scripture as the supreme rule of faith and practice\n• Desire to live in covenant community according to the pattern of the early church\n• Willingness to submit to the governance structure established in the root charter\n• Understanding that this community operates as a private, non-statutory ecclesia' },
          { title: "Article II. Rights Received", content: 'Upon execution of this agreement, the Member receives:\n\n1. ONE BENEFICIAL UNIT: An equal, undivided interest (1/N) in the trust corpus\n2. HOUSING: Access to community housing as available and allocated\n3. PROVISION: Participation in community food, resources, and support systems\n4. EDUCATION: Full access to educational programs, discipleship, and training\n5. MINISTRY: Opportunity to serve and exercise spiritual gifts\n6. GOVERNANCE: One voice in community decision-making through the established process\n7. BENEVOLENCE: Assistance in times of genuine need\n8. DUE PROCESS: Protection under the Matthew 18 discipline process\n9. PRIVACY: Protection of personal information from outside parties\n\nBenefit sources:\n{{benefit.sources}}' },
          { title: "Article III. Obligations Assumed", content: 'The Member voluntarily assumes the following obligations:\n\n1. COVENANT FIDELITY: To live according to the community\'s covenant charter\n2. STEWARDSHIP: To contribute labor, skills, and resources as agreed\n3. TITHING: To contribute financially according to conviction and ability\n4. SUBMISSION: To respect the elder body and governance structure (Hebrews 13:17)\n5. PEACE: To resolve disputes through the Matthew 18 process (1 Corinthians 6:1-8)\n6. PRIVACY: To protect the private nature of the association\n7. GROWTH: To pursue spiritual maturity through the community\'s discipleship process\n8. SERVICE: To serve the community through assigned or chosen roles\n\nTeaching received from: {{teaches.sources}}\nPastoral care from: {{shepherds.sources}}\nService through: {{serves.targets}}' },
          { title: "Article IV. Private Association Acknowledgment", content: 'The Member acknowledges and understands that:\n\n• This is a PRIVATE Membership Association, not a public entity\n• All interactions within the community are PRIVATE, member-to-member dealings\n• The community does not operate under any governmental license, franchise, or permission\n• The Member waives any claim of regulatory protection applicable to public commercial transactions\n• The Member agrees to binding ecclesiastical arbitration for all disputes\n• The community operates under common law trust principles, divine law, and the right of free association\n• The Member has no ownership interest in any specific trust asset; beneficial use is at the Trustee\'s discretion\n• All financial contributions to the community are irrevocable gifts to the trust, not investments' },
          { title: "Article V. Withdrawal & Departure", content: 'The Member may withdraw from the community at any time, for any reason, by providing 30 days written notice to the PMA Administrator.\n\nUpon withdrawal:\n• The Beneficial Unit reverts to the trust corpus\n• The Member takes their personal effects\n• The Member has NO claim to trust assets, accumulated distributions, or community property\n• The Member\'s obligations of privacy continue for one (1) year after departure\n• The community shall treat the departing member with dignity and love\n\n{{entity.notes}}' },
          { title: "Signatures & Attestation", content: 'I, the undersigned, have read this entire Covenant Agreement, understand its terms, and voluntarily enter into this covenant fellowship of my own free will.\n\nNEW MEMBER:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nSPONSORING MEMBER:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nPMA ADMINISTRATOR / ELDER:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nWITNESS:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 13. TITHE & OFFERING COVENANT
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Tithe & Offering Covenant",
        description: "Financial stewardship covenant: storehouse principle, Malachi 3:10, first-fruits, and communal treasury",
        layers: ["covenant", "body", "assembly", "region"],
        sections: [
          { title: "Scripture Preamble", content: '"Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it."\n— Malachi 3:10\n\n"Honour the LORD with thy substance, and with the firstfruits of all thine increase: So shall thy barns be filled with plenty, and thy presses shall burst out with new wine."\n— Proverbs 3:9-10\n\n"Upon the first day of the week let every one of you lay by him in store, as God hath prospered him."\n— 1 Corinthians 16:2\n\n"Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver."\n— 2 Corinthians 9:7' },
          { title: "Recitals", content: 'WHEREAS, the biblical principle of tithing predates the Mosaic Law (Genesis 14:20; Abraham tithed to Melchizedek) and continues as a covenant principle for the New Testament ecclesia;\n\nWHEREAS, the early church practiced radical generosity, selling possessions and distributing to all according to need (Acts 2:44-45, Acts 4:34-35);\n\nWHEREAS, the storehouse principle (Malachi 3:10) establishes that tithes and offerings flow into a central repository for redistribution;\n\nWHEREAS, all financial contributions to the trust are irrevocable gifts, not investments, loans, or purchases;\n\nWHEREAS, this Tithe & Offering Covenant is established on {{date}} within "{{entity.name}}", rooted in {{root.name}};\n\nNOW, THEREFORE, this Covenant establishes the financial stewardship framework for the trust ecosystem.' },
          { title: "Article I. The Storehouse Principle", content: '{{entity.charter}}\n\nThe trust operates on the STOREHOUSE PRINCIPLE:\n\n1. ALL tithes and offerings are brought into the central treasury (the "storehouse")\n2. The governance body distributes according to need (Acts 2:45)\n3. No individual enrichment; the trustee and officers serve without profit motive\n4. Complete transparency; all receipts and distributions are recorded and reported\n\nTithe flows into:\n{{tithe.targets}}\n\nTithe received from:\n{{tithe.sources}}\n\nFunding sources:\n{{funding.sources}}\n\nFunding targets:\n{{funding.targets}}' },
          { title: "Article II. Categories of Giving", content: 'The community recognizes three biblical categories of financial stewardship:\n\n1. THE TITHE (Ma\'aser). 10% of increase\n"And all the tithe of the land, whether of the seed of the land, or of the fruit of the tree, is the LORD\'s: it is holy unto the LORD.". Leviticus 27:30\n\nThe tithe is the baseline expectation for covenant members. It represents acknowledgment that all increase belongs to God and the community is the instrument of His provision.\n\n2. OFFERINGS (Terumah): Voluntary giving above the tithe\n"Every man shall give as he is able, according to the blessing of the LORD thy God which he hath given thee."\n— Deuteronomy 16:17\n\nOfferings are voluntary gifts given in response to specific needs, projects, or gratitude. They are in addition to the tithe.\n\n3. FIRST-FRUITS (Bikkurim): The first and best\n"Honour the LORD with thy substance, and with the firstfruits of all thine increase."\n— Proverbs 3:9\n\nFirst-fruits represent the principle of giving God the first and best, not the leftovers.' },
          { title: "Article III. Irrevocability of Contributions", content: 'All financial contributions to the trust (whether tithes, offerings, first-fruits, labor contributions, or property conveyances) are IRREVOCABLE GIFTS to the trust corpus.\n\nOnce given, contributions:\n• Cannot be reclaimed by the giver\n• Cannot be designated for the exclusive benefit of the giver or their family\n• Become part of the common trust corpus\n• Are distributed by the Trustee according to the covenant purpose and governance policies\n\nThis irrevocability is consistent with:\n• The Grantor\'s original granting act — by accepting the New Covenant, the Grantor irrevocably deposited all property into the trust; subsequent contributions flow from and are governed by the same irrevocable acceptance\n• Common law trust principles (once conveyed to the trust, the grantor has no further claim)\n• The early church model (Acts 5:1-11. Ananias and Sapphira\'s deception regarding their contribution)\n• The principle that "it is more blessed to give than to receive" (Acts 20:35)\n• The irrevocable nature of the granting act itself: "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62)' },
          { title: "Article IV. Distribution & Transparency", content: '{{entity.description}}\n\nThe treasury distributes funds according to the following priorities:\n\n1. DAILY BREAD: Provision for the basic needs of all members (food, shelter, clothing)\n2. MINISTRY SUPPORT: Support for officers and ministers who serve full-time (1 Timothy 5:17-18)\n3. BENEVOLENCE: Assistance for members in crisis or special need\n4. OPERATIONS: Maintenance and operation of community facilities and infrastructure\n5. GROWTH: Investment in new projects, land, equipment, and expansion\n6. RESERVE: Prudent reserves for future needs and emergencies\n\nAll distributions are:\n• Recorded in transparent, accessible records\n• Approved according to governance thresholds\n• Reported quarterly to the community\n• Audited annually by a committee of three members in good standing' },
          { title: "Article V. Governance & Accountability", content: 'TREASURY STEWARD: {{entity.trusteeLabel}}\nOVERSIGHT: {{entity.protectorLabel}}\n\nThe Treasury Steward manages day-to-day financial operations. The Protector Council approves all distributions above established thresholds.\n\nNo single individual may unilaterally authorize a major distribution. The principle of multiple witnesses applies: "In the mouth of two or three witnesses shall every word be established."\n— 2 Corinthians 13:1' },
          { title: "Article VI. Provisions", content: '{{entity.notes}}\n\nNO PRIVATE INUREMENT: No officer, trustee, protector, or member shall receive financial benefit from the trust beyond what is available to all members in similar circumstances. Officers who serve full-time may receive support, but this is provision for service, not profit.\n\nTAX STATUS: This trust does not seek 501(c)(3) status or any governmental tax classification. Contributions are made as private gifts under a private trust, not as charitable donations to a public charity.' },
          { title: "Signatures & Attestation", content: 'I, the undersigned, covenant to participate in the financial stewardship of the community according to the principles set forth herein.\n\nMEMBER:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nTREASURY STEWARD:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nELDER / WITNESS:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 14. LAND STEWARDSHIP DECLARATION
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Land Stewardship Declaration",
        description: "Land and property stewardship: the earth is the Lord's, allodial principles, community land trust model",
        layers: ["stewardship", "region", "household"],
        sections: [
          { title: "Scripture Preamble", content: '"The earth is the LORD\'s, and the fulness thereof; the world, and they that dwell therein."\n— Psalm 24:1\n\n"The land shall not be sold for ever: for the land is mine; for ye are strangers and sojourners with me."\n— Leviticus 25:23\n\n"And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth."\n— Genesis 1:28\n\n"The heaven, even the heavens, are the LORD\'s: but the earth hath he given to the children of men."\n— Psalm 115:16' },
          { title: "Recitals", content: 'WHEREAS, God is the ultimate owner of all land and property (Psalm 24:1, Leviticus 25:23), and human beings are appointed as stewards thereof;\n\nWHEREAS, the biblical model for land management includes the principles of Jubilee (Leviticus 25), Sabbath rest for the land (Leviticus 25:4), and inheritance for future generations;\n\nWHEREAS, land held in trust is protected from individual creditors, speculation, and loss, ensuring that the community\'s land base remains intact for perpetuity;\n\nWHEREAS, this Land Stewardship Declaration is issued on {{date}} under the authority of {{parent.names}};\n\nNOW, THEREFORE, this Declaration establishes the land stewardship framework for "{{entity.name}}" within the trust ecosystem of {{root.name}}.' },
          { title: "Article I. The Land Trust Principle", content: '{{entity.charter}}\n\nAll land and real property within the trust ecosystem is held in TRUST, never owned by any individual member. This follows the Leviticus 25:23 principle: "The land shall not be sold for ever: for the land is mine."\n\nLand stewardship properties:\n{{land.stewardship}}\n\nLocation: {{entity.location}}\n\nThe land trust model ensures that:\n• Land remains with the community in perpetuity\n• No individual can sell, mortgage, or encumber community land\n• Land use is governed by the covenant purpose, not by market forces\n• Future generations inherit the same land base' },
          { title: "Article II. Stewardship, Not Ownership", content: '{{entity.description}}\n\nMembers are assigned USE RIGHTS to specific parcels or improvements, but they do not hold title. This distinction is critical:\n\n• LEGAL TITLE is held by the Trust (through the Trustee)\n• EQUITABLE / BENEFICIAL USE is granted to members by assignment\n• Use rights are personal, non-transferable, and revocable\n• Improvements made by a member are contributed to the trust corpus\n\nThis is analogous to the Levitical model where each family was allotted land for use, but the land ultimately belonged to God and could not be permanently alienated from the tribe.' },
          { title: "Article III. Land Use Principles", content: 'All land within the trust ecosystem shall be managed according to biblical stewardship principles:\n\n1. SABBATH REST: The land shall rest every seventh year (Leviticus 25:4). Agricultural land shall follow crop rotation and rest cycles.\n\n2. JUBILEE PRINCIPLE: Every 50 years, all land assignments shall be reviewed and rebalanced to ensure equitable distribution and prevent accumulation.\n\n3. DOMINION WITH CARE: The community exercises dominion over the land (Genesis 1:28) through responsible agriculture, sustainable practices, and good stewardship.\n\n4. INHERITANCE: The land is held in trust for future generations. Current stewards are custodians, not consumers.\n\n5. NO SPECULATION: Land shall never be used for speculative profit. It is held for productive use and community benefit.\n\n6. NO ENCUMBRANCE: Trust land shall not be mortgaged, pledged, or encumbered without unanimous Protector Council approval and only when absolutely necessary for the covenant purpose.' },
          { title: "Article IV. Governance & Administration", content: 'LAND STEWARD: {{entity.trusteeLabel}}\nThe Land Steward manages day-to-day property operations, maintenance, and use assignments.\n\nOVERSIGHT: {{entity.protectorLabel}}\n\nParent authority: {{parent.names}}\n\nLand use decisions affecting multiple members or the community as a whole require elder body approval. Individual use assignments are made by the Land Steward with Protector oversight.' },
          { title: "Article V. Financial Provisions", content: 'Funding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}\n\nAll income generated from land operations (agriculture, timber, resources) flows into the trust treasury for redistribution according to the covenant purpose.\n\nRemittances: {{remits.targets}}\n\nProperty taxes, if any, are paid from the trust treasury. The trust may explore lawful exemptions available to ecclesiastical and charitable trusts.\n\n{{entity.notes}}' },
          { title: "Article VI. Environmental Stewardship", content: 'As stewards of God\'s creation, the community commits to:\n\n• Regenerative agricultural practices that restore rather than deplete the soil\n• Responsible water management and watershed protection\n• Preservation of native habitats and biodiversity where consistent with community use\n• Sustainable timber and resource management\n• Minimizing pollution and waste\n• Teaching and modeling environmental stewardship to the next generation\n\n"And the LORD God took the man, and put him into the garden of Eden to dress it and to keep it."\n— Genesis 2:15' },
          { title: "Signatures & Attestation", content: 'LAND STEWARD:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nOVERSIGHT / PROTECTOR:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nPARENT TRUST AUTHORIZATION:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 15. DISPUTE RESOLUTION PROTOCOL
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Dispute Resolution Protocol",
        description: "Matthew 18 dispute resolution: ecclesia jurisdiction, binding arbitration, no civil litigation between members",
        layers: ["covenant", "body", "assembly", "region", "household"],
        sections: [
          { title: "Scripture Foundation", content: '"Moreover if thy brother shall trespass against thee, go and tell him his fault between thee and him alone: if he shall hear thee, thou hast gained thy brother. But if he will not hear thee, then take with thee one or two more, that in the mouth of two or three witnesses every word may be established. And if he shall neglect to hear them, tell it unto the church: but if he neglect to hear the church, let him be unto thee as an heathen man and a publican."\n— Matthew 18:15-17\n\n"Dare any of you, having a matter against another, go to law before the unjust, and not before the saints? Do ye not know that the saints shall judge the world? and if the world shall be judged by you, are ye unworthy to judge the smallest matters?"\n— 1 Corinthians 6:1-2\n\n"If it be possible, as much as lieth in you, live peaceably with all men."\n— Romans 12:18\n\n"Brethren, if a man be overtaken in a fault, ye which are spiritual, restore such an one in the spirit of meekness; considering thyself, lest thou also be tempted."\n— Galatians 6:1' },
          { title: "Recitals & Jurisdiction", content: 'WHEREAS, the early church established its own internal discipline and dispute resolution (Matthew 18:15-20, 1 Corinthians 5-6, Acts 15);\n\nWHEREAS, Paul explicitly prohibited Christians from taking disputes before secular courts (1 Corinthians 6:1-8);\n\nWHEREAS, the trust ecosystem operates as a private ecclesia with its own jurisdiction over internal matters;\n\nWHEREAS, all members have voluntarily agreed to resolve disputes through this internal process as a condition of membership;\n\nNOW, THEREFORE, this Dispute Resolution Protocol is established on {{date}} for "{{entity.name}}" and all entities within the trust ecosystem of {{root.name}}.\n\nThis protocol has BINDING AUTHORITY over all members, officers, and entities within the trust ecosystem. By entering the covenant, each member consents to this process as the EXCLUSIVE means of dispute resolution.' },
          { title: "Article I. Guiding Principles", content: '{{entity.charter}}\n\nAll dispute resolution within the community is governed by these principles:\n\n1. RESTORATION, NOT PUNISHMENT: The goal is always to restore the offending brother or sister (Galatians 6:1, James 5:19-20)\n2. HUMILITY: All parties approach the process with meekness and self-examination (Matthew 7:3-5)\n3. TRUTH IN LOVE: Speaking the truth, but always in love (Ephesians 4:15)\n4. CONFIDENTIALITY: Matters are handled with the minimum number of people necessary at each stage\n5. DUE PROCESS: No adverse action without a fair hearing\n6. SCRIPTURAL AUTHORITY: All decisions are grounded in Scripture, not personal preference\n7. MULTIPLE WITNESSES: "In the mouth of two or three witnesses shall every word be established" (2 Corinthians 13:1)' },
          { title: "Article II. Stage One: Private Conference", content: '"Go and tell him his fault between thee and him alone."\n— Matthew 18:15\n\nSTEP 1: The aggrieved party approaches the other party PRIVATELY.\n• This is a one-on-one conversation, not a public accusation\n• The purpose is understanding, not winning\n• Both parties should come in prayer and humility\n• If the matter is resolved, it is FINISHED; it shall not be raised again or gossiped about\n\nTIMEFRAME: The private conference should occur within 14 days of the grievance arising.\n\nOUTCOME: If the brother hears, "thou hast gained thy brother"; the matter is resolved and no record is kept.' },
          { title: "Article III. Stage Two: Witnesses", content: '"Take with thee one or two more, that in the mouth of two or three witnesses every word may be established."\n— Matthew 18:16\n\nSTEP 2: If the private conference fails to resolve the matter, the aggrieved party brings one or two WITNESSES.\n• Witnesses should be mature, respected members of the community\n• Witnesses serve as mediators, not advocates for either side\n• The purpose is to help both parties hear each other and reach resolution\n• Witnesses may offer observations, counsel, and proposed solutions\n\nTIMEFRAME: Stage Two should occur within 14 days of the failed Stage One.\n\nOUTCOME: If resolved, the matter is closed. The witnesses provide written confirmation of the resolution.' },
          { title: "Article IV. Stage Three: Elder Tribunal", content: '"Tell it unto the church [ecclesia]."\n— Matthew 18:17\n\nSTEP 3: If Stage Two fails, the matter is brought before the Elder Tribunal.\n\nTHE TRIBUNAL:\n• Composed of at least three elders not personally involved in the dispute\n• Appointed by the Protector Council: {{entity.protectorLabel}}\n• The Tribunal hears testimony from both parties and witnesses\n• The Tribunal may request documents, records, and additional testimony\n• The Tribunal deliberates in private\n\nPROCEDURE:\n1. Written complaint filed with the Tribunal\n2. Respondent notified and given 14 days to prepare a written response\n3. Hearing scheduled within 30 days of the complaint\n4. Both parties may present testimony, witnesses, and documents\n5. Tribunal deliberates and issues a written decision within 14 days of the hearing\n\nTIMEFRAME: The entire Stage Three process should be completed within 60 days.\n\nThe Tribunal\'s decision is FINAL and BINDING on all parties within the trust ecosystem.' },
          { title: "Article V. Stage Four: Discipline & Separation", content: '"If he neglect to hear the church, let him be unto thee as an heathen man and a publican."\n— Matthew 18:17b\n\nSTEP 4: If the offending party refuses to submit to the Tribunal\'s decision, the following consequences may be imposed:\n\n1. FORMAL ADMONITION: A written warning recorded in the community minutes\n2. SUSPENSION: Temporary suspension of governance rights and/or certain community privileges\n3. PROBATION: A defined period of accountability and restoration requirements\n4. REMOVAL: Expulsion from the community as a last resort\n\nRemoval requires:\n• A supermajority (⅔) vote of the Elder Tribunal\n• Written notice to the member with specific grounds\n• 30 days for the member to appeal to the full Protector Council\n• If the appeal is denied, membership terminates and the Beneficial Unit reverts to the trust corpus\n\nEven in removal, the community acts with love: "Yet count him not as an enemy, but admonish him as a brother."\n— 2 Thessalonians 3:15' },
          { title: "Article VI. Prohibition on Civil Litigation", content: 'All members, by entering the covenant, agree that:\n\n1. NO CIVIL LAWSUITS: No member shall bring any claim, lawsuit, or legal action against another member, officer, or entity within the trust ecosystem in any civil court (1 Corinthians 6:1-8)\n\n2. EXCLUSIVE JURISDICTION: The Elder Tribunal has exclusive jurisdiction over all disputes between members\n\n3. BINDING ARBITRATION. The Tribunal\'s decision constitutes binding ecclesiastical arbitration, enforceable under the Federal Arbitration Act to the extent applicable\n\n4. WAIVER OF CIVIL REMEDIES: Members voluntarily waive their right to pursue civil remedies for disputes arising from community membership and activities\n\n5. EXCEPTION: This prohibition does not apply to matters involving:\n   • Criminal conduct reported to civil authorities (Romans 13:1-4)\n   • Disputes with parties outside the trust ecosystem\n   • Matters where civil law requires mandatory reporting' },
          { title: "Article VII. Provisions", content: '{{entity.notes}}\n\nANONYMITY IN RECORDS: Dispute resolution records shall use initials or case numbers rather than full names when possible, to protect the dignity of all parties.\n\nSTATUTE OF LIMITATIONS: Grievances should be raised within 180 days of the event giving rise to the dispute. The Tribunal may waive this limitation for good cause.\n\nCONFLICTS OF INTEREST: No elder may serve on a Tribunal if they have a personal interest in the outcome or a close relationship with either party.' },
          { title: "Acknowledgment & Signatures", content: 'By signing below, I acknowledge that I have read, understand, and voluntarily agree to be bound by this Dispute Resolution Protocol as a condition of my covenant membership.\n\nMEMBER:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nELDER / ADMINISTRATOR:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nWITNESS:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 16. QUIT CLAIM DEED: Conveyance of Property into Trust
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Quit Claim Deed to Trust",
        description: "Conveyance of real or personal property into the trust: irrevocable transfer of all right, title, and interest",
        layers: ["covenant", "body", "stewardship"],
        sections: [
          { title: "Scripture Preamble", content: '"The silver is mine, and the gold is mine, saith the LORD of hosts."\n— Haggai 2:8\n\n"For all things come of thee, and of thine own have we given thee."\n— 1 Chronicles 29:14\n\n"Sell that ye have, and give alms; provide yourselves bags which wax not old, a treasure in the heavens that faileth not, where no thief approacheth, neither moth corrupteth."\n— Luke 12:33' },
          { title: "Quit Claim Deed", content: 'KNOW ALL MEN BY THESE PRESENTS:\n\nThis Quit Claim Deed is executed on {{date}} by the undersigned Grantor — whose capacity as Grantor derives from the acceptance of the New Covenant, the pre-existing Trust Instrument established by God (Jeremiah 31:31-34, Hebrews 8:8-12), which acceptance constitutes the irrevocable granting act — in favor of "{{entity.name}}", an irrevocable express trust operating under common law.\n\nAuthority chain: {{authority.chain}}\n\nFOR AND IN CONSIDERATION of the covenant purpose, the mutual benefits of community membership, and the furtherance of the trust\'s ecclesiastical mission (and not for any commercial consideration), and in furtherance of the granting act by which the Grantor accepted the New Covenant and irrevocably deposited all property into the trust, the Grantor does hereby REMISE, RELEASE, AND FOREVER QUIT CLAIM unto the Trust, its Trustee(s), successors and assigns, the following described property:' },
          { title: "Property Description", content: '[DESCRIPTION OF PROPERTY TO BE CONVEYED]\n\n(Legal description for real property; detailed description for personal property, intellectual property, or other assets)\n\nTogether with all improvements, appurtenances, rights, privileges, and easements thereunto belonging or in anywise appertaining.' },
          { title: "Terms of Conveyance", content: 'TO HAVE AND TO HOLD the above-described property unto the Trust forever.\n\nThis conveyance is IRREVOCABLE, consistent with the irrevocable nature of the Grantor\'s acceptance of the New Covenant — the granting act from which all conveyances flow. The Grantor hereby:\n\n1. QUITS CLAIM all right, title, interest, claim, and demand in and to said property\n2. WARRANTS that the Grantor has the authority to convey this property, such authority deriving from the Grantor\'s acceptance of the New Covenant and the capacity thereby conferred\n3. ACKNOWLEDGES that this is a gift to the trust, not a sale, exchange, or commercial transaction, and that it flows from the original granting act of accepting the New Covenant\n4. UNDERSTANDS that upon conveyance, the property becomes part of the trust corpus and is administered by the Trustee for the benefit of all covenant members\n5. WAIVES any right to reclaim, reverse, or undo this conveyance, as the granting act itself is irrevocable: "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62)\n\n"For where your treasure is, there will your heart be also" (Matthew 6:21).\n\nThis deed is executed under common law. It is not a statutory conveyance and does not require recording to be valid between the parties, though recording may be done for notice purposes.' },
          { title: "Non-Statutory Declaration", content: 'This conveyance is a private transfer between private parties under a private trust. It is not a commercial transaction, not subject to transfer taxes designed for commercial conveyances, and not an event requiring governmental approval or licensing.\n\nThe trust receiving this property is not a corporation, LLC, or statutory entity. It is a private express trust under common law, established for ecclesiastical and charitable purposes.\n\n{{entity.legalBasis}}' },
          { title: "Acceptance by Trustee", content: 'The Trustee of "{{entity.name}}" hereby accepts this conveyance and agrees to hold and administer the above-described property in accordance with the Declaration of Trust and for the benefit of the covenant community.\n\nTrustee: {{entity.trusteeLabel}}\nProtector: {{entity.protectorLabel}}' },
          { title: "Signatures & Attestation", content: 'IN WITNESS WHEREOF, the Grantor — whose capacity derives from the acceptance of the New Covenant (the granting act) — has executed this Quit Claim Deed on the date first written above.\n\nGRANTOR:\n(Acting in the capacity conferred by acceptance of the New Covenant)\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nTRUSTEE (Accepting):\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nWITNESS:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nWITNESS:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nNOTARY (Optional: for recording purposes; this deed is valid under common law without notarization):\n\nState of _______________\nCounty of _______________\n\nBefore me, the undersigned notary, on this ____ day of __________, ______, personally appeared the above-named Grantor, known to me to be the person who executed the foregoing instrument, and acknowledged the same to be their free act and deed.\n\n____________________________________\nNotary Public\nMy Commission Expires: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 17. ASSIGNMENT OF PROPERTY TO TRUST
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Assignment of Property to Trust",
        description: "General assignment instrument for personal property, intellectual property, accounts, and intangible assets",
        layers: ["covenant", "body", "stewardship"],
        sections: [
          { title: "Scripture Preamble", content: '"Neither said any of them that ought of the things which he possessed was his own; but they had all things common."\n— Acts 4:32\n\n"Every good gift and every perfect gift is from above, and cometh down from the Father of lights."\n— James 1:17\n\n"Of thine own have we given thee."\n— 1 Chronicles 29:14' },
          { title: "Assignment", content: 'ASSIGNMENT OF PROPERTY TO TRUST\n\nThis Assignment is made on {{date}} by the undersigned Assignor in favor of "{{entity.name}}", an irrevocable express trust under common law.\n\nAuthority chain: {{authority.chain}}\n\nFOR AND IN CONSIDERATION of the covenant purpose and mutual benefits of community stewardship, the Assignor hereby ASSIGNS, TRANSFERS, CONVEYS, AND DELIVERS unto the Trust all right, title, and interest in the following described property:' },
          { title: "Schedule of Assigned Property", content: '[LIST ALL PROPERTY BEING ASSIGNED]\n\nCategories may include:\n\n1. PERSONAL PROPERTY: Equipment, tools, vehicles, livestock, inventory, furnishings\n2. INTELLECTUAL PROPERTY: Copyrights, trademarks, trade secrets, patents, domain names, software\n3. FINANCIAL ACCOUNTS: Bank accounts, investment accounts, receivables\n4. CONTRACTUAL RIGHTS: Leases, licenses, agreements, royalties\n5. DIGITAL ASSETS: Websites, social media accounts, digital content\n6. OTHER INTANGIBLE PROPERTY: Goodwill, permits, memberships\n\n(Attach additional schedule pages as needed)' },
          { title: "Terms of Assignment", content: 'This Assignment is:\n\n1. IRREVOCABLE: The Assignor permanently divests all interest in the assigned property\n2. UNCONDITIONAL: No conditions, reservations, or reversionary interests are retained\n3. COMPLETE: All rights, title, interest, and claims are transferred\n4. A GIFT: This is not a sale or commercial transaction; no monetary consideration is given\n\nThe Assignor warrants that:\n• They have the right and authority to assign this property\n• The property is free from liens, encumbrances, and adverse claims (except as disclosed)\n• They will execute any further documents necessary to perfect this assignment\n\n"Lay not up for yourselves treasures upon earth, where moth and rust doth corrupt, and where thieves break through and steal: But lay up for yourselves treasures in heaven" (Matthew 6:19-20).\n\n{{entity.notes}}' },
          { title: "Acceptance & Administration", content: 'The Trustee of "{{entity.name}}" hereby accepts this Assignment and agrees to hold and administer the assigned property as part of the trust corpus, for the benefit of the covenant community.\n\nTrustee: {{entity.trusteeLabel}}\nProtector: {{entity.protectorLabel}}\n\nThe assigned property shall be administered according to the Declaration of Trust and all subordinate governing instruments.' },
          { title: "Signatures & Attestation", content: 'ASSIGNOR:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nTRUSTEE (Accepting):\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nWITNESS:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 18. TRANSFER OF ASSETS BETWEEN TRUSTS
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Inter-Trust Transfer Agreement",
        description: "Transfer of assets between stewardship organs within the Body: treasury allocations, property reassignments",
        layers: ["body", "stewardship"],
        sections: [
          { title: "Scripture Preamble", content: '"And distribution was made unto every man according as he had need."\n— Acts 4:35\n\n"Let all things be done decently and in order."\n— 1 Corinthians 14:40\n\n"A faithful man shall abound with blessings."\n— Proverbs 28:20' },
          { title: "Transfer Agreement", content: 'INTER-TRUST TRANSFER AGREEMENT\n\nThis Agreement is executed on {{date}} between the following trusts within the ecosystem of {{root.name}}:\n\nTRANSFERRING TRUST: {{entity.name}}\nTrustee: {{entity.trusteeLabel}}\n\nRECEIVING TRUST: [Name of Receiving Trust]\nTrustee: [Receiving Trustee]\n\nAuthority chain: {{authority.chain}}\nParent authority: {{parent.names}}' },
          { title: "Property Being Transferred", content: 'The Transferring Trust hereby transfers the following assets to the Receiving Trust:\n\n[DETAILED DESCRIPTION OF ASSETS]\n\nEstimated value (for record-keeping): $____________\n\nFunding flow context:\nFunding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}' },
          { title: "Terms of Transfer", content: 'This transfer is:\n\n1. AUTHORIZED by the governance structure, specifically by {{entity.protectorLabel}}\n2. CONSISTENT with the covenant purpose of both trusts\n3. NOT A SALE: this is an internal reallocation of trust corpus within the same ecosystem\n4. DOCUMENTED: for transparency and accountability\n\nThe transfer is made pursuant to:\n• The root charter of {{root.name}}\n• The governance authority of the administrative trust\n• The specific authorization of the Protector Council\n\n"Moreover it is required in stewards, that a man be found faithful" (1 Corinthians 4:2).\n\nBoth Trustees confirm that this transfer serves the covenant purpose and does not constitute a distribution to any individual beneficiary.' },
          { title: "Governance Approval", content: 'This transfer has been approved by:\n\n☐ Trustee of Transferring Trust: {{entity.trusteeLabel}}\n☐ Trustee of Receiving Trust: [Name]\n☐ Protector Council: {{entity.protectorLabel}}\n☐ Administrative Trust (if required by governance thresholds)\n\n{{entity.notes}}' },
          { title: "Signatures", content: 'TRANSFERRING TRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nRECEIVING TRUSTEE:\n____________________________________\nDate: _______________\n\nPROTECTOR COUNCIL APPROVAL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 19. ACCEPTANCE OF TRUSTEESHIP
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Acceptance of Trusteeship",
        description: "Formal acceptance by a Trustee of fiduciary duties: oath of faithful stewardship",
        layers: ["covenant", "body", "stewardship", "assembly", "region", "household", "craft", "ministry"],
        sections: [
          { title: "Scripture Preamble", content: '"Moreover it is required in stewards, that a man be found faithful."\n— 1 Corinthians 4:2\n\n"His lord said unto him, Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things: enter thou into the joy of thy lord."\n— Matthew 25:21\n\n"Who then is a faithful and wise servant, whom his lord hath made ruler over his household, to give them meat in due season?"\n— Matthew 24:45' },
          { title: "Acceptance", content: 'ACCEPTANCE OF TRUSTEESHIP\n\nI, the undersigned, having been duly appointed as Trustee of "{{entity.name}}" within the trust ecosystem of {{root.name}}, do hereby formally ACCEPT the office of Trustee and all fiduciary duties, responsibilities, and obligations pertaining thereto.\n\nDate of acceptance: {{date}}\nAuthority chain: {{authority.chain}}\nAppointed by: {{entity.protectorLabel}}' },
          { title: "Oath of Faithful Stewardship", content: 'Before God and the covenant community, I solemnly affirm and covenant:\n\n1. FIDELITY: I will faithfully administer the trust corpus according to the Declaration of Trust, the covenant charter, and Scripture. "He that is faithful in that which is least is faithful also in much" (Luke 16:10).\n\n2. LOYALTY: I will act solely in the interest of the beneficiaries and the covenant purpose, never for personal gain. "No man can serve two masters" (Matthew 6:24).\n\n3. PRUDENCE: I will exercise reasonable care, skill, and caution in all trust matters. "A prudent man foreseeth the evil, and hideth himself" (Proverbs 22:3).\n\n4. IMPARTIALITY: I will treat all beneficiaries fairly and without favoritism. "I charge thee before God, and the Lord Jesus Christ... that thou observe these things without preferring one before another, doing nothing by partiality" (1 Timothy 5:21).\n\n5. TRANSPARENCY: I will maintain accurate records and provide regular accounting to the Protector Council and beneficiaries. "Providing for honest things, not only in the sight of the Lord, but also in the sight of men" (2 Corinthians 8:21).\n\n6. ACCOUNTABILITY: I submit to the oversight of the Protector Council and will cooperate fully with any audit or inquiry. "Obey them that have the rule over you, and submit yourselves" (Hebrews 13:17).\n\n7. CONFIDENTIALITY: I will protect the private nature of the trust and the confidential information of its members.\n\n8. NON-DELEGATION: I will not delegate fiduciary decisions to unauthorized parties without Protector Council approval.\n\n9. SELF-DEALING PROHIBITION: I will not engage in any transaction that benefits me personally at the expense of the trust. "For the love of money is the root of all evil" (1 Timothy 6:10).' },
          { title: "Scope of Authority", content: '{{entity.charter}}\n\nAs Trustee, I have authority to:\n• Hold legal title to trust property\n• Administer day-to-day trust operations\n• Make distributions within established thresholds\n• Execute documents on behalf of the trust\n• Manage trust accounts and records\n\nI require Protector Council approval to:\n• Make distributions above established thresholds\n• Acquire or dispose of major assets\n• Amend subordinate governing instruments\n• Appoint or remove officers\n\n{{entity.description}}' },
          { title: "Removal & Succession", content: 'I understand that I may be removed as Trustee for cause by the Protector Council, including:\n• Breach of fiduciary duty\n• Failure to maintain the qualifications of the office\n• Moral failure or covenant violation\n• Incapacity or inability to serve\n\nI agree to cooperate fully in any transition and to deliver all trust property, records, and documents to my successor.\n\n{{entity.notes}}' },
          { title: "Signatures & Attestation", content: 'IN WITNESS WHEREOF, I accept this Trusteeship with full knowledge of its duties and in covenant with the community.\n\nTRUSTEE (Accepting):\n____________________________________\n{{entity.trusteeLabel}}\nPrinted Name: ________________________\nDate: _______________\n\nPROTECTOR COUNCIL (Confirming Appointment):\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nWITNESS:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 20. CERTIFICATE OF TRUST (Certification of Trust Existence)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Certificate of Trust",
        description: "Summary certification for third parties: confirms trust existence without revealing full terms",
        layers: ["covenant", "body", "stewardship"],
        sections: [
          { title: "Certificate of Trust", content: 'CERTIFICATE OF TRUST\n(Certification of Trust Existence)\n\nThis Certificate is issued on {{date}} to certify the existence and authority of the trust described herein. This Certificate is provided for informational purposes to third parties and does not constitute the full Declaration of Trust.\n\n"A good name is rather to be chosen than great riches, and loving favour rather than silver and gold."\n— Proverbs 22:1' },
          { title: "Trust Information", content: 'TRUST NAME: {{entity.name}}\nSUBTITLE: {{entity.subtitle}}\nDATE OF CREATION: [Date trust was originally established]\nTYPE: Irrevocable Express Trust under Common Law\nCHARACTER: Private, Non-Statutory, Ecclesiastical\n\nAuthority chain: {{authority.chain}}\n\nJURISDICTION: This trust is not organized under any state trust code. It operates under common law trust principles, divine law, and the constitutional right of free association.' },
          { title: "Trustee Information", content: 'CURRENT TRUSTEE: {{entity.trusteeLabel}}\n\nThe Trustee has the authority to:\n• Hold legal title to trust property\n• Execute documents on behalf of the trust\n• Open and manage accounts in the trust\'s name\n• Enter into contracts for trust purposes\n• Receive property on behalf of the trust\n\nPROTECTOR COUNCIL: {{entity.protectorLabel}}\nThe Protector Council provides oversight and must approve major transactions above established thresholds.' },
          { title: "Trust Purpose (Summary)", content: '{{entity.charter}}\n\nThe trust is organized exclusively for ecclesiastical, charitable, educational, and eleemosynary purposes consistent with the covenant charter.' },
          { title: "Certifications", content: 'The undersigned Trustee hereby certifies that:\n\n1. The trust described herein is in full force and effect and has not been revoked, amended, or terminated\n2. The Trustee has the authority to act on behalf of the trust\n3. This Certificate accurately summarizes the relevant provisions of the trust instrument\n4. The trust is irrevocable\n5. No other person or entity has authority to act on behalf of the trust except as described herein\n\nThis Certificate is provided pursuant to common law and does not waive the private nature of the trust instrument. The full Declaration of Trust is a private document and is not required to be disclosed to any third party.\n\n{{entity.legalBasis}}' },
          { title: "Signatures", content: 'TRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL (Confirming):\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nNOTARY (Optional):\n\nState of _______________\nCounty of _______________\n\nSworn and subscribed before me on this ____ day of __________, ______.\n\n____________________________________\nNotary Public\nMy Commission Expires: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 21. APPOINTMENT OF SUCCESSOR TRUSTEE
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Appointment of Successor Trustee",
        description: "Instrument for appointing a new trustee when the current trustee resigns, is removed, or becomes incapacitated",
        layers: ["covenant", "body", "stewardship", "assembly", "region"],
        sections: [
          { title: "Scripture Preamble", content: '"And the things that thou hast heard of me among many witnesses, the same commit thou to faithful men, who shall be able to teach others also."\n— 2 Timothy 2:2\n\n"And Moses did as the LORD commanded: and he took Joshua, and set him before Eleazar the priest, and before all the congregation: And he laid his hands upon him, and gave him a charge, as the LORD commanded by the hand of Moses."\n— Numbers 27:22-23' },
          { title: "Appointment", content: 'APPOINTMENT OF SUCCESSOR TRUSTEE\n\nThis Appointment is made on {{date}} for "{{entity.name}}" within the trust ecosystem of {{root.name}}.\n\nAuthority chain: {{authority.chain}}\n\nWHEREAS, the office of Trustee for the above-named trust has become vacant by reason of:\n☐ Resignation of the prior Trustee\n☐ Removal of the prior Trustee by the Protector Council\n☐ Incapacity of the prior Trustee\n☐ Death of the prior Trustee\n☐ Other: ________________________\n\nWHEREAS, the Protector Council, having the authority to appoint a successor under the Declaration of Trust, has identified a qualified successor;\n\nNOW, THEREFORE, the Protector Council hereby appoints the following individual as Successor Trustee:' },
          { title: "Successor Trustee Information", content: 'SUCCESSOR TRUSTEE: [Name of Successor]\n\nQUALIFICATIONS: The Successor Trustee has been evaluated according to the scriptural standards for stewardship:\n• "Moreover it is required in stewards, that a man be found faithful" (1 Corinthians 4:2)\n• "A bishop then must be blameless... given to hospitality, apt to teach" (1 Timothy 3:2)\n• "Not a novice, lest being lifted up with pride he fall into the condemnation of the devil" (1 Timothy 3:6)\n\nThe Successor Trustee assumes ALL authority, duties, and responsibilities of the Trusteeship as set forth in the Declaration of Trust, effective upon execution of this instrument and the Acceptance of Trusteeship.' },
          { title: "Transfer of Authority", content: 'Upon execution of this Appointment:\n\n1. All authority, rights, and powers of the Trusteeship pass to the Successor Trustee\n2. The prior Trustee (or their representative) shall deliver all trust property, records, accounts, and documents to the Successor\n3. The Successor Trustee is authorized to re-title trust property, update account signatories, and take all actions necessary to assume administration\n4. The transition shall be completed within 30 days of this Appointment\n\n{{entity.notes}}' },
          { title: "Signatures", content: 'PROTECTOR COUNCIL (Appointing):\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nSUCCESSOR TRUSTEE (Accepting; see separate Acceptance of Trusteeship):\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nDEPARTING TRUSTEE (Acknowledging, if applicable):\n____________________________________\nDate: _______________\n\nWITNESS:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 22. NOTICE OF RESIGNATION
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Notice of Resignation",
        description: "Formal notice of resignation from Trustee, officer, or elder position: orderly transition",
        layers: ["covenant", "body", "stewardship", "assembly", "region", "household", "craft"],
        sections: [
          { title: "Scripture Preamble", content: '"To every thing there is a season, and a time to every purpose under the heaven."\n— Ecclesiastes 3:1\n\n"I have fought a good fight, I have finished my course, I have kept the faith."\n— 2 Timothy 4:7' },
          { title: "Notice of Resignation", content: 'NOTICE OF RESIGNATION\n\nDate: {{date}}\nTo: {{entity.protectorLabel}} and the Protector Council of {{root.name}}\nFrom: {{entity.trusteeLabel}}\nRe: Resignation from the office of ________________________\n\nI, the undersigned, hereby give formal notice of my resignation from the above-stated office within "{{entity.name}}", effective:\n\n☐ Immediately\n☐ Upon appointment of a successor\n☐ On the following date: _______________\n\nI submit this resignation:\n☐ Voluntarily, for personal reasons\n☐ Due to relocation\n☐ Due to health or incapacity\n☐ Other: ________________________' },
          { title: "Transition Commitments", content: 'In accordance with my fiduciary duties and covenant obligations, I commit to:\n\n1. Continue serving faithfully until the effective date of resignation or the appointment of a successor\n2. Deliver all trust property, records, documents, accounts, passwords, and materials to my successor or the Protector Council\n3. Provide a full accounting of my stewardship during my term of office\n4. Cooperate with the transition process and answer questions from my successor\n5. Maintain confidentiality of trust affairs after my departure\n\n"Let all things be done decently and in order" (1 Corinthians 14:40).\n\n{{entity.notes}}' },
          { title: "Signatures", content: 'RESIGNING OFFICER:\n____________________________________\n{{entity.trusteeLabel}}\nPrinted Name: ________________________\nDate: _______________\n\nRECEIVED BY (Protector Council):\n____________________________________\n{{entity.protectorLabel}}\nDate Received: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 23. AFFIDAVIT OF TRUST
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Affidavit of Trust",
        description: "Sworn statement confirming trust existence, authority, and specific facts: for third-party dealings",
        layers: ["covenant", "body", "stewardship"],
        sections: [
          { title: "Scripture Preamble", content: '"But let your communication be, Yea, yea; Nay, nay: for whatsoever is more than these cometh of evil."\n— Matthew 5:37\n\n"Providing for honest things, not only in the sight of the Lord, but also in the sight of men."\n— 2 Corinthians 8:21' },
          { title: "Affidavit", content: 'AFFIDAVIT OF TRUST\n\nState of _______________\nCounty of _______________\n\nBefore me, the undersigned authority, personally appeared the Affiant, who being duly affirmed, deposes and states as follows:\n\n1. I am the duly appointed and acting Trustee of "{{entity.name}}", an irrevocable express trust under common law.\n\n2. The trust was established on [DATE OF CREATION] and is currently in full force and effect.\n\n3. The trust has not been revoked, modified in any material respect, or terminated.\n\n4. As Trustee, I have the authority to act on behalf of the trust in all matters, including but not limited to: holding property, executing documents, opening accounts, entering contracts, and conducting trust business.\n\n5. The Protector Council ({{entity.protectorLabel}}) provides oversight but day-to-day authority rests with the Trustee.\n\n6. Authority chain: {{authority.chain}}' },
          { title: "Specific Representations", content: '7. The trust is NOT a corporation, LLC, partnership, or any statutory business entity.\n\n8. The trust is NOT organized under any state trust code, Uniform Trust Code, or Internal Revenue Code provision.\n\n9. The trust IS an irrevocable express trust under common law, organized for ecclesiastical, charitable, and educational purposes.\n\n10. The trust exercises its rights under the First, Ninth, and Tenth Amendments to the Constitution of the United States.\n\n11. {{entity.legalBasis}}\n\n12. The trust purpose is: {{entity.charter}}\n\n13. Additional facts: {{entity.notes}}' },
          { title: "Oath & Signatures", content: 'I affirm under penalty of perjury that the foregoing statements are true and correct to the best of my knowledge and belief.\n\n"But above all things, my brethren, swear not, neither by heaven, neither by the earth, neither by any other oath: but let your yea be yea; and your nay, nay" (James 5:12). This affirmation is made in the spirit of truth, not as a statutory oath.\n\nAFFIANT / TRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nPrinted Name: ________________________\nDate: _______________\n\nNOTARY / WITNESS:\n\nAffirmed and subscribed before me on this ____ day of __________, ______.\n\n____________________________________\nNotary Public / Witness\nMy Commission Expires: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 24. SCHEDULE A. TRUST PROPERTY INVENTORY
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Schedule A: Trust Property Inventory",
        description: "Master inventory of all trust property: real, personal, intellectual, financial, and intangible assets",
        layers: ["covenant", "body", "stewardship"],
        sections: [
          { title: "Scripture Preamble", content: '"The earth is the LORD\'s, and the fulness thereof; the world, and they that dwell therein."\n— Psalm 24:1\n\n"For every beast of the forest is mine, and the cattle upon a thousand hills."\n— Psalm 50:10\n\n"A good man leaveth an inheritance to his children\'s children."\n— Proverbs 13:22' },
          { title: "Schedule A: Trust Property", content: 'SCHEDULE A\nTRUST PROPERTY INVENTORY\n\nTrust: {{entity.name}}\nAs of: {{date}}\nPrepared by: {{entity.trusteeLabel}}\n\nThis Schedule A is incorporated by reference into the Declaration of Trust and all subordinate instruments. It is a living document updated as property is conveyed to or from the trust.\n\nAuthority chain: {{authority.chain}}' },
          { title: "I. Real Property", content: 'REAL PROPERTY HELD IN TRUST:\n\nLand stewardship: {{land.stewardship}}\n\n[LEGAL DESCRIPTIONS OF ALL REAL PROPERTY]\n\nParcel 1: ________________________\nLocation: ________________________\nAcreage: ________________________\nAcquired: ________________________\nMethod: ☐ Quit Claim Deed ☐ Warranty Deed ☐ Gift ☐ Purchase\n\nParcel 2: ________________________\n(Continue as needed)\n\nAll real property is held by the Trustee for the benefit of the covenant community. No individual member holds title.' },
          { title: "II. Personal Property", content: 'PERSONAL PROPERTY:\n\nEquipment: ________________________\nVehicles: ________________________\nLivestock: ________________________\nTools & Implements: ________________________\nFurnishings: ________________________\nInventory/Supplies: ________________________\n\n(Attach detailed inventory sheets as needed)' },
          { title: "III. Financial Assets", content: 'FINANCIAL ASSETS:\n\nFunding sources: {{funding.sources}}\nFunding targets: {{funding.targets}}\n\nBank Accounts:\nAccount 1: ________________________ Balance: $____________\nAccount 2: ________________________ Balance: $____________\n\nInvestment Accounts: ________________________\nReceivables: ________________________\nCash on Hand: $____________\n\nTithe sources: {{tithe.sources}}\nRemittances: {{remits.targets}}' },
          { title: "IV. Intellectual Property & Intangibles", content: 'INTELLECTUAL PROPERTY:\n\nCopyrights: ________________________\nTrademarks: ________________________\nDomain Names: ________________________\nSoftware/Code: ________________________\nCurriculum/Content: ________________________\nTrade Secrets: ________________________\n\nOTHER INTANGIBLE ASSETS:\n\nGoodwill: ________________________\nContracts/Agreements: ________________________\nLicenses/Permits: ________________________' },
          { title: "V. Digital Assets & Cryptocurrency", content: 'DIGITAL ASSETS:\n\nCryptocurrency Holdings:\nBitcoin (BTC): ________________________ Wallet: ________________________\nEthereum (ETH): ________________________ Wallet: ________________________\nOther: ________________________ Wallet: ________________________\n\nDigital Tokens / NFTs: ________________________\n\nDomain Names:\n________________________\n________________________\n\nDigital Accounts & Platforms:\n________________________\n________________________\n\nPrivate Keys & Access Credentials:\n(Stored securely; location: ________________________)\n\nAll digital assets are held by the Trustee for the benefit of the covenant community. Private keys and access credentials shall be maintained in secure custody with backup procedures approved by the Protector Council.' },
          { title: "VI. Business & Commercial Interests", content: 'BUSINESS INTERESTS:\n\nOwnership Interests:\nBusiness 1: ________________________ Interest: ______%\nBusiness 2: ________________________ Interest: ______%\n\nPartnership Interests: ________________________\nJoint Ventures: ________________________\nRoyalty Interests: ________________________\nLicensing Agreements: ________________________\n\nAccounts Receivable:\n________________________ Amount: $____________\n________________________ Amount: $____________\n\nAll business and commercial interests held by the trust are administered for the covenant purpose. No commercial activity shall compromise the ecclesiastical character of the trust.' },
          { title: "VII. Choses in Action", content: 'CHOSES IN ACTION (Legal Claims & Rights):\n\nA chose in action is an intangible right that can be enforced by legal or equitable action. The following choses in action are held by the trust:\n\nPending Claims:\n________________________\n________________________\n\nCauses of Action:\n________________________\n________________________\n\nDebts Owed to Trust:\nDebtor: ________________________ Amount: $____________\nDebtor: ________________________ Amount: $____________\n\nContractual Rights:\n________________________\n________________________\n\nInsurance Claims:\n________________________\n________________________\n\nAll choses in action are subrogated to Jesus Christ as Redeemer and administered by the Trustee for the benefit of the covenant community.' },
          { title: "VIII. Spiritual & Identity Assets", content: 'SPIRITUAL & IDENTITY ASSETS:\n\nThe following intangible assets of eternal value are recognized as part of the trust corpus:\n\n• The body of each covenant member, as temple of the Holy Spirit (1 Corinthians 6:19)\n• All labor, skills, talents, and productive capacity of covenant members\n• The covenant relationships within the Body of Christ\n• The spiritual gifts distributed among members (1 Corinthians 12:4-11)\n• The collective testimony and witness of the community\n• The accumulated wisdom, teaching, and discipleship heritage\n• All prayer, worship, and spiritual works\n\nThese assets, though not quantifiable in monetary terms, constitute the most valuable portion of the trust corpus and are the foundation upon which all other assets rest.\n\n"For what shall it profit a man, if he shall gain the whole world, and lose his own soul?" (Mark 8:36)' },
          { title: "IX. Universal Conveyance", content: 'UNIVERSAL CONVEYANCE CLAUSE\n\nIn addition to the specific categories of property listed above, the trust corpus includes ALL property of every kind and nature, whether real, personal, tangible, intangible, present, or future, wherever situated, including but not limited to:\n\n• All property acquired after the date of this Schedule\n• All increase, profits, rents, and income from trust property\n• All property received by gift, inheritance, or bequest\n• All property substituted for existing trust property\n• All rights, claims, and interests not specifically enumerated\n• All after-acquired property of every description\n\nThis universal conveyance ensures that no property interest falls outside the trust, whether by oversight, subsequent acquisition, or any other cause.\n\n"The earth is the LORD\'s, and the fulness thereof; the world, and they that dwell therein" (Psalm 24:1).\n\nAll property listed herein and hereafter acquired is held by the Trustee, {{entity.trusteeLabel}}, for the benefit of the covenant community under the oversight of the Protector Council, {{entity.protectorLabel}}.' },
          { title: "X. Summary & Attestation", content: '{{entity.description}}\n\nTOTAL ESTIMATED VALUE: $____________\n(For record-keeping purposes only; trust property is not marketed or valued for commercial purposes)\n\nThis Schedule A is a true and accurate inventory of the trust property as of the date stated above.\n\n{{entity.notes}}\n\nTRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 25. CERTIFICATE OF BENEFICIAL INTEREST
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Certificate of Beneficial Interest",
        description: "Individual member's certificate documenting their Beneficial Unit: rights, protections, and obligations",
        layers: ["member", "assembly"],
        sections: [
          { title: "Scripture Preamble", content: '"And if children, then heirs; heirs of God, and joint-heirs with Christ."\n— Romans 8:17\n\n"Blessed are the meek: for they shall inherit the earth."\n— Matthew 5:5\n\n"The LORD is the portion of mine inheritance and of my cup: thou maintainest my lot. The lines are fallen unto me in pleasant places; yea, I have a goodly heritage."\n— Psalm 16:5-6' },
          { title: "Certificate", content: 'CERTIFICATE OF BENEFICIAL INTEREST\n\nCertificate Number: ____________\nDate of Issuance: {{date}}\n\nThis certifies that ________________________ (the "Member") holds ONE (1) Beneficial Unit in the trust ecosystem of {{root.name}}, representing an equal, undivided interest (1/N, where N is the total number of members) in the trust corpus.\n\nThis Certificate is issued by "{{entity.name}}" under the authority of {{parent.names}}.' },
          { title: "Nature of Interest", content: 'This Beneficial Unit represents:\n\n✦ An EQUITABLE interest: the right to beneficial use of trust assets\n✦ An EQUAL share: one member, one unit, one voice\n✦ A COVENANT relationship: both receiving and giving\n\nThis Beneficial Unit does NOT represent:\n✗ Legal ownership of any specific trust asset\n✗ A marketable security or investment instrument\n✗ A transferable or assignable interest\n✗ An interest that passes to heirs upon death\n\n"For we brought nothing into this world, and it is certain we can carry nothing out" (1 Timothy 6:7).' },
          { title: "Spendthrift Protections", content: 'This Beneficial Unit is protected by an irrevocable SPENDTHRIFT PROVISION:\n\n• NON-TRANSFERABLE: Cannot be sold, gifted, traded, or pledged\n• NON-ATTACHABLE: Cannot be seized by creditors, judgment holders, or government agencies\n• NON-ASSIGNABLE: Cannot be assigned to any third party\n• PROTECTED FROM DIVORCE: Not marital property subject to equitable distribution\n• PROTECTED FROM BANKRUPTCY. Not an asset of the member\'s estate\n\nThese protections exist because the member does not OWN the interest; they are the designated recipient of the trust\'s provision, at the Trustee\'s discretion, according to the covenant purpose.\n\nBenefit sources: {{benefit.sources}}' },
          { title: "Rights & Obligations", content: 'RIGHTS:\n• Housing, food, education, healthcare, and community resources as allocated\n• Voice in governance: one member, one voice\n• Ministry: exercise of spiritual gifts (1 Corinthians 12)\n• Benevolence in times of need (Acts 2:45)\n• Due process under the Matthew 18 Protocol\n\nOBLIGATIONS:\n• Covenant fidelity: abide by the community charter\n• Stewardship: contribute labor, skills, time as agreed (2 Thessalonians 3:10)\n• Tithing: contribute financially according to conviction (Malachi 3:10)\n• Submission: respect the governance structure (Hebrews 13:17)\n• Peace: resolve disputes through Matthew 18, not civil courts (1 Corinthians 6:1-8)\n\n{{entity.notes}}' },
          { title: "Termination", content: 'This Beneficial Unit terminates upon:\n• Voluntary withdrawal (30 days notice)\n• Covenant violation (after Matthew 18 process)\n• Death (does not pass to heirs; reverts to trust corpus)\n\nUpon termination, the member takes personal effects but has no claim to trust property.\n\n"The LORD gave, and the LORD hath taken away; blessed be the name of the LORD" (Job 1:21).' },
          { title: "Attestation", content: 'Issued under the seal of the trust on the date stated above.\n\nTRUSTEE / PMA ADMINISTRATOR:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nMEMBER (Acknowledging receipt and terms):\n____________________________________\nPrinted Name: ________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 26. MEMORANDUM OF TRUST
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Memorandum of Trust",
        description: "Recordable summary of trust for land records: establishes trust holds title without revealing full terms",
        layers: ["covenant", "body", "stewardship"],
        sections: [
          { title: "Memorandum of Trust", content: 'MEMORANDUM OF TRUST\n(For Recording Purposes)\n\nThis Memorandum is filed for the purpose of giving notice that legal title to certain real property is held by the Trustee of an irrevocable express trust. This Memorandum does not constitute the full trust instrument, which is a private document.\n\n"A prudent man foreseeth the evil, and hideth himself: but the simple pass on, and are punished."\n— Proverbs 22:3' },
          { title: "Trust Information", content: 'TRUST NAME: {{entity.name}}\nDATE OF TRUST: [Date originally established]\nAMENDED: [If applicable]\n\nTRUSTEE: {{entity.trusteeLabel}}\n\nTRUST CHARACTER: Irrevocable Express Trust under Common Law\n— Not organized under any state trust code or Uniform Trust Code\n— Not a corporation, LLC, or statutory entity\n— Organized for ecclesiastical, charitable, and educational purposes\n\nAuthority chain: {{authority.chain}}\n\n{{entity.legalBasis}}' },
          { title: "Property Subject to Trust", content: 'The following real property is held by the Trustee under the terms of the above-referenced trust:\n\n[LEGAL DESCRIPTION OF PROPERTY]\n\nLand stewardship: {{land.stewardship}}\n\nTax Parcel Number(s): ________________________\nProperty Address: ________________________' },
          { title: "Trustee Authority", content: 'The Trustee has full authority under the trust instrument to:\n• Hold, manage, and administer real property\n• Execute deeds, mortgages, and other instruments affecting real property (with Protector Council approval where required)\n• Enter into leases and use agreements\n• Receive and convey property on behalf of the trust\n\nProtector Council: {{entity.protectorLabel}}\n\nThe full trust instrument contains additional terms, conditions, and provisions that are private between the parties and are not required to be recorded or disclosed.' },
          { title: "Notice", content: 'This Memorandum is filed to give constructive notice that:\n\n1. Legal title to the above-described property is held by the Trustee, not in any individual capacity\n2. The property is trust property and is not subject to the personal debts, liens, or obligations of the Trustee individually\n3. Any person dealing with the Trustee may rely on the Trustee\'s authority as stated herein\n\n{{entity.notes}}' },
          { title: "Signatures & Notarization", content: 'TRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nPrinted Name: ________________________\nDate: _______________\n\nState of _______________\nCounty of _______________\n\nBefore me, the undersigned notary, on this ____ day of __________, ______, personally appeared the above-named Trustee, known to me to be the person who executed the foregoing instrument, and acknowledged the same to be their free act and deed in their capacity as Trustee.\n\n____________________________________\nNotary Public\nMy Commission Expires: _______________\n\n[SPACE FOR RECORDING INFORMATION]' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 27. CONSENT RESOLUTION
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Consent Resolution",
        description: "Written resolution for major governance decisions. Protector Council actions, trustee appointments, policy changes",
        layers: ["covenant", "body", "stewardship", "assembly", "region"],
        sections: [
          { title: "Scripture Preamble", content: '"Where no counsel is, the people fall: but in the multitude of counsellors there is safety."\n— Proverbs 11:14\n\n"And when they had appointed him a day, there came many to him into his lodging; to whom he expounded and testified the kingdom of God."\n— Acts 28:23\n\n"In the multitude of words there wanteth not sin: but he that refraineth his lips is wise."\n— Proverbs 10:19' },
          { title: "Resolution", content: 'CONSENT RESOLUTION\nof the Protector Council / Elder Body\n\nEntity: {{entity.name}}\nDate: {{date}}\nResolution Number: ____________\n\nThe undersigned, being all of the members of the Protector Council / Elder Body of "{{entity.name}}" within the trust ecosystem of {{root.name}}, hereby adopt the following resolution by written consent without a formal meeting, pursuant to the authority granted in the Declaration of Trust:\n\nAuthority chain: {{authority.chain}}' },
          { title: "RESOLVED", content: 'RESOLVED, that:\n\n[STATE THE SPECIFIC ACTION BEING AUTHORIZED]\n\n____________________________________________________________\n____________________________________________________________\n____________________________________________________________\n____________________________________________________________\n\nCategory of action:\n☐ Appointment of officer/trustee\n☐ Removal of officer/trustee\n☐ Major financial transaction (above threshold)\n☐ Property acquisition or disposition\n☐ Policy change or amendment\n☐ New entity authorization\n☐ Disciplinary action\n☐ Other: ________________________\n\nFURTHER RESOLVED, that the Trustee ({{entity.trusteeLabel}}) is hereby authorized to take all actions necessary to implement this Resolution.\n\n{{entity.notes}}' },
          { title: "Voting Record", content: 'VOTING RECORD:\n\nProtector Council: {{entity.protectorLabel}}\n\n☐ UNANIMOUS CONSENT\n☐ SUPERMAJORITY (⅔ or greater)\n☐ SIMPLE MAJORITY\n\nIN FAVOR:\n1. ________________________ ☐\n2. ________________________ ☐\n3. ________________________ ☐\n4. ________________________ ☐\n5. ________________________ ☐\n\nOPPOSED:\n1. ________________________ ☐\n\nABSTAINED:\n1. ________________________ ☐\n\n"In the mouth of two or three witnesses shall every word be established" (2 Corinthians 13:1).' },
          { title: "Signatures", content: 'This Resolution is effective as of the date first written above.\n\nPROTECTOR COUNCIL MEMBERS:\n\n____________________________________\nDate: _______________\n\n____________________________________\nDate: _______________\n\n____________________________________\nDate: _______________\n\nTRUSTEE (Acknowledging):\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 28. MINUTES OF ELDER COUNCIL MEETING
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Minutes of Elder Council Meeting",
        description: "Official record of elder body / Protector Council meetings: decisions, discussions, and actions",
        layers: ["covenant", "body", "assembly", "region"],
        sections: [
          { title: "Scripture Preamble", content: '"And when they had ordained them elders in every church, and had prayed with fasting, they commended them to the Lord, on whom they believed."\n— Acts 14:23\n\n"Remember them which have the rule over you, who have spoken unto you the word of God: whose faith follow, considering the end of their conversation."\n— Hebrews 13:7' },
          { title: "Meeting Information", content: 'MINUTES OF ELDER COUNCIL / PROTECTOR COUNCIL MEETING\n\nEntity: {{entity.name}}\nDate: {{date}}\nLocation: ________________________\nType: ☐ Regular ☐ Special ☐ Emergency\n\nOpening Prayer: ________________________\nScripture Reading: ________________________\n\nPresiding: {{entity.trusteeLabel}}\nRecording Secretary: ________________________' },
          { title: "Attendance", content: 'PRESENT:\n1. ________________________ (Role: ________________________)\n2. ________________________ (Role: ________________________)\n3. ________________________ (Role: ________________________)\n4. ________________________ (Role: ________________________)\n5. ________________________ (Role: ________________________)\n\nABSENT:\n1. ________________________ (Reason: ________________________)\n\nGUESTS:\n1. ________________________ (Purpose: ________________________)\n\nQUORUM: ☐ Yes ☐ No\n\nProtector Council: {{entity.protectorLabel}}' },
          { title: "Agenda & Minutes", content: 'AGENDA ITEMS:\n\n1. OPENING: Prayer and Scripture\n2. APPROVAL OF PREVIOUS MINUTES\n3. REPORTS\n   a. Trustee Report: {{entity.trusteeLabel}}\n   b. Financial Report\n   c. Ministry Reports\n      - Pastoral: {{shepherds.targets}}\n      - Teaching: {{teaches.targets}}\n      - Service: {{serves.targets}}\n4. OLD BUSINESS\n   ________________________\n5. NEW BUSINESS\n   ________________________\n6. PRAYER REQUESTS\n7. CLOSING PRAYER\n\nDETAILED MINUTES:\n\n[Record discussions, decisions, and actions for each agenda item]\n\n________________________\n________________________\n________________________' },
          { title: "Actions & Decisions", content: 'ACTIONS TAKEN:\n\n1. ________________________\n   Motion by: ________________________ Seconded by: ________________________\n   Vote: ☐ Unanimous ☐ Majority (____/____ in favor)\n\n2. ________________________\n   Motion by: ________________________ Seconded by: ________________________\n   Vote: ☐ Unanimous ☐ Majority (____/____ in favor)\n\nACTION ITEMS:\n1. ________________________ | Assigned to: ________________________ | Due: ____________\n2. ________________________ | Assigned to: ________________________ | Due: ____________\n\n{{entity.notes}}' },
          { title: "Attestation", content: 'These minutes are a true and accurate record of the meeting.\n\nClosing Prayer: ________________________\nMeeting Adjourned: ____________ (time)\n\nRECORDING SECRETARY:\n____________________________________\nDate: _______________\n\nPRESIDING ELDER:\n____________________________________\n{{entity.trusteeLabel}}\nDate Approved: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 29. POWER OF ATTORNEY (Limited: Trust Business)
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Limited Power of Attorney",
        description: "Limited POA authorizing an agent to act on behalf of the trust for specific purposes",
        layers: ["covenant", "body", "stewardship"],
        sections: [
          { title: "Scripture Preamble", content: '"And he called his ten servants, and delivered them ten pounds, and said unto them, Occupy till I come."\n— Luke 19:13\n\n"As every man hath received the gift, even so minister the same one to another, as good stewards of the manifold grace of God."\n— 1 Peter 4:10' },
          { title: "Power of Attorney", content: 'LIMITED POWER OF ATTORNEY\n\nKNOW ALL MEN BY THESE PRESENTS:\n\nI, the undersigned Trustee of "{{entity.name}}", an irrevocable express trust under common law, do hereby appoint:\n\nAGENT: ________________________\n\nas my true and lawful attorney-in-fact, with LIMITED authority to act on behalf of the trust for the specific purposes described herein.\n\nDate: {{date}}\nAuthority chain: {{authority.chain}}' },
          { title: "Scope of Authority", content: 'The Agent is authorized to act on behalf of the trust ONLY for the following specific purposes:\n\n☐ Real property transactions (specify): ________________________\n☐ Banking and financial transactions (specify): ________________________\n☐ Contract execution (specify): ________________________\n☐ Property management (specify): ________________________\n☐ Legal proceedings (specify): ________________________\n☐ Government correspondence (specify): ________________________\n☐ Other (specify): ________________________\n\nThe Agent\'s authority is LIMITED to the above purposes and does NOT include:\n• Amending the trust instrument\n• Distributing trust assets to themselves\n• Encumbering trust property beyond the specific authorization\n• Any action outside the stated scope\n\n{{entity.charter}}' },
          { title: "Terms & Conditions", content: 'This Power of Attorney:\n\n1. DURATION: Is effective from {{date}} until ____________ or until revoked, whichever occurs first\n2. REVOCABLE: May be revoked by the Trustee at any time by written notice to the Agent\n3. FIDUCIARY: The Agent is bound by the same fiduciary duties as the Trustee\n4. ACCOUNTING: The Agent shall provide a full accounting of all actions taken under this POA\n5. NON-DELEGABLE: The Agent may not further delegate authority\n6. APPROVED: This POA has been approved by the Protector Council ({{entity.protectorLabel}})\n\n"Moreover it is required in stewards, that a man be found faithful" (1 Corinthians 4:2).\n\n{{entity.notes}}' },
          { title: "Signatures & Notarization", content: 'TRUSTEE (Granting):\n____________________________________\n{{entity.trusteeLabel}}\nPrinted Name: ________________________\nDate: _______________\n\nAGENT (Accepting):\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nPROTECTOR COUNCIL (Approving):\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nNOTARY (if required for the specific purpose):\n\nState of _______________\nCounty of _______________\n\nBefore me on this ____ day of __________, ______.\n\n____________________________________\nNotary Public' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 30. UCC FINANCING STATEMENT REBUTTAL / RESERVATION OF RIGHTS
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Reservation of Rights & UCC Rebuttal",
        description: "Declaration reserving all rights under UCC 1-308, rebutting presumptions of commercial jurisdiction",
        layers: ["covenant", "body", "assembly"],
        sections: [
          { title: "Scripture Preamble", content: '"Stand fast therefore in the liberty wherewith Christ hath made us free, and be not entangled again with the yoke of bondage."\n— Galatians 5:1\n\n"If the Son therefore shall make you free, ye shall be free indeed."\n— John 8:36\n\n"Ye are bought with a price; be not ye the servants of men."\n— 1 Corinthians 7:23' },
          { title: "Reservation of Rights", content: 'RESERVATION OF RIGHTS\nUCC 1-308 DECLARATION\n\nI, the undersigned, acting as Trustee of "{{entity.name}}" and in my private capacity as a living man/woman, do hereby declare and reserve ALL RIGHTS without prejudice:\n\nDate: {{date}}\nAuthority chain: {{authority.chain}}\n\nPursuant to UCC 1-308 (formerly UCC 1-207):\n"A party that with explicit reservation of rights performs or promises performance or assents to performance in a manner demanded or offered by the other party does not thereby prejudice the rights reserved."' },
          { title: "Declarations", content: 'I hereby declare that:\n\n1. ALL RIGHTS RESERVED: I reserve all rights, without prejudice, at all times. No action taken by me or on behalf of this trust shall be construed as a waiver of any right, privilege, or immunity.\n\n2. NON-ASSENT TO JURISDICTION: This trust does not assent to, submit to, or acknowledge the jurisdiction of any administrative, regulatory, or statutory body over its private ecclesiastical affairs. "We ought to obey God rather than men" (Acts 5:29).\n\n3. NON-COMMERCIAL CHARACTER: This trust does not engage in "commerce" as defined by the UCC. All transactions are private, member-to-member exchanges within a private ecclesia. "Render therefore unto Caesar the things which are Caesar\'s; and unto God the things that are God\'s" (Matthew 22:21).\n\n4. NO ADHESION: No contract, form, agreement, or instrument executed by this trust under necessity, duress, or without full disclosure shall be construed as a voluntary waiver of rights.\n\n5. COMMON LAW STANDING: This trust operates under common law, not under the Uniform Commercial Code, administrative law, or statutory regulation. The common law of trusts predates all statutory codes.\n\n6. ECCLESIASTICAL IMMUNITY: The internal affairs of this ecclesia are protected from governmental interference by the First Amendment and the long-standing doctrine of ecclesiastical abstention.' },
          { title: "Specific Reservations", content: '{{entity.legalBasis}}\n\nThis trust specifically reserves rights against:\n\n• Any presumption that the trust or its Trustee is a "taxpayer" within the meaning of the Internal Revenue Code, absent clear evidence of a statutory obligation\n• Any presumption that the trust is a "person" subject to regulatory jurisdiction designed for commercial entities\n• Any presumption that private member-to-member exchanges are "taxable transactions"\n• Any attempt to compel disclosure of private trust instruments to unauthorized parties\n• Any attempt to license, regulate, or tax the free exercise of religion and association\n\n"For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God\'s" (1 Corinthians 6:20).\n\n{{entity.notes}}' },
          { title: "Signatures", content: 'Executed under the common law, with all rights reserved, without prejudice.\n\nTRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nPrinted Name: ________________________\nDate: _______________\nAll rights reserved. UCC 1-308\n\nPROTECTOR COUNCIL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 31. SABBATH & JUBILEE DECLARATION
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Sabbath & Jubilee Declaration",
        description: "Declaration of the community's commitment to Sabbath rest, sabbatical years, and Jubilee: Leviticus 25",
        layers: ["covenant", "body", "assembly", "region", "household"],
        sections: [
          { title: "Scripture Foundation", content: '"Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work."\n— Exodus 20:8-10\n\n"And six years thou shalt sow thy land, and shalt gather in the fruits thereof: But the seventh year thou shalt let it rest and lie still."\n— Exodus 23:10-11\n\n"And ye shall hallow the fiftieth year, and proclaim liberty throughout all the land unto all the inhabitants thereof: it shall be a jubile unto you; and ye shall return every man unto his possession, and ye shall return every man unto his family."\n— Leviticus 25:10\n\n"Come unto me, all ye that labour and are heavy laden, and I will give you rest."\n— Matthew 11:28' },
          { title: "Declaration", content: 'SABBATH & JUBILEE DECLARATION\n\nThe covenant community of "{{entity.name}}", rooted in {{root.name}}, hereby declares its commitment to the biblical principles of Sabbath rest, sabbatical years, and Jubilee.\n\nDate: {{date}}\nAuthority chain: {{authority.chain}}\n\nWe believe that the Creator established rhythms of rest and renewal that are not merely ceremonial but reflect the divine order of creation itself. "For he spake in a certain place of the seventh day on this wise, And God did rest the seventh day from all his works" (Hebrews 4:4).' },
          { title: "Article I. Weekly Sabbath", content: 'The community observes a weekly day of rest and worship.\n\nOn the Sabbath, the community:\n• Ceases from regular labor and commerce\n• Gathers for corporate worship, prayer, and the Word\n• Shares fellowship meals\n• Rests in the provision of God\n• Attends to the needs of the sick, elderly, and vulnerable\n\n"The sabbath was made for man, and not man for the sabbath" (Mark 2:27). Essential services (care of livestock, emergency needs, community kitchens) continue as needed.' },
          { title: "Article II. Sabbatical Year (Shmita)", content: 'Every seventh year, the community observes a sabbatical:\n\n1. LAND REST: Agricultural land lies fallow; only volunteer growth is harvested (Leviticus 25:4-5)\n2. DEBT RELEASE: Internal community debts and obligations are reviewed and released where possible (Deuteronomy 15:1-2)\n3. EDUCATION: The sabbatical year emphasizes intensive teaching, discipleship, and spiritual renewal\n4. RENEWAL: Community infrastructure, relationships, and systems are reviewed and restored\n\nLand stewardship: {{land.stewardship}}\n\n"At the end of every seven years thou shalt make a release" (Deuteronomy 15:1).' },
          { title: "Article III. Year of Jubilee", content: 'Every fiftieth year (after seven cycles of seven years), the community observes a Jubilee:\n\n1. LIBERTY: All members are released from any accumulated obligations or restrictions\n2. LAND REBALANCING: Land use assignments are reviewed and rebalanced to ensure equitable distribution\n3. RESTORATION: Any member who has fallen into hardship is restored to full standing and provision\n4. CELEBRATION: The Jubilee is a year of communal celebration, thanksgiving, and renewal\n\n"And ye shall hallow the fiftieth year, and proclaim liberty throughout all the land" (Leviticus 25:10).\n\nThe Jubilee principle ensures that inequality does not compound over generations. The community resets to its covenant foundations.\n\n{{entity.charter}}' },
          { title: "Article IV. Governance", content: 'The Sabbath and Jubilee calendar is maintained by the Protector Council.\n\nTrustee: {{entity.trusteeLabel}}\nProtector: {{entity.protectorLabel}}\n\nThe elder body determines the practical application of these principles in the community\'s context, balancing faithfulness to Scripture with wisdom for the community\'s circumstances.\n\n{{entity.notes}}' },
          { title: "Signatures", content: 'We, the covenant community, affirm our commitment to these rhythms of rest, release, and renewal.\n\nTRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 32. COVENANT OF MARRIAGE WITHIN THE ECCLESIA
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Covenant of Marriage",
        description: "Ecclesiastical marriage covenant: union before God and the ecclesia, not a state license",
        layers: ["assembly", "region", "household"],
        sections: [
          { title: "Scripture Foundation", content: '"Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh."\n— Genesis 2:24\n\n"And he answered and said unto them, Have ye not read, that he which made them at the beginning made them male and female, And said, For this cause shall a man leave father and mother, and shall cleave to his wife: and they twain shall be one flesh? Wherefore they are no more twain, but one flesh. What therefore God hath joined together, let not man put asunder."\n— Matthew 19:4-6\n\n"Husbands, love your wives, even as Christ also loved the church, and gave himself for it."\n— Ephesians 5:25\n\n"Marriage is honourable in all, and the bed undefiled."\n— Hebrews 13:4' },
          { title: "Covenant of Marriage", content: 'COVENANT OF MARRIAGE\nWithin the Ecclesia of {{entity.name}}\n\nDate: {{date}}\n\nBefore God Almighty, before the witnesses of the ecclesia, and before the elder body of this covenant community, the following persons enter into the holy covenant of marriage:\n\nHUSBAND: ________________________\nWIFE: ________________________\n\nThis marriage is solemnized under the authority of the ecclesia, not under a state marriage license. Marriage is a divine institution ordained by God in the Garden of Eden (Genesis 2:18-24), recognized by Christ at the wedding in Cana (John 2:1-11), and honored throughout Scripture as a sacred covenant.\n\nThe ecclesia has inherent authority under the First Amendment to solemnize marriages according to its own rites, customs, and beliefs.' },
          { title: "Vows & Covenant", content: 'THE VOWS:\n\nHusband: "I, ____________, take thee, ____________, to be my wedded wife, to have and to hold from this day forward, for better for worse, for richer for poorer, in sickness and in health, to love and to cherish, till death us do part, according to God\'s holy ordinance; and thereto I plight thee my troth."\n\nWife: "I, ____________, take thee, ____________, to be my wedded husband, to have and to hold from this day forward, for better for worse, for richer for poorer, in sickness and in health, to love, cherish, and submit unto, till death us do part, according to God\'s holy ordinance; and thereto I give thee my troth."\n\nTHE COVENANT:\nBy these vows, the parties enter into a covenant before God that is:\n• PERMANENT: "What therefore God hath joined together, let not man put asunder" (Matthew 19:6)\n• EXCLUSIVE: "Thou shalt not commit adultery" (Exodus 20:14)\n• SACRIFICIAL: "Husbands, love your wives, even as Christ also loved the church" (Ephesians 5:25)\n• FRUITFUL: "Be fruitful, and multiply" (Genesis 1:28)' },
          { title: "Community Context", content: 'Within the trust ecosystem of {{root.name}}:\n\n• The married couple receives ONE combined Beneficial Unit (or two individual units, per community policy)\n• Housing allocation considers family size and needs\n• The family unit is the basic building block of the commune (Acts 2:46; "from house to house")\n• Children born to the marriage are members of the covenant community from birth\n• The couple is subject to the pastoral care of the local elder body\n\nPastoral care: {{shepherds.sources}}\n\n{{entity.notes}}' },
          { title: "Signatures & Attestation", content: 'OFFICIANT (Elder / Pastor):\n____________________________________\nDate: _______________\n\nHUSBAND:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nWIFE:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nWITNESS:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nWITNESS:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\n"So God created man in his own image, in the image of God created he him; male and female created he them" (Genesis 1:27).' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 33. CHILD DEDICATION & COVENANT COVERING
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Child Dedication & Covenant Covering",
        description: "Dedication of children born into or brought into the covenant community: under the covering of the ecclesia",
        layers: ["assembly", "region", "household"],
        sections: [
          { title: "Scripture Foundation", content: '"And they brought young children to him, that he should touch them: and his disciples rebuked those that brought them. But when Jesus saw it, he was much displeased, and said unto them, Suffer the little children to come unto me, and forbid them not: for of such is the kingdom of God."\n— Mark 10:13-14\n\n"Train up a child in the way he should go: and when he is old, he will not depart from it."\n— Proverbs 22:6\n\n"Lo, children are an heritage of the LORD: and the fruit of the womb is his reward."\n— Psalm 127:3\n\n"And, ye fathers, provoke not your children to wrath: but bring them up in the nurture and admonition of the Lord."\n— Ephesians 6:4' },
          { title: "Child Dedication", content: 'CHILD DEDICATION & COVENANT COVERING\n\nDate: {{date}}\nEcclesia: {{entity.name}}\n\nCHILD\'S NAME: ________________________\nDATE OF BIRTH: ________________________\nPARENTS: ________________________ and ________________________\n\nFollowing the pattern of Hannah dedicating Samuel to the Lord (1 Samuel 1:27-28) and Jesus blessing the children (Mark 10:13-16), this child is hereby DEDICATED to the Lord and placed under the COVENANT COVERING of the ecclesia.' },
          { title: "Parental Vows", content: 'The parents solemnly covenant before God and the community:\n\n1. To raise this child in the fear and admonition of the Lord (Ephesians 6:4)\n2. To teach this child the Scriptures diligently (Deuteronomy 6:6-7)\n3. To model godly character and covenant faithfulness\n4. To submit to the counsel and oversight of the elder body in matters of child-rearing\n5. To ensure this child participates in community life, education, and discipleship\n\n"And these words, which I command thee this day, shall be in thine heart: And thou shalt teach them diligently unto thy children, and shalt talk of them when thou sittest in thine house, and when thou walkest by the way, and when thou liest down, and when thou risest up" (Deuteronomy 6:6-7).' },
          { title: "Community Commitment", content: 'The covenant community pledges:\n\n1. To pray for this child and their family\n2. To provide a safe, nurturing community environment\n3. To share in the responsibility of teaching, mentoring, and discipling this child\n4. To provide material support to the family as needed\n5. To welcome this child as a full participant in community life\n\nTeaching: {{teaches.sources}}\nPastoral care: {{shepherds.sources}}\nService: {{serves.sources}}\n\n"It takes a village to raise a child." A covenant community takes this even further.\n\n{{entity.notes}}' },
          { title: "Signatures & Blessing", content: 'BLESSING: "The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace" (Numbers 6:24-26).\n\nOFFICIATING ELDER:\n____________________________________\nDate: _______________\n\nFATHER:\n____________________________________\nDate: _______________\n\nMOTHER:\n____________________________________\nDate: _______________\n\nWITNESS:\n____________________________________\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 34. DEATH, BURIAL & ESTATE PROTOCOL
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Death, Burial & Estate Protocol",
        description: "Protocol for handling death within the community: burial, estate, beneficial unit reversion, family care",
        layers: ["covenant", "body", "assembly"],
        sections: [
          { title: "Scripture Foundation", content: '"Precious in the sight of the LORD is the death of his saints."\n— Psalm 116:15\n\n"O death, where is thy sting? O grave, where is thy victory? The sting of death is sin; and the strength of sin is the law. But thanks be to God, which giveth us the victory through our Lord Jesus Christ."\n— 1 Corinthians 15:55-57\n\n"Jesus said unto her, I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live."\n— John 11:25\n\n"Blessed are the dead which die in the Lord from henceforth: Yea, saith the Spirit, that they may rest from their labours; and their works do follow them."\n— Revelation 14:13' },
          { title: "Protocol", content: 'DEATH, BURIAL & ESTATE PROTOCOL\n\nEntity: {{entity.name}}\nDate: {{date}}\n\nThis protocol governs the community\'s response when a covenant member passes from this life. We face death with faith, not fear. "to be absent from the body [is] to be present with the Lord" (2 Corinthians 5:8).' },
          { title: "Article I. Immediate Response", content: 'Upon the death of a covenant member:\n\n1. NOTIFICATION: The family notifies the local elder body immediately\n2. PASTORAL CARE: Elders and deacons attend to the family, providing comfort, prayer, and practical support (Romans 12:15; "weep with them that weep")\n3. COMMUNITY MOBILIZATION: The commune/chapter organizes meals, childcare, and household support for the grieving family\n4. PREPARATION: The community prepares the body for burial according to the family\'s wishes and community custom\n\nPastoral care: {{shepherds.sources}}\nService: {{serves.sources}}' },
          { title: "Article II. Burial", content: 'The community provides for the burial of its members:\n\n• Burial takes place on community land where available (land stewardship: {{land.stewardship}})\n• The elder body conducts the funeral/memorial service\n• "We brought nothing into this world, and it is certain we can carry nothing out" (1 Timothy 6:7)\n• Simple, dignified burial is preferred; no extravagant display\n• The community bears the cost of burial from the common treasury\n\nFunding: {{funding.sources}}' },
          { title: "Article III. Estate & Beneficial Unit", content: 'Upon death of a member:\n\n1. BENEFICIAL UNIT REVERTS. The member\'s Beneficial Unit automatically reverts to the trust corpus. It does NOT pass to heirs, spouse, or estate.\n\n2. PERSONAL EFFECTS. The deceased member\'s personal effects (clothing, personal items, sentimental objects) pass to the family/next of kin\n\n3. NO ESTATE CLAIM. The deceased member\'s estate, heirs, creditors, or any outside party has NO claim against the trust corpus or any trust property. All trust assets belong to the trust, not to any individual.\n\n4. FAMILY CARE: The community continues to provide for the deceased member\'s spouse and minor children:\n   • Continued housing\n   • Continued community provision\n   • The surviving spouse retains their own Beneficial Unit\n   • Minor children remain under the covenant covering\n\n"Pure religion and undefiled before God and the Father is this, To visit the fatherless and widows in their affliction" (James 1:27).\n\n{{entity.notes}}' },
          { title: "Article IV. Remembrance", content: 'The community honors its departed members:\n\n• Names are recorded in the community\'s Book of Remembrance\n• An annual memorial observance honors all departed members\n• Their faithful service and testimony are remembered and shared with future generations\n\n"The memory of the just is blessed" (Proverbs 10:7).\n"Remember them which have the rule over you, who have spoken unto you the word of God: whose faith follow, considering the end of their conversation" (Hebrews 13:7).' },
          { title: "Signatures", content: 'TRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 35. PMA CONSTITUTION. Assembly Layer
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "PMA Constitution",
        description: "Foundational document establishing the PMA as a self-governing ecclesial assembly: articles of association and constitutional framework",
        layers: ["assembly"],
        sections: [
          { title: "Scripture Preamble", content: '"Behold, how good and how pleasant it is for brethren to dwell together in unity!"\n— Psalm 133:1\n\n"For it seemed good to the Holy Ghost, and to us, to lay upon you no greater burden than these necessary things."\n— Acts 15:28\n\n"Let all things be done decently and in order."\n— 1 Corinthians 14:40\n\n"Not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching."\n— Hebrews 10:25' },
          { title: "Recitals", content: 'WHEREAS, the Creator of Heaven and Earth has ordained that His people should gather in assembly for worship, mutual edification, governance, and the advancement of His Kingdom on earth (Hebrews 10:25, Acts 2:42-47);\n\nWHEREAS, the root charter "{{root.name}}" has been duly established as an irrevocable express trust under common law, and its administrative body operates through {{parent.names}};\n\nWHEREAS, the right of the People to peaceably assemble and to freely associate for lawful, private, ecclesiastical purposes is an inalienable right antecedent to all civil government, recognized and protected by the First, Ninth, and Tenth Amendments to the Constitution of the United States;\n\nWHEREAS, the Supreme Court of the United States has repeatedly affirmed that the freedom of association includes the right to form and govern private assemblies without governmental interference (NAACP v. Alabama, 357 U.S. 449 (1958); Roberts v. U.S. Jaycees, 468 U.S. 609 (1984); Boy Scouts of America v. Dale, 530 U.S. 640 (2000));\n\nWHEREAS, the gathered ecclesia is the biblical pattern for self-governance among believers, exercising authority delegated by Christ as Head of the Church (Ephesians 1:22-23, Colossians 1:18), and operating through the gifts of the Spirit (1 Corinthians 12:4-11) and the offices ordained by God (Ephesians 4:11-13);\n\nNOW, THEREFORE, we the undersigned members, acting in covenant unity and under divine mandate, do hereby ordain and establish this Constitution for "{{entity.name}}", a Private Membership Association organized as an ecclesial assembly within the trust ecosystem of {{root.name}}.' },
          { title: "Article I. Name, Purpose & Ecclesial Identity", content: 'SECTION 1. NAME\nThis assembly shall be known as "{{entity.name}}", hereinafter referred to as "the Assembly" or "the PMA."\n\nSECTION 2. PURPOSE\n{{entity.charter}}\n\nThe Assembly exists as the gathered community of covenant members, that is, the ecclesia in the biblical sense (Greek: ἐκκλησία, "called-out assembly"). Its purpose is:\n\n(a) To provide a self-governing forum for the collective decision-making of the covenant community;\n(b) To facilitate worship, fellowship, education, mutual aid, and the exercise of spiritual gifts;\n(c) To administer the affairs of the community in all matters delegated by the trust instruments;\n(d) To serve as the primary vehicle through which members participate in governance, ministry, and the beneficial enjoyment of trust assets;\n(e) To maintain the private, non-statutory, ecclesiastical character of all community operations.\n\nSECTION 3. ECCLESIAL IDENTITY\nThis Assembly is NOT a 501(c)(3) tax-exempt organization, a state-chartered church, a corporation sole, or any other statutory entity. It is a voluntary, private, ecclesiastical assembly operating under divine law, natural law, and the common law right of free association. No governmental body has granted, nor may revoke, the authority of this Assembly to exist and govern its own affairs. "We ought to obey God rather than men" (Acts 5:29).' },
          { title: "Article II. Constitutional & Legal Foundation", content: '{{entity.legalBasis}}\n\nThis Constitution rests upon the following foundations:\n\n1. DIVINE LAW: The Holy Scriptures, received as the supreme and final authority in all matters of faith, practice, and governance (2 Timothy 3:16-17). The Assembly recognizes no human authority above the Word of God.\n\n2. NATURAL LAW: The inalienable rights endowed by the Creator, including the right to worship, assemble, associate, contract, and govern one\'s own affairs without governmental interference.\n\n3. COMMON LAW: The ancient body of law developed in courts of equity, recognizing the right of private parties to form trusts, associations, and covenants governed by their own terms.\n\n4. CONSTITUTIONAL PROTECTIONS:\n   • First Amendment: Freedom of religion, assembly, and association\n   • Ninth Amendment: Rights retained by the People are not limited to those enumerated\n   • Tenth Amendment: Powers not delegated to the federal government are reserved to the People\n\n5. JUDICIAL PRECEDENT:\n   • NAACP v. Alabama, 357 U.S. 449 (1958): Freedom of association is a fundamental right\n   • Roberts v. U.S. Jaycees, 468 U.S. 609 (1984): Private associations may set their own membership criteria\n   • Boy Scouts of America v. Dale, 530 U.S. 640 (2000): Private organizations have the right to exclude persons whose presence would affect the group\'s ability to advocate its viewpoints\n   • Kedroff v. Saint Nicholas Cathedral, 344 U.S. 94 (1952): Civil courts may not interfere in ecclesiastical governance\n   • Watson v. Jones, 80 U.S. 679 (1872): Religious bodies are supreme in their own domain\n\nAll activities of this Assembly are conducted in the private domain, among consenting members, and are not subject to public regulatory jurisdiction.' },
          { title: "Article III. Membership", content: 'SECTION 1. CLASSES OF MEMBERSHIP\nThe Assembly recognizes three classes of membership:\n\n(a) FOUNDING MEMBERS: Those who sign this Constitution at its adoption. Founding Members hold permanent recognition and may not be removed except by the most severe discipline process (Article III, Section 5).\n\n(b) ACTIVE MEMBERS: Those who have completed the full admission process, signed the PMA Agreement, and maintain good standing through active participation, tithing, and covenant compliance.\n\n(c) PROVISIONAL MEMBERS: Those who have applied for membership, are undergoing the orientation period, and have not yet been received into full membership. Provisional Members may attend meetings and participate in community life but may not vote or hold office.\n\nSECTION 2. ADMISSION\nAdmission to Active Membership requires:\n(a) A written application expressing desire to join the covenant community;\n(b) Completion of the orientation program (minimum three meetings and completion of membership education);\n(c) A personal interview with at least two elders;\n(d) Signing of the PMA Agreement and acknowledgment of this Constitution;\n(e) Approval by the Elder Council;\n(f) Issuance of one Beneficial Unit.\n\nSECTION 3. MEMBERSHIP REGISTER\n{{beneficiaries.list}}\n\nThe Secretary shall maintain a current register of all members, their class, date of admission, and standing.\n\nSECTION 4. VOLUNTARY WITHDRAWAL\nAny member may withdraw at any time by submitting written notice to the Administrator. Withdrawal is effective 30 days after receipt of notice. Upon withdrawal, the member\'s Beneficial Unit reverts to the trust corpus. The withdrawing member has no claim against any trust asset.\n\nSECTION 5. DISCIPLINE\nDiscipline follows the Matthew 18 Protocol:\n(a) Private confrontation (Matthew 18:15);\n(b) Confrontation with witnesses (Matthew 18:16);\n(c) Hearing before the Elder Council (Matthew 18:17);\n(d) Suspension of membership privileges;\n(e) Excommunication: removal from membership, revocation of Beneficial Unit.\n\nNo member shall be disciplined except for violation of the covenant, Scripture, or this Constitution, and only after the full Matthew 18 process has been completed. The Elder Council\'s decision is final and binding.' },
          { title: "Article IV. Governance Structure", content: 'The governance of this Assembly follows the New Testament pattern of shared, accountable leadership under the headship of Christ.\n\nSECTION 1. ASSEMBLY OF MEMBERS\nThe Assembly of Members is the highest deliberative body of this PMA. All Active and Founding Members in good standing compose the Assembly. The Assembly has authority to:\n(a) Elect and remove Officers;\n(b) Approve the annual budget;\n(c) Amend this Constitution (subject to Article X);\n(d) Approve the dissolution of the Assembly (subject to Article XI);\n(e) Decide any matter brought before it by the Elder Council or by petition of 10% of Active Members.\n\nSECTION 2. ELDER COUNCIL\nProtector Council / Elder Body: {{entity.protectorLabel}}\n\nThe Elder Council serves as the spiritual oversight and governing authority of the Assembly, after the pattern of the presbyterion (1 Timothy 4:14, Acts 15:6). The Elder Council:\n(a) Provides spiritual oversight, teaching, and pastoral care;\n(b) Exercises the Protector function: veto authority over decisions that conflict with the Declaration of Trust or Scripture;\n(c) Approves or disapproves candidates for membership and office;\n(d) Oversees the discipline process;\n(e) Serves as the final court of appeal in all internal disputes.\n\nSECTION 3. OFFICERS\nAdministrative Authority: {{entity.trusteeLabel}}\n\nThe Officers of the Assembly serve as its administrative stewards, executing the decisions of the Assembly and Elder Council. Officers are described in Article VI.\n\nSECTION 4. FIVE-FOLD MINISTRY\nThe Assembly recognizes the gifts given by Christ for the building up of the Body (Ephesians 4:11-13): apostles, prophets, evangelists, pastors, and teachers. These ministry functions operate alongside but distinct from the governance offices, providing spiritual direction, equipping, and edification.' },
          { title: "Article V. Meetings & Assemblies", content: 'SECTION 1. ANNUAL ASSEMBLY\nThe Assembly shall hold an Annual Assembly Meeting during the first quarter of each calendar year for the purpose of:\n(a) Receiving the annual report from the Administrator and Treasurer;\n(b) Electing Officers and Elder Council members as terms expire;\n(c) Approving the annual budget;\n(d) Conducting such other business as may properly come before the Assembly.\n\nSECTION 2. REGULAR MEETINGS\nThe Assembly shall hold regular meetings at least monthly, at such time and place as the Elder Council shall determine. Regular meetings shall include worship, teaching, community business, and fellowship.\n\nSECTION 3. SPECIAL MEETINGS\nSpecial meetings may be called by:\n(a) The Administrator;\n(b) A majority of the Elder Council;\n(c) Written petition of 20% of Active Members.\n\nSECTION 4. NOTICE\nNotice of the Annual Assembly shall be given at least 30 days in advance. Notice of special meetings shall be given at least 7 days in advance, stating the purpose of the meeting. Regular meetings require no special notice if their schedule is established.\n\nSECTION 5. QUORUM\nA quorum for the transaction of business shall consist of a majority (more than 50%) of Active Members in good standing. No binding decision may be taken without a quorum present.\n\nSECTION 6. CONDUCT OF MEETINGS\nAll meetings shall be opened and closed with prayer. Proceedings shall follow orderly procedure consistent with 1 Corinthians 14:40. The Administrator or a designated chairperson shall preside. Minutes shall be recorded by the Secretary.' },
          { title: "Article VI. Officers & Duties", content: 'SECTION 1. OFFICERS\nThe Officers of the Assembly shall be:\n(a) ADMINISTRATOR (PMA Trustee): The chief administrative officer responsible for day-to-day operations, presiding over meetings, executing decisions of the Assembly and Elder Council, and serving as the fiduciary steward of the Assembly\'s affairs.\n(b) SECRETARY: Responsible for maintaining all records, minutes, correspondence, the membership register, and official documents of the Assembly.\n(c) TREASURER: Responsible for all financial operations, including receiving tithes and offerings, disbursing funds according to the approved budget, maintaining financial records, and providing periodic financial reports.\n\nSECTION 2. QUALIFICATIONS\nAll Officers must be Active Members in good standing for at least one year prior to election. Officers must meet the qualifications for deacons set forth in 1 Timothy 3:8-13.\n\nSECTION 3. ELECTION & TERMS\nOfficers are elected by the Assembly at the Annual Assembly Meeting. Terms are two years, with a maximum of three consecutive terms in the same office. Elections require a simple majority of those present and voting.\n\nSECTION 4. REMOVAL\nAn Officer may be removed by:\n(a) A two-thirds (⅔) vote of the Assembly at a duly called meeting; or\n(b) Unanimous decision of the Elder Council for cause (moral failure, fiduciary breach, abandonment of duties).\n\nSECTION 5. VACANCIES\nVacancies in any office shall be filled by appointment of the Elder Council until the next Annual Assembly Meeting, at which time a special election shall fill the remainder of the term.' },
          { title: "Article VII. Relationship to the Trust", content: 'This Assembly exists within and is subordinate to the trust ecosystem established by the root charter.\n\nSECTION 1. AUTHORITY CHAIN\n{{authority.chain}}\n\nThe Assembly derives its authority from the root charter through the chain of trust described above. It exercises only those powers delegated to it by the trust instruments.\n\nSECTION 2. SUBORDINATION TO DECLARATION\nThis Constitution and all actions of the Assembly are subordinate to the Declaration of Trust. In the event of any conflict between this Constitution and the Declaration, the Declaration shall prevail.\n\nSECTION 3. PROTECTOR VETO\nThe Protector Council (Elder Body) retains veto authority over any decision of the Assembly or its Officers that, in the judgment of the Protectors, conflicts with:\n(a) The Declaration of Trust;\n(b) The covenant purpose;\n(c) Scripture;\n(d) The long-term welfare of the covenant community.\n\nA Protector veto requires a two-thirds (⅔) vote of the Protector Council and must be accompanied by a written explanation citing the specific basis for the veto.\n\nSECTION 4. TRUST PROPERTY\nThe Assembly does not hold legal title to any trust property. All property utilized by the Assembly is held in trust and administered by the appropriate stewardship organ. The Assembly has beneficial use of trust property as allocated by the governance structure.' },
          { title: "Article VIII. Property & Financial Stewardship", content: 'SECTION 1. NO DIRECT OWNERSHIP\nConsistent with Article VII, Section 4, the PMA holds no property in its own name. All real property, personal property, and financial assets are held in trust through the appropriate stewardship organs. The Assembly exercises stewardship over resources allocated to it by the Body.\n\nSECTION 2. FINANCIAL AUTHORITY\nThe Assembly, through its Treasurer and under the oversight of the Elder Council, is responsible for:\n(a) Collecting tithes and offerings from members;\n(b) Remitting the required portion to the Body treasury;\n(c) Administering the Assembly\'s operational budget;\n(d) Providing for benevolence, education, ministry, and community needs.\n\nFunding sources: {{funding.sources}}\nTithe sources: {{tithe.sources}}\n\nSECTION 3. STOREHOUSE PRINCIPLE\nAll financial operations follow the storehouse principle (Malachi 3:10): tithes flow into the central treasury for redistribution according to need and the approved budget. No officer or member shall divert, misappropriate, or personally benefit from trust funds.\n\nSECTION 4. FINANCIAL ACCOUNTABILITY\nThe Treasurer shall provide monthly financial reports to the Elder Council and quarterly reports to the Assembly. An annual audit shall be conducted by a committee of no fewer than three members who are not Officers.' },
          { title: "Article IX. Community Structure", content: 'The Assembly coordinates with and oversees the following entities within the trust ecosystem:\n\nSECTION 1. SUBORDINATE ENTITIES\n{{children.list}}\n\nEach subordinate entity operates under its own charter, consistent with this Constitution and the Declaration of Trust.\n\nSECTION 2. OVERSIGHT RESPONSIBILITIES\n{{oversight.targets}}\n\nThe Assembly, through its Elder Council and Officers, provides governance oversight to ensure subordinate entities operate in accordance with their mandates and the covenant purpose.\n\nSECTION 3. COORDINATION\n{{coordination.targets}}\n\nThe Assembly coordinates with peer entities and higher-level governance bodies to maintain unity and efficiency across the ecosystem.\n\nSECTION 4. RELATIONSHIPS\nRelationships between entities are governed by the principles of mutual submission (Ephesians 5:21), servant leadership (Mark 10:42-45), and the unity of the Body (1 Corinthians 12:12-27). No entity operates in isolation; all function as members of one Body under one Head.' },
          { title: "Article X. Amendment Procedure", content: 'SECTION 1. PROPOSAL\nAmendments to this Constitution may be proposed by:\n(a) The Elder Council, by majority vote;\n(b) Written petition of 25% of Active Members.\n\nSECTION 2. NOTICE\nThe full text of any proposed amendment must be distributed to all Active Members at least 30 days before the meeting at which it will be considered.\n\nSECTION 3. APPROVAL\nAdoption of an amendment requires a two-thirds (⅔) supermajority vote of Active Members present at a duly called meeting at which a quorum is established.\n\nSECTION 4. RESTRICTIONS\nNo amendment may:\n(a) Conflict with the Declaration of Trust or the root charter;\n(b) Alter the ecclesial character of the Assembly;\n(c) Eliminate the Protector veto;\n(d) Modify the Matthew 18 discipline process;\n(e) Change the non-statutory, private character of the PMA.\n\nAny amendment that touches upon these restricted matters requires, in addition to the supermajority vote, the unanimous written consent of the Protector Council.\n\nSECTION 5. RECORDING\nAll adopted amendments shall be appended to this Constitution and recorded in the official minutes.' },
          { title: "Article XI. Dissolution", content: 'SECTION 1. DISSOLUTION VOTE\nThis Assembly may be dissolved only by a three-fourths (¾) supermajority vote of all Active Members (not merely those present) at a duly called special meeting convened for that sole purpose.\n\nSECTION 2. PROTECTOR CONSENT\nDissolution additionally requires the unanimous written consent of the Protector Council. Without such consent, no dissolution vote is effective.\n\nSECTION 3. NOTICE\nNotice of a dissolution meeting must be given at least 60 days in advance, stating the specific reasons for the proposed dissolution.\n\nSECTION 4. ASSET REVERSION\nUpon dissolution:\n(a) All trust property remains in trust; it does not pass to individual members;\n(b) All assets revert to the Body-layer trust from which this Assembly derives its authority;\n(c) All Beneficial Units held by members of this Assembly are reassigned or retired by the Body;\n(d) All records are transferred to the Body for permanent archiving.\n\nSECTION 5. WINDING UP\nThe Elder Council shall oversee the winding up of the Assembly\'s affairs, ensuring all obligations are met and all property is properly transferred. The winding-up period shall not exceed 90 days from the dissolution vote.\n\n"And the multitude of them that believed were of one heart and of one soul: neither said any of them that ought of the things which he possessed was his own; but they had all things common" (Acts 4:32).' },
          { title: "Signatures & Attestation", content: 'IN WITNESS WHEREOF, we the undersigned, being the founding members and officers of this Assembly, do hereby ordain and establish this Constitution on {{date}}, acting in covenant unity and under the authority of the trust ecosystem.\n\nADMINISTRATOR / PMA TRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL / ELDER BODY:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nSECRETARY:\n____________________________________\nDate: _______________\n\nFOUNDING MEMBER:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nFOUNDING MEMBER:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nFOUNDING MEMBER:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\n"Except the LORD build the house, they labour in vain that build it" (Psalm 127:1).' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 36. PMA BYLAWS: Assembly Layer
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "PMA Bylaws",
        description: "Procedural rules implementing the PMA Constitution: meetings, voting, officers, committees, discipline, and financial procedures",
        layers: ["assembly"],
        sections: [
          { title: "Scripture Preamble", content: '"Let all things be done decently and in order."\n— 1 Corinthians 14:40\n\n"And I rejoiced greatly when brethren came and bore witness to your truth, even as you walk in truth. For I have no greater joy than to hear that my children walk in truth."\n— Colossians 2:5 (cf. 3 John 1:3-4)\n\n"Where there is no vision, the people perish: but he that keepeth the law, happy is he."\n— Proverbs 29:18\n\n"For this cause left I thee in Crete, that thou shouldest set in order the things that are wanting, and ordain elders in every city, as I had appointed thee."\n— Titus 1:5' },
          { title: "Recitals", content: 'WHEREAS, the PMA Constitution of "{{entity.name}}" has been duly adopted, establishing the foundational framework for the governance of this Assembly;\n\nWHEREAS, the Constitution requires the adoption of Bylaws to implement its provisions and to establish detailed procedures for the orderly conduct of the Assembly\'s affairs;\n\nWHEREAS, these Bylaws are subordinate to and must be read in conjunction with the PMA Constitution, which is itself subordinate to the Declaration of Trust of {{root.name}};\n\nWHEREAS, the Apostle Paul instructed the churches to conduct their affairs "decently and in order" (1 Corinthians 14:40) and appointed leaders to "set in order the things that are wanting" (Titus 1:5);\n\nNOW, THEREFORE, the Assembly of "{{entity.name}}" hereby adopts these Bylaws on {{date}}, to govern the procedural operations of the Assembly in all matters not directly addressed by the Constitution.' },
          { title: "Article I. Definitions", content: 'For the purposes of these Bylaws, the following terms shall have the meanings set forth below:\n\nASSEMBLY: The gathered body of all Active and Founding Members of "{{entity.name}}" in good standing, constituting the highest deliberative body of the PMA.\n\nELDER COUNCIL: The body of elders serving as the spiritual oversight authority and Protector Council of the Assembly, as established by the Constitution.\n\nPROTECTOR COUNCIL: The Elder Council when acting in its capacity as the trust Protector, exercising veto authority over decisions that conflict with the Declaration of Trust or Scripture.\n\nMEMBER IN GOOD STANDING: An Active or Founding Member who is current in covenant obligations, including regular attendance, tithing, and compliance with the covenant charter and governing documents.\n\nQUORUM: A majority (more than 50%) of Active Members in good standing, required for the transaction of binding business.\n\nSIMPLE MAJORITY: More than half of those present and voting at a duly constituted meeting.\n\nSUPERMAJORITY: Two-thirds (⅔) of those present and voting, unless otherwise specified.\n\nEXTRAORDINARY MAJORITY: Three-fourths (¾) of those present and voting, or of all Active Members as specified.\n\nOFFICER: The Administrator, Secretary, or Treasurer of the Assembly.\n\nFISCAL YEAR: The twelve-month period beginning January 1 and ending December 31, unless otherwise established by the Elder Council.' },
          { title: "Article II. Membership Procedures", content: 'SECTION 1. APPLICATION\nPersons desiring membership shall submit a written application to the Secretary, which shall include:\n(a) Full legal name, date of birth, and contact information;\n(b) A personal statement of faith and reasons for seeking membership;\n(c) The name of at least one Active Member who recommends the applicant;\n(d) Acknowledgment that the applicant has read the PMA Constitution, these Bylaws, and the PMA Agreement.\n\nSECTION 2. ORIENTATION\nUpon receipt of a completed application, the applicant enters a Provisional Membership period of no less than 90 days, during which the applicant must:\n(a) Attend at least three regular Assembly meetings;\n(b) Complete the membership education program covering the covenant charter, trust structure, governance, and community expectations;\n(c) Meet personally with at least two elders for a membership interview.\n\nSECTION 3. ADMISSION VOTE\nUpon satisfactory completion of orientation, the Elder Council shall present the applicant to the Assembly. Admission requires a simple majority vote of those present at a regular or special meeting.\n\nSECTION 4. COVENANT SIGNING\nUpon approval, the new member shall sign the PMA Agreement in the presence of the Assembly, thereby entering into full covenant relationship with the community.\n\nSECTION 5. BENEFICIAL UNIT ISSUANCE\nUpon signing the PMA Agreement, the new member is issued one (1) Beneficial Unit representing an equal, undivided interest (1/N) in the trust corpus. The Secretary shall record the issuance in the membership register.\n\nSECTION 6. MEMBERSHIP REGISTER\nThe Secretary shall maintain the official membership register, recording:\n(a) Name and class of membership;\n(b) Date of admission;\n(c) Beneficial Unit number;\n(d) Standing (active, provisional, suspended, withdrawn, excommunicated);\n(e) Date of any change in status.' },
          { title: "Article III. Meeting Procedures", content: 'SECTION 1. ANNUAL ASSEMBLY\nThe Annual Assembly Meeting shall be held in the first quarter of each calendar year on a date set by the Elder Council. The agenda shall include:\n(a) Opening prayer and Scripture reading;\n(b) Reading and approval of minutes from the previous Annual Assembly;\n(c) Administrator\'s annual report;\n(d) Treasurer\'s annual financial report;\n(e) Elder Council report;\n(f) Committee reports;\n(g) Election of Officers and Elder Council members (as terms expire);\n(h) Approval of the annual budget;\n(i) Old business;\n(j) New business;\n(k) Closing prayer.\n\nSECTION 2. REGULAR MEETINGS\nRegular meetings shall be held monthly, on such day and at such time as the Elder Council shall establish. The Elder Council shall publish the annual meeting schedule no later than January 31 of each year.\n\nSECTION 3. SPECIAL MEETINGS\nSpecial meetings may be called as provided in the Constitution (Article V, Section 3). The notice of a special meeting shall specify the purpose(s) for which it is called; no other business may be transacted at that meeting.\n\nSECTION 4. NOTICE REQUIREMENTS\n(a) Annual Assembly: At least 30 days written notice;\n(b) Special meetings: At least 7 days written notice;\n(c) Regular meetings: No special notice required if the annual schedule has been published.\n\nNotice may be given by physical posting, mail, electronic communication, or any combination thereof.\n\nSECTION 5. MINUTES\nThe Secretary shall record minutes of all meetings, including:\n(a) Date, time, and location;\n(b) Members present and quorum determination;\n(c) Summary of discussion;\n(d) Exact wording of all motions and resolutions;\n(e) Vote tallies;\n(f) Action items and assignments.\n\nMinutes shall be circulated within 14 days and approved at the next regular meeting.' },
          { title: "Article IV. Voting & Decision-Making", content: 'SECTION 1. VOTING RIGHTS\nEach Active Member and Founding Member in good standing has one (1) vote on all matters brought before the Assembly. Provisional Members may not vote. No member may cast more than one vote on any question.\n\nSECTION 2. QUORUM\nA quorum is a majority (more than 50%) of Active Members in good standing. No binding vote may be taken without a quorum. If a quorum is lost during a meeting, no further binding votes may be taken until a quorum is restored.\n\nSECTION 3. VOTING THRESHOLDS\n(a) SIMPLE MAJORITY (more than 50% of those present and voting): Routine business, admission of members, approval of minutes, regular motions;\n(b) SUPERMAJORITY (⅔ of those present and voting): Amendments to Bylaws, removal of Officers, approval of expenditures exceeding the approved budget, amendments to the Constitution;\n(c) EXTRAORDINARY MAJORITY (¾ of all Active Members): Dissolution of the Assembly.\n\nSECTION 4. VOTING METHOD\nVoting shall ordinarily be by voice vote or show of hands. Any member may request a written ballot on any question. Elections of Officers and Elder Council members shall always be by written ballot.\n\nSECTION 5. PROXY & ABSENTEE VOTING\nProxy voting is not permitted. Absentee voting by written ballot may be permitted for the Annual Assembly only, provided the absentee ballot is submitted in a sealed envelope to the Secretary at least 24 hours before the meeting. The Elder Council may establish procedures for secure electronic voting when physical attendance is impracticable.\n\nSECTION 6. TIE VOTES\nIn the event of a tie vote, the matter is deemed not approved. The presiding officer does not cast a tie-breaking vote unless the presiding officer has not yet voted as a member.' },
          { title: "Article V. Officers", content: 'SECTION 1. ELECTION\nOfficers are elected at the Annual Assembly Meeting by written ballot. Nominations may be made by:\n(a) The Elder Council;\n(b) Any Active Member, provided the nominee consents to nomination.\n\nThe Elder Council shall present a slate of nominees at least 14 days before the Annual Assembly. Additional nominations from the floor are permitted.\n\nSECTION 2. TERMS\nOfficers serve two-year terms beginning immediately upon election. No person may serve more than three (3) consecutive terms in the same office. After a one-year hiatus, a former officer is eligible for re-election.\n\nSECTION 3. QUALIFICATIONS\nAll Officers must:\n(a) Be Active Members in good standing for at least one year;\n(b) Meet the qualifications for deacons set forth in 1 Timothy 3:8-13;\n(c) Demonstrate competence in the specific duties of the office;\n(d) Be free from conflicts of interest (see Article VIII of Trust Bylaws).\n\nSECTION 4. REMOVAL\nAn Officer may be removed as provided in the Constitution (Article VI, Section 4). Prior to a removal vote, the Officer shall be given written notice of the charges and a reasonable opportunity to respond before the Assembly.\n\nSECTION 5. VACANCIES\nVacancies are filled as provided in the Constitution (Article VI, Section 5). An appointed Officer has full authority during the interim period.\n\nSECTION 6. TRANSITION\nOutgoing Officers shall provide a complete transition within 14 days of the election, including transfer of all records, accounts, passwords, and pending matters to the incoming Officer.' },
          { title: "Article VI. Elder Council & Protector Council", content: 'SECTION 1. COMPOSITION\nThe Elder Council shall consist of no fewer than three (3) and no more than seven (7) elders. The exact number shall be determined by the existing Elder Council based on the needs of the Assembly.\n\nSECTION 2. QUALIFICATIONS\nElders must meet the qualifications set forth in 1 Timothy 3:1-7 and Titus 1:5-9, including:\n(a) Above reproach, the husband of one wife, temperate, self-controlled, respectable, hospitable;\n(b) Able to teach, not given to drunkenness, not violent but gentle, not quarrelsome, not a lover of money;\n(c) Managing his own household well;\n(d) Not a recent convert;\n(e) Having a good reputation with outsiders.\n\nAdditionally, elder candidates must have been Active Members in good standing for at least three (3) years.\n\nSECTION 3. SELECTION & TERMS\nElders are nominated by the existing Elder Council and confirmed by a supermajority (⅔) vote of the Assembly. Terms are three (3) years, staggered so that approximately one-third of the Council is renewed each year. There is no term limit for elders, as the office is a calling, not merely a position.\n\nSECTION 4. AUTHORITY\nThe Elder Council has authority to:\n(a) Provide spiritual oversight, teaching, and pastoral care;\n(b) Exercise the Protector function as described in the Constitution;\n(c) Approve or disapprove candidates for membership;\n(d) Oversee the discipline process;\n(e) Appoint interim Officers;\n(f) Call special meetings;\n(g) Establish standing and ad hoc committees.\n\nSECTION 5. MEETINGS\nThe Elder Council shall meet at least monthly. A majority of elders constitutes a quorum. Decisions require a majority vote unless otherwise specified.\n\nSECTION 6. REMOVAL\nAn elder may be removed only upon credible accusation supported by two or three witnesses (1 Timothy 5:19), investigation by the remaining elders, and a supermajority (⅔) vote of the Assembly. An elder under accusation shall be given full opportunity to respond before any action is taken.' },
          { title: "Article VII. Committees", content: 'SECTION 1. STANDING COMMITTEES\nThe following standing committees shall be maintained:\n\n(a) FINANCE COMMITTEE: Assists the Treasurer with budgeting, financial oversight, and the annual audit. Minimum three members, at least one of whom is an elder.\n\n(b) MEMBERSHIP COMMITTEE: Manages the application and orientation process for new members, maintains the membership education program, and assists with membership interviews. Minimum two members.\n\n(c) EDUCATION COMMITTEE: Develops and oversees educational programs, discipleship curricula, and training initiatives for the community. Minimum two members.\n\n(d) BENEVOLENCE COMMITTEE: Evaluates and responds to requests for assistance from members and the broader community. Administers the benevolence fund. Minimum two members.\n\n(e) PROPERTY COMMITTEE: Coordinates with the stewardship organs regarding maintenance, improvement, and stewardship of physical assets used by the Assembly. Minimum two members.\n\nSECTION 2. AD HOC COMMITTEES\nThe Elder Council or the Assembly may establish ad hoc committees for specific purposes and limited duration. The resolution establishing an ad hoc committee shall specify its mandate, membership, and termination date.\n\nSECTION 3. COMMITTEE CHAIR\nEach committee shall have a chairperson appointed by the Elder Council or elected by the committee members. The chairperson is responsible for calling meetings, setting agendas, and reporting to the Elder Council.\n\nSECTION 4. REPORTING\nAll standing committees shall provide a written report to the Elder Council at least quarterly and to the Assembly at the Annual Assembly Meeting. Ad hoc committees shall report upon completion of their mandate.' },
          { title: "Article VIII. Financial Procedures", content: 'SECTION 1. FISCAL YEAR\nThe fiscal year of the Assembly shall be the calendar year (January 1 through December 31), unless otherwise established by the Elder Council.\n\nSECTION 2. BUDGET\nThe Treasurer, in consultation with the Finance Committee, shall prepare an annual budget for approval by the Assembly at the Annual Assembly Meeting. The budget shall include all anticipated income (tithes, offerings, designated gifts) and all planned expenditures.\n\nSECTION 3. TITHE COLLECTION\nTithes and offerings shall be collected at regular meetings and through such other means as the Elder Council may approve. All collections shall be counted by at least two persons and deposited promptly. Records of all contributions shall be maintained by the Treasurer.\n\nSECTION 4. DISBURSEMENT THRESHOLDS\n(a) Expenditures within the approved budget up to $500. Administrator approval;\n(b) Expenditures within the approved budget from $501 to $2,500. Administrator and one elder approval;\n(c) Expenditures within the approved budget exceeding $2,500. Elder Council approval;\n(d) Expenditures exceeding the approved budget: Assembly supermajority (⅔) approval.\n\nSECTION 5. RESERVE FUND\nThe Assembly shall maintain a reserve fund equal to at least 10% of the annual budget. The reserve fund may be used only for emergencies, with the approval of the Elder Council. Any draw on the reserve fund shall be reported to the Assembly at the next regular meeting and replenished within the current fiscal year.\n\nSECTION 6. ANNUAL AUDIT\nAn annual financial audit shall be conducted by the Finance Committee (or an independent audit committee of at least three members who are not Officers) within 60 days of the close of each fiscal year. The audit report shall be presented to the Assembly at the Annual Assembly Meeting.\n\nSECTION 7. REMITTANCES TO BODY\nThe Assembly shall remit to the Body treasury such portion of tithes and offerings as established by the trust instruments and the Elder Council, following the storehouse principle (Malachi 3:10).' },
          { title: "Article IX. Discipline & Dispute Resolution", content: 'SECTION 1. PURPOSE\nDiscipline within the Assembly is restorative, not punitive. Its purpose is the restoration of the offending member to right relationship with God, the community, and the covenant. "Brethren, if a man be overtaken in a fault, ye which are spiritual, restore such an one in the spirit of meekness; considering thyself, lest thou also be tempted" (Galatians 6:1).\n\nSECTION 2. THE MATTHEW 18 PROCESS\nThe following process shall be followed in all cases of covenant violation:\n\nSTEP 1. PRIVATE CONFERENCE (Matthew 18:15)\nThe aggrieved party shall approach the offending member privately, in a spirit of love, to address the matter. This conference should occur within 14 days of the offense becoming known. If the offender repents and makes restitution, the matter is resolved.\n\nSTEP 2. WITNESSES (Matthew 18:16)\nIf the private conference does not resolve the matter, the aggrieved party shall bring one or two witnesses (preferably elders or mature members) to a second conference within 7 days of the failed private conference.\n\nSTEP 3. ELDER COUNCIL HEARING (Matthew 18:17)\nIf the matter remains unresolved, it shall be brought before the Elder Council for formal hearing. The Elder Council shall hear both parties, examine witnesses, and render a binding decision within 30 days.\n\nSTEP 4. SUSPENSION\nIf the offender refuses to submit to the Elder Council\'s decision, the Elder Council may suspend the member\'s voting rights, committee service, and other privileges for a period not to exceed 90 days, during which the member is urged to repentance.\n\nSTEP 5. EXCOMMUNICATION\nIf the offender remains unrepentant after the suspension period, the Elder Council may recommend excommunication to the Assembly. Excommunication requires a supermajority (⅔) vote of the Assembly.\n\nSECTION 3. RESTORATION\nA member who has been excommunicated may apply for restoration after a minimum period of six (6) months. Restoration requires:\n(a) Evidence of genuine repentance;\n(b) Completion of any restitution required by the Elder Council;\n(c) A recommendation from at least two elders;\n(d) A simple majority vote of the Assembly.\n\nA restored member re-enters as a Provisional Member and must complete a 90-day probationary period before restoration to Active Membership.' },
          { title: "Article X. Records & Transparency", content: 'SECTION 1. REQUIRED RECORDS\nThe Assembly shall maintain the following records:\n(a) This Constitution and these Bylaws, with all amendments;\n(b) Minutes of all Assembly meetings (annual, regular, and special);\n(c) Minutes of Elder Council meetings;\n(d) The membership register;\n(e) Financial records, including all receipts, disbursements, and account statements;\n(f) Committee reports;\n(g) Correspondence with external parties;\n(h) All trust documents, charters, and agreements.\n\nSECTION 2. MEMBER ACCESS\nAny Active Member in good standing may inspect the non-confidential records of the Assembly during reasonable hours, upon 7 days written notice to the Secretary. The Secretary may designate reasonable times and conditions for inspection.\n\nSECTION 3. CONFIDENTIAL RECORDS\nThe following records are confidential and may not be inspected except by the Elder Council or by order of the Elder Council:\n(a) Discipline proceedings and records;\n(b) Benevolence applications and records;\n(c) Individual contribution records;\n(d) Personnel matters;\n(e) Any record designated confidential by the Elder Council for cause.\n\nSECTION 4. RETENTION PERIODS\n(a) Governing documents (Constitution, Bylaws, trust instruments): Permanent;\n(b) Meeting minutes: Permanent;\n(c) Financial records: Minimum 7 years;\n(d) Membership records: Duration of membership plus 7 years;\n(e) Discipline records: 10 years after final disposition;\n(f) Correspondence: 3 years.\n\nSECTION 5. DIGITAL RECORDS\nThe Assembly may maintain records in digital format, provided adequate backup and security measures are in place. The Secretary is responsible for ensuring the integrity and accessibility of all digital records.' },
          { title: "Article XI. Amendment Procedure", content: 'SECTION 1. PROPOSAL\nAmendments to these Bylaws may be proposed by:\n(a) Any Active Member, by written proposal submitted to the Secretary;\n(b) The Elder Council, by majority vote.\n\nSECTION 2. ELDER REVIEW\nAll proposed amendments shall be reviewed by the Elder Council within 30 days of submission. The Elder Council shall:\n(a) Confirm the proposal does not conflict with the Constitution, Declaration of Trust, or Scripture;\n(b) Recommend approval, modification, or rejection;\n(c) Forward the proposal (with recommendation) to the Assembly.\n\nThe Elder Council may not permanently block a properly submitted proposal; it must be presented to the Assembly even if the Elder Council recommends rejection.\n\nSECTION 3. NOTICE\nThe full text of the proposed amendment, together with the Elder Council\'s recommendation, shall be distributed to all Active Members at least 21 days before the meeting at which it will be considered.\n\nSECTION 4. APPROVAL\nAdoption of a Bylaw amendment requires a supermajority (⅔) vote of Active Members present at a duly called meeting at which a quorum is established.\n\nSECTION 5. EFFECTIVE DATE\nAmendments take effect immediately upon adoption, unless the amendment itself specifies a later effective date.\n\nSECTION 6. RECORDING\nAll adopted amendments shall be incorporated into these Bylaws and the date of adoption noted. The Secretary shall distribute the updated Bylaws to all Active Members within 14 days of adoption.' },
          { title: "Signatures & Attestation", content: 'IN WITNESS WHEREOF, the Assembly of "{{entity.name}}" hereby adopts these Bylaws on {{date}}.\n\nADMINISTRATOR:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nSECRETARY:\n____________________________________\nDate: _______________\n\nTREASURER:\n____________________________________\nDate: _______________\n\nELDER COUNCIL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nELDER:\n____________________________________\nDate: _______________\n\nELDER:\n____________________________________\nDate: _______________\n\n"This is the thing which the LORD hath commanded" (Exodus 35:4).' },
        ],
      },

      // ═══════════════════════════════════════════════════════════════════════════
      // 37. TRUST BYLAWS: Body Layer
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Trust Bylaws",
        description: "Operational governance rules for the Body-layer trust: trustee duties, Protector Council procedures, financial administration, beneficial units",
        layers: ["body"],
        sections: [
          { title: "Scripture Preamble", content: '"Moreover it is required in stewards, that a man be found faithful."\n— 1 Corinthians 4:2\n\n"Who then is that faithful and wise steward, whom his lord shall make ruler over his household, to give them their portion of meat in due season?"\n— Luke 12:42\n\n"As every man hath received the gift, even so minister the same one to another, as good stewards of the manifold grace of God."\n— 1 Peter 4:10\n\n"Be thou diligent to know the state of thy flocks, and look well to thy herds."\n— Proverbs 27:23' },
          { title: "Recitals", content: 'WHEREAS, the Declaration of Trust of "{{entity.name}}" has been duly established as an irrevocable express trust under common law, setting forth the foundational terms, purpose, and structure of the trust;\n\nWHEREAS, the effective administration of the trust requires detailed operational procedures governing the conduct of trustees, protectors, and all fiduciary agents;\n\nWHEREAS, these Trust Bylaws are adopted to implement the provisions of the Declaration of Trust and to establish detailed procedures for the faithful stewardship of the trust corpus and the governance of trust affairs;\n\nWHEREAS, these Bylaws are subordinate to and must be read in conjunction with the Declaration of Trust, which remains the supreme governing instrument of the trust;\n\nWHEREAS, the Apostle Paul instructed that stewards must be "found faithful" (1 Corinthians 4:2), and the Lord requires accountability of all who are entrusted with His resources (Luke 12:42-48);\n\nNOW, THEREFORE, these Trust Bylaws are adopted on {{date}} by the Protector Council and Trustee of "{{entity.name}}" to govern the operational administration of the trust.' },
          { title: "Article I. Definitions & Interpretation", content: 'For the purposes of these Trust Bylaws, the following terms shall have the meanings set forth below:\n\nTRUST. The irrevocable express trust known as "{{entity.name}}", established under common law by the Declaration of Trust.\n\nDECLARATION. The Declaration of Trust, the foundational instrument establishing the trust, its purpose, terms, and restrictions.\n\nTRUSTEE. The individual or body appointed to hold legal title to trust property and administer the trust in accordance with the Declaration and these Bylaws. Current Trustee: {{entity.trusteeLabel}}\n\nPROTECTOR COUNCIL. The body of elders serving as the oversight, accountability, and check-and-balance authority over the Trustee. Current Protector Council: {{entity.protectorLabel}}\n\nSTEWARDSHIP ORGAN. A subordinate trust or entity created to carry out a specific operational mandate within the trust ecosystem (e.g., land stewardship, treasury, housing, enterprise, education).\n\nBENEFICIAL UNIT: A single unit of beneficial interest representing an equal, undivided share (1/N) in the trust corpus, issued to each covenant member in good standing.\n\nCORPUS. The total body of trust property, including all real property, personal property, financial assets, intellectual property, and all increase thereof.\n\nFIDUCIARY DUTY. The legal and moral obligation of the Trustee and Protector Council to act in the best interests of the beneficiaries, with loyalty, care, and impartiality.\n\nMATTHEW 18 PROTOCOL: The dispute resolution and discipline process prescribed by Christ in Matthew 18:15-20, adopted as the exclusive internal dispute resolution mechanism.\n\nRULES OF INTERPRETATION:\n(a) These Bylaws shall be interpreted in harmony with the Declaration of Trust. In case of conflict, the Declaration prevails.\n(b) Scripture references are to the King James Version unless otherwise noted.\n(c) Headings and section titles are for convenience and do not affect interpretation.\n(d) "Shall" indicates a mandatory obligation; "may" indicates discretion.' },
          { title: "Article II. Trustee Appointment & Removal", content: 'SECTION 1. QUALIFICATIONS\nThe Trustee must:\n(a) Meet the qualifications for overseers set forth in 1 Timothy 3:1-7, being above reproach, temperate, self-controlled, respectable, and not a lover of money;\n(b) Have been an Active Member of the covenant community in good standing for at least three (3) years;\n(c) Demonstrate competence in financial stewardship, record-keeping, and organizational administration;\n(d) Have no conflicts of interest as defined in Article XI of these Bylaws;\n(e) Be willing to submit to the oversight of the Protector Council and to regular accountability reviews.\n\nSECTION 2. APPOINTMENT\nThe Trustee is appointed by the Protector Council, with confirmation by a supermajority (⅔) vote of the Assembly. The appointment process shall include:\n(a) Nomination by the Protector Council;\n(b) Publication of the nominee\'s qualifications to the Assembly, with at least 21 days for review;\n(c) An opportunity for any member to raise objections or concerns;\n(d) Confirmation vote at a duly called Assembly meeting.\n\nSECTION 3. TERM\nThe Trustee serves a five-year term, renewable by the same process as the original appointment. There is no limit on the number of terms, as the office is a stewardship calling.\n\nSECTION 4. REMOVAL\nThe Trustee may be removed for cause by the Protector Council. Grounds for removal include:\n(a) Breach of fiduciary duty;\n(b) Self-dealing or personal enrichment from trust assets;\n(c) Moral failure as defined by the covenant charter;\n(d) Incapacity or sustained inability to perform duties;\n(e) Conviction of any crime involving dishonesty or moral turpitude;\n(f) Refusal to submit to Protector oversight or accountability.\n\nThe removal process requires:\n(a) Written charges presented to the Trustee with at least 30 days to respond;\n(b) A formal hearing before the Protector Council;\n(c) A two-thirds (⅔) vote of the Protector Council;\n(d) Notification to the Assembly.\n\nSECTION 5. INTERIM TRUSTEE\nUpon removal, resignation, incapacity, or death of the Trustee, the Protector Council shall appoint an interim Trustee within 14 days to serve until a permanent successor is appointed through the regular process.' },
          { title: "Article III. Trustee Duties & Powers", content: 'SECTION 1. FIDUCIARY DUTIES\nThe Trustee owes the following fiduciary duties to the beneficiaries:\n\n(a) DUTY OF LOYALTY. The Trustee shall administer the trust solely in the interest of the beneficiaries, never for personal advantage. "No man can serve two masters" (Matthew 6:24).\n\n(b) DUTY OF CARE. The Trustee shall exercise the care, skill, and diligence that a person of ordinary prudence would exercise in managing their own affairs, with additional care commensurate with the sacred character of the trust.\n\n(c) DUTY OF IMPARTIALITY. The Trustee shall treat all beneficiaries fairly and impartially, without favoritism or discrimination. "My brethren, have not the faith of our Lord Jesus Christ, the Lord of glory, with respect of persons" (James 2:1).\n\n(d) DUTY TO INFORM. The Trustee shall keep the Protector Council and beneficiaries reasonably informed of trust affairs and shall respond promptly to reasonable requests for information.\n\n(e) DUTY TO ACCOUNT. The Trustee shall maintain complete and accurate records and shall render periodic accountings as required by these Bylaws.\n\nSECTION 2. SPECIFIC POWERS\nThe Trustee is authorized to:\n(a) Receive, hold, and administer all trust property;\n(b) Open and maintain trust accounts;\n(c) Make distributions to beneficiaries in accordance with the Declaration and these Bylaws;\n(d) Execute documents on behalf of the trust;\n(e) Employ agents, advisors, and service providers as necessary;\n(f) Create subordinate stewardship organs with Protector Council approval;\n(g) Invest trust funds in accordance with the investment policy (Article VI).\n\nSECTION 3. LIMITATIONS\nThe Trustee may NOT, without prior written Protector Council approval:\n(a) Sell, encumber, or dispose of real property;\n(b) Incur debt or obligations exceeding the approved budget;\n(c) Make distributions exceeding established thresholds;\n(d) Amend any trust instrument;\n(e) Create or dissolve any stewardship organ.\n\nSECTION 4. PROHIBITED ACTS\nThe Trustee is absolutely prohibited from:\n(a) SELF-DEALING. Any transaction in which the Trustee has a personal financial interest;\n(b) COMMINGLING. Mixing trust funds with personal funds or the funds of any other entity;\n(c) SPECULATION. Investing trust funds in speculative or high-risk ventures;\n(d) DELEGATION OF FIDUCIARY JUDGMENT. Delegating the core fiduciary decision-making to any third party;\n(e) BORROWING. Borrowing from the trust corpus or pledging trust assets as collateral for personal obligations.' },
          { title: "Article IV. Protector Council", content: 'SECTION 1. COMPOSITION\nThe Protector Council shall consist of no fewer than three (3) and no more than nine (9) members. The exact number shall be determined by the existing Council based on the needs of the trust and the size of the community.\n\nSECTION 2. QUALIFICATIONS\nProtector Council members must meet the qualifications set forth in Titus 1:5-9:\n(a) Blameless, the husband of one wife, having faithful children;\n(b) Not self-willed, not soon angry, not given to wine, no striker, not given to filthy lucre;\n(c) A lover of hospitality, a lover of good men, sober, just, holy, temperate;\n(d) Holding fast the faithful word as taught, able by sound doctrine both to exhort and to convince the gainsayers.\n\nAdditionally, Protector candidates must have been Active Members in good standing for at least five (5) years and must demonstrate wisdom, discernment, and a heart for the welfare of the community.\n\nSECTION 3. SELECTION & TERMS\nProtector Council members are selected by the existing Council and confirmed by a supermajority (⅔) vote of the Assembly. Terms are three (3) years, staggered so that approximately one-third of the Council is renewed each year. There is no term limit.\n\nSECTION 4. POWERS & DUTIES\nThe Protector Council:\n(a) Oversees the Trustee\'s administration of the trust;\n(b) Reviews and approves or vetoes major decisions as specified in the Declaration and these Bylaws;\n(c) Appoints and removes the Trustee;\n(d) Approves the creation and dissolution of stewardship organs;\n(e) Approves amendments to trust instruments (subject to the restrictions in Article XII);\n(f) Serves as the final arbiter of disputes escalated through the Matthew 18 Protocol;\n(g) Conducts annual reviews of the Trustee\'s performance;\n(h) Ensures compliance with the covenant purpose and Scripture.\n\nSECTION 5. VOTING\n(a) Routine oversight matters: Simple majority;\n(b) Trustee appointment or removal: Two-thirds (⅔) majority;\n(c) Amendment of trust instruments: Two-thirds (⅔) majority;\n(d) Veto of Assembly decisions: Two-thirds (⅔) majority;\n(e) Dissolution approval: Unanimous consent.\n\nSECTION 6. REMOVAL OF PROTECTORS\nA Protector may be removed upon credible accusation supported by two or three witnesses (1 Timothy 5:19), investigation by the remaining Protectors, and a supermajority (⅔) vote of the Assembly. Due process protections apply as with elder removal.' },
          { title: "Article V. Stewardship Organ Governance", content: 'SECTION 1. CREATION\nStewardship organs are subordinate trusts or entities created to carry out specific operational mandates within the trust ecosystem. A stewardship organ may be created by the Trustee with the written approval of the Protector Council. The creating resolution shall specify:\n(a) The name and mandate of the stewardship organ;\n(b) The scope of its authority;\n(c) The initial steward (trustee of the sub-trust);\n(d) Reporting requirements;\n(e) Financial parameters and budget allocation.\n\nSECTION 2. EXISTING STEWARDSHIP ORGANS\n{{children.list}}\n\nOversight responsibilities:\n{{oversight.targets}}\n\nSECTION 3. STEWARD APPOINTMENT\nEach stewardship organ is led by a steward appointed by the Trustee with Protector Council approval. Stewards must meet the qualifications set forth in 1 Timothy 3:8-13 and must have relevant competence in their area of stewardship.\n\nSECTION 4. OPERATIONAL MANDATES\nEach stewardship organ operates under a written mandate that defines its scope, authority, and limitations. No stewardship organ may act beyond its mandate without prior approval from the Trustee and Protector Council.\n\nSECTION 5. REPORTING\nEach stewardship organ shall:\n(a) Submit monthly financial reports to the Trustee;\n(b) Submit quarterly operational reports to the Protector Council;\n(c) Submit an annual report for presentation at the Annual Assembly;\n(d) Immediately report any emergency, breach, or significant deviation from mandate.\n\nSECTION 6. DISSOLUTION\nA stewardship organ may be dissolved by the Trustee with Protector Council approval. Upon dissolution, all assets and records revert to the Body trust. The dissolution resolution shall specify the transition plan and timeline.' },
          { title: "Article VI. Financial Administration", content: 'SECTION 1. INVESTMENT POLICY\nTrust funds shall be invested conservatively, with the primary objectives of:\n(a) Preservation of the trust corpus;\n(b) Provision of income for the needs of the community;\n(c) Moderate growth to maintain purchasing power.\n\nProhibited investments: speculative instruments, derivatives, margin trading, short selling, or any investment inconsistent with the covenant values of the community.\n\nSECTION 2. RESERVE REQUIREMENT\nThe trust shall maintain a liquid reserve fund equal to at least 10% of the total annual operating budget. The reserve fund is intended for emergencies and shall not be used for routine operations.\n\nSECTION 3. DISTRIBUTION THRESHOLDS\n(a) Routine distributions within approved budget: Trustee authority;\n(b) Distributions between $1,000 and $10,000 outside budget. Trustee plus one Protector;\n(c) Distributions exceeding $10,000 outside budget. Protector Council majority;\n(d) Distributions exceeding 5% of the corpus: Protector Council supermajority (⅔) plus Assembly notification.\n\nSECTION 4. TITHE ALLOCATION\nTithes received from members and subordinate entities shall be allocated according to the following formula, as adjusted annually by the Protector Council:\n(a) Community operations and ministry: percentage as determined by the Protector Council;\n(b) Benevolence fund: minimum 10% of total tithe receipts;\n(c) Education and discipleship: minimum 5% of total tithe receipts;\n(d) Reserve fund replenishment: as needed to maintain the 10% reserve requirement;\n(e) Remittance to parent trust: as specified in the trust instruments.\n\nTithe sources: {{tithe.sources}}\nFunding sources: {{funding.sources}}\n\nSECTION 5. EMERGENCY PROCEDURES\nIn the event of a financial emergency (natural disaster, sudden loss of income, urgent community need), the Trustee may, with the approval of any two (2) Protectors:\n(a) Draw upon the reserve fund;\n(b) Redirect budgeted funds to emergency purposes;\n(c) Issue emergency assessments (voluntary, not mandatory) to members.\n\nAll emergency actions must be ratified by the full Protector Council within 7 days and reported to the Assembly at the next meeting.\n\nSECTION 6. ANNUAL AUDIT\nAn annual financial audit shall be conducted within 90 days of the close of each fiscal year. The audit shall be performed by a committee of at least three members who are not the Trustee or Officers. The audit report shall be presented to the Protector Council and the Assembly.' },
          { title: "Article VII. Beneficial Unit Administration", content: 'SECTION 1. ISSUANCE\nOne (1) Beneficial Unit is issued to each covenant member upon completion of the admission process and signing of the PMA Agreement. Beneficial Units are recorded in the trust register maintained by the Trustee.\n\nSECTION 2. REGISTER\nThe Trustee shall maintain a current register of all Beneficial Units, recording:\n(a) Unit number;\n(b) Date of issuance;\n(c) Name of the holder;\n(d) Status (active, suspended, revoked);\n(e) Date of any change in status.\n\nSECTION 3. CALCULATION OF INTEREST\nEach Beneficial Unit represents an equal, undivided interest of 1/N in the trust corpus, where N is the total number of active Beneficial Units outstanding. As members are added or removed, the value of each unit adjusts proportionally. No member has a claim to any specific trust asset.\n\nSECTION 4. NON-TRANSFERABLE\nBeneficial Units are strictly non-transferable. They may not be sold, assigned, pledged, hypothecated, gifted, or otherwise transferred to any person or entity. Any attempted transfer is void and of no effect.\n\nSECTION 5. REVOCATION\nA Beneficial Unit is revoked upon:\n(a) Voluntary withdrawal of the member;\n(b) Excommunication after completion of the discipline process;\n(c) Death of the member (the unit does not pass to heirs or estate).\n\nUpon revocation, the unit reverts to the trust corpus and is retired. The departing or deceased member (or their estate) has no claim against the trust or any trust asset.\n\nSECTION 6. SUSPENSION DURING DISCIPLINE\nDuring the suspension phase of the discipline process (Article IX of PMA Bylaws, Step 4), a member\'s Beneficial Unit remains in force but the member\'s right to participate in distributions (other than basic necessities) may be suspended by the Elder Council. Upon restoration, full rights resume. Upon excommunication, the unit is revoked.' },
          { title: "Article VIII. Trust Meetings", content: 'SECTION 1. ANNUAL TRUST MEETING\nThe Trustee shall convene an Annual Trust Meeting within the first quarter of each calendar year to:\n(a) Present the annual financial report and audit results;\n(b) Report on the status of all stewardship organs;\n(c) Present the proposed annual budget;\n(d) Address questions from beneficiaries;\n(e) Conduct such other trust business as may be necessary.\n\nSECTION 2. QUARTERLY REVIEWS\nThe Trustee shall convene quarterly review meetings with the Protector Council to:\n(a) Review financial performance against budget;\n(b) Review stewardship organ reports;\n(c) Address any governance concerns;\n(d) Plan for upcoming needs and initiatives.\n\nSECTION 3. SPECIAL MEETINGS\nSpecial trust meetings may be called by:\n(a) The Trustee;\n(b) A majority of the Protector Council;\n(c) Written petition of 25% of beneficiaries.\n\nSECTION 4. QUORUM\nFor the Annual Trust Meeting and special meetings open to beneficiaries, a quorum is a majority of Active Members. For Protector Council meetings, a quorum is a majority of Council members.\n\nSECTION 5. NOTICE\n(a) Annual Trust Meeting: 30 days written notice;\n(b) Quarterly reviews: 14 days notice;\n(c) Special meetings: 7 days written notice, stating the purpose.\n\nSECTION 6. CONDUCT\nAll trust meetings shall be opened and closed with prayer. "For where two or three are gathered together in my name, there am I in the midst of them" (Matthew 18:20). Proceedings shall be recorded in minutes maintained by the Secretary or a designated recorder.' },
          { title: "Article IX. Records, Reporting & Transparency", content: 'SECTION 1. BOOKS OF ACCOUNT\nThe Trustee shall maintain complete and accurate books of account, including:\n(a) A general ledger recording all trust transactions;\n(b) A register of all trust property (real, personal, financial);\n(c) A register of all Beneficial Units;\n(d) Records of all distributions to beneficiaries;\n(e) Records of all receipts, including tithes, offerings, and other income;\n(f) Bank statements and reconciliations;\n(g) Investment records.\n\nSECTION 2. ANNUAL REPORT\nThe Trustee shall prepare an annual report within 90 days of the close of each fiscal year, containing:\n(a) A statement of trust assets and liabilities;\n(b) A statement of receipts and disbursements;\n(c) A summary of stewardship organ operations;\n(d) The Protector Council\'s assessment of trust administration;\n(e) Plans and priorities for the coming year.\n\nThe annual report shall be made available to all beneficiaries.\n\nSECTION 3. MEMBER ACCESS\nAny beneficiary in good standing may inspect the non-confidential trust records during reasonable hours, upon 14 days written notice to the Trustee. The Trustee shall provide copies upon reasonable request. Confidential records (discipline proceedings, individual contribution records, security information) are accessible only to the Protector Council.\n\nSECTION 4. DIGITAL PLATFORM\nThe trust shall maintain a digital platform or record-keeping system that provides beneficiaries with reasonable access to:\n(a) Current financial summaries;\n(b) Meeting minutes and announcements;\n(c) Governing documents;\n(d) Their individual Beneficial Unit status.\n\nThe Trustee shall ensure the security, backup, and integrity of all digital records.' },
          { title: "Article X. Indemnification", content: 'SECTION 1. SCOPE OF INDEMNIFICATION\nThe trust shall indemnify and hold harmless each Trustee, Protector Council member, Officer, steward, and authorized agent of the trust ("Covered Person") from and against any and all claims, losses, damages, liabilities, and reasonable expenses (including legal fees) arising from actions taken in good faith in the course of their service to the trust.\n\nSECTION 2. STANDARD OF CONDUCT\nIndemnification is available only to a Covered Person who:\n(a) Acted in good faith and in a manner reasonably believed to be in the best interests of the trust and its beneficiaries;\n(b) Had no reasonable cause to believe the conduct was unlawful;\n(c) Did not engage in self-dealing, fraud, willful misconduct, or gross negligence.\n\nSECTION 3. EXCLUSIONS\nIndemnification shall NOT be provided for:\n(a) Acts of self-dealing or personal enrichment;\n(b) Willful misconduct or gross negligence;\n(c) Knowing violation of the Declaration of Trust or these Bylaws;\n(d) Criminal conduct;\n(e) Actions taken outside the scope of the Covered Person\'s authority.\n\nSECTION 4. ADVANCEMENT OF EXPENSES\nThe trust may advance reasonable expenses to a Covered Person defending against a claim, provided the Covered Person agrees in writing to repay such advances if it is ultimately determined that indemnification is not warranted.\n\nSECTION 5. DETERMINATION\nThe Protector Council shall determine whether a Covered Person is entitled to indemnification, applying the standards set forth in this Article. A Covered Person who is a member of the Protector Council shall recuse from any determination involving their own indemnification.' },
          { title: "Article XI. Conflict of Interest", content: 'SECTION 1. DEFINITION\nA conflict of interest exists when a Covered Person (Trustee, Protector, Officer, or steward) has a direct or indirect financial interest, family relationship, or other personal interest that could reasonably be expected to influence their judgment or actions in a matter before the trust.\n\n"No man can serve two masters: for either he will hate the one, and love the other; or else he will hold to the one, and despise the other. Ye cannot serve God and mammon."\n— Matthew 6:24\n\nSECTION 2. DISCLOSURE\nAny Covered Person who becomes aware of an actual or potential conflict of interest must immediately disclose it in writing to:\n(a) The Protector Council (if the conflicted person is the Trustee or an Officer);\n(b) The full Protector Council (if the conflicted person is a Protector).\n\nDisclosure must include the nature of the interest, the parties involved, and the anticipated financial or personal impact.\n\nSECTION 3. RECUSAL\nA conflicted person must recuse from:\n(a) All discussion of the matter in which the conflict exists;\n(b) All voting on the matter;\n(c) Any attempt to influence the decision of others on the matter.\n\nRecusal shall be recorded in the minutes.\n\nSECTION 4. ANNUAL STATEMENT\nEach Covered Person shall submit an annual conflict-of-interest disclosure statement to the Protector Council, listing all outside financial interests, business relationships, and family relationships that could potentially create a conflict. Statements shall be reviewed by the Protector Council and kept on file.\n\nSECTION 5. CONSEQUENCES\nFailure to disclose a known conflict of interest, or participation in a decision in which a conflict exists, constitutes a breach of fiduciary duty and may result in:\n(a) Removal from office;\n(b) Voiding of the affected transaction;\n(c) Requirement to disgorge any personal benefit received;\n(d) Discipline under the Matthew 18 Protocol.' },
          { title: "Article XII. Amendment", content: 'SECTION 1. PROPOSAL\nAmendments to these Trust Bylaws may be proposed by:\n(a) The Protector Council, by majority vote;\n(b) The Trustee, with the endorsement of at least one Protector;\n(c) Written petition of 25% of beneficiaries.\n\nSECTION 2. NOTICE\nThe full text of any proposed amendment must be distributed to all Protector Council members and beneficiaries at least 30 days before the meeting at which it will be considered.\n\nSECTION 3. APPROVAL\nAdoption of a Trust Bylaw amendment requires:\n(a) A two-thirds (⅔) vote of the Protector Council; AND\n(b) A two-thirds (⅔) vote of the Assembly (beneficiaries present and voting at a duly called meeting with quorum).\n\nBoth approvals must be obtained; neither alone is sufficient.\n\nSECTION 4. RESTRICTIONS ON CORE PROVISIONS\nThe following provisions of these Bylaws may not be amended:\n(a) The fiduciary duties of the Trustee (Article III, Section 1);\n(b) The prohibited acts of the Trustee (Article III, Section 4);\n(c) The non-transferable character of Beneficial Units (Article VII, Section 4);\n(d) The Matthew 18 Protocol as the exclusive dispute resolution mechanism;\n(e) The requirement of Protector Council oversight.\n\nAny amendment that would effectively modify these core provisions is void and of no effect, regardless of the vote.\n\nSECTION 5. CONSISTENCY\nNo amendment may conflict with the Declaration of Trust. In the event of any conflict between an adopted amendment and the Declaration, the Declaration prevails and the amendment is void to the extent of the conflict.\n\nSECTION 6. RECORDING\nAll adopted amendments shall be incorporated into these Bylaws with the date of adoption noted. The Trustee shall distribute updated Bylaws to all Protectors and beneficiaries within 14 days.' },
          { title: "Signatures & Attestation", content: 'IN WITNESS WHEREOF, the Trustee and Protector Council of "{{entity.name}}" hereby adopt these Trust Bylaws on {{date}}.\n\nTRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nPROTECTOR:\n____________________________________\nDate: _______________\n\nPROTECTOR:\n____________________________________\nDate: _______________\n\nSECRETARY (Witness):\n____________________________________\nDate: _______________\n\n"It is required in stewards, that a man be found faithful" (1 Corinthians 4:2).' },
        ],
      },
      // ═══════════════════════════════════════════════════════════════════════════
      // 38. BENEFICIARY ACCEPTANCE & ACKNOWLEDGMENT
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Beneficiary Acceptance & Acknowledgment",
        description: "Formal acceptance by a beneficiary of their role, rights, and covenant obligations within the trust",
        layers: ["covenant", "member"],
        sections: [
          { title: "Scripture Preamble", content: '"And if children, then heirs; heirs of God, and joint-heirs with Christ; if so be that we suffer with him, that we may be also glorified together."\n— Romans 8:17\n\n"Blessed be the God and Father of our Lord Jesus Christ, which according to his abundant mercy hath begotten us again unto a lively hope by the resurrection of Jesus Christ from the dead, To an inheritance incorruptible, and undefiled, and that fadeth not away, reserved in heaven for you."\n— 1 Peter 1:3-4\n\n"The Spirit itself beareth witness with our spirit, that we are the children of God."\n— Romans 8:16' },
          { title: "Preamble & Recitals", content: 'BENEFICIARY ACCEPTANCE AND ACKNOWLEDGMENT\n\nDate: {{date}}\nTrust: {{entity.name}}\nAuthority Chain: {{authority.chain}}\n\nWHEREAS, the New Covenant, as set forth in the Holy Scriptures, is the pre-existing Trust Instrument — the divine legal framework established by God (Jeremiah 31:31-34, Hebrews 8:8-12), sealed by the blood of Christ the Testator (Hebrews 9:16-17), and administered by Christ as eternal High Priest and Mediator (Hebrews 7:24-25, Hebrews 9:15, 12:24);\n\nWHEREAS, the individual\'s acceptance of the New Covenant constitutes both the granting act (making the individual the Grantor) AND the acceptance of beneficial interest (making the Grantor simultaneously a Beneficiary — heir of God, joint-heir with Christ, Romans 8:17);\n\nWHEREAS, the Declaration of Trust of "{{entity.name}}" has been duly established as an irrevocable express trust under common law, memorializing the Grantor\'s acceptance of the pre-existing New Covenant;\n\nWHEREAS, the undersigned, having accepted the New Covenant by faith, confession, and baptism, is both Grantor and Beneficiary of said Trust, entitled to beneficial interest in the trust corpus;\n\nWHEREAS, the New Covenant provides that all who are in Christ are heirs of God and joint-heirs with Christ (Romans 8:17), possessing an inheritance that is incorruptible, undefiled, and unfading (1 Peter 1:4);\n\nWHEREAS, the granting act of acceptance carries with it both the irrevocable deposit (Grantor capacity) and the receipt of beneficial interest (Beneficiary capacity), together with covenant obligations;\n\nWHEREAS, the Beneficiary desires to formally acknowledge and accept their role within the trust, recognizing that this role was conferred by the granting act of accepting the New Covenant;\n\nNOW, THEREFORE, the undersigned Beneficiary makes the following declarations and acknowledgments.' },
          { title: "Role Acknowledgment", content: 'The Beneficiary acknowledges the following roles and their distinctions:\n\nGRANTOR / SETTLOR: The individual who accepted the New Covenant. By this acceptance — the granting act — they became the Grantor, irrevocably depositing the old man (death with Christ, Romans 6:3-4), the body (temple of the Holy Spirit, 1 Corinthians 6:19-20), and all property into the trust. The Grantor did not create a new trust but entered the pre-existing divine trust framework (the New Covenant). The Grantor has permanently and irrevocably divested all right, title, and interest in the trust corpus by the act of accepting the New Covenant. The Grantor simultaneously became Beneficiary — heir of God, joint-heir with Christ (Romans 8:17).\n\nTRUSTEE: {{entity.trusteeLabel}}\nThe Trustee holds legal title to all trust property and administers it according to the covenant purpose, the Declaration of Trust, and the direction of the Protector Council. The Trustee is a fiduciary, accountable first to God, then to the Protector Council and Beneficiaries.\n\nBENEFICIARY: The undersigned\nThe Beneficiary holds equitable beneficial interest in the trust corpus through the Beneficial Unit system. This interest was conferred simultaneously with the granting act of accepting the New Covenant. This interest is not ownership but stewardship; the right to beneficial use according to the covenant purpose.\n\nPROTECTOR COUNCIL: {{entity.protectorLabel}}\nThe Protector Council serves as the oversight body, ensuring the Trustee faithfully administers the trust according to its terms and the New Covenant (the Trust Instrument).\n\nGOD: The Architect and Author of the New Covenant — the Trust Instrument (Jeremiah 31:31-34, Hebrews 8:8-12).\n\nCHRIST: The Testator whose death activated the testament (Hebrews 9:16-17), the Mediator of the New Covenant (Hebrews 9:15, 12:24), and the eternal High Priest administering the covenant (Hebrews 7:24-25).\n\nHOLY SPIRIT: The Executor, Seal, and Guarantor of the New Covenant (Ephesians 1:13-14, 2 Corinthians 1:21-22).' },
          { title: "Declaration of Acceptance", content: 'I, the undersigned, hereby declare:\n\n1. I ACCEPT the beneficial interest in the trust corpus of "{{entity.name}}" as described in the Declaration of Trust and Certificate of Beneficial Interest.\n\n2. I UNDERSTAND that my beneficial interest is represented by one (1) Beneficial Unit, constituting an equal, undivided share (1/N) of the trust corpus.\n\n3. I ACKNOWLEDGE that this beneficial interest is equitable in nature; I hold no legal title to any specific trust asset.\n\n4. I ACCEPT the covenant purpose of the trust as my own and commit to living in accordance with its terms.\n\n5. I UNDERSTAND that my beneficial interest is contingent upon active covenant participation and good standing within the community.\n\n6. I VOLUNTARILY enter into this covenant relationship with full knowledge of its terms, obligations, and blessings.' },
          { title: "Spendthrift Acknowledgment", content: 'I acknowledge and affirm the SPENDTHRIFT PROVISIONS protecting my beneficial interest:\n\n• My beneficial interest is NON-TRANSFERABLE. I cannot sell, trade, pledge, assign, or hypothecate it\n• My beneficial interest is NON-ATTACHABLE: no creditor, judgment holder, or government agency may seize, garnish, or levy upon it\n• My beneficial interest does NOT pass to heirs upon death; it reverts to the trust corpus\n• My beneficial interest is NOT marital property subject to equitable distribution in divorce\n• My beneficial interest is NOT an asset of my personal estate for bankruptcy purposes\n\nI understand that these protections exist because I do not OWN the interest. I am the designated recipient of the trust\'s provision, at the Trustee\'s discretion, according to the covenant purpose.\n\nI WAIVE any right to alienate, encumber, or transfer my beneficial interest, and I agree that any attempted transfer is void and of no effect.\n\n"For we brought nothing into this world, and it is certain we can carry nothing out" (1 Timothy 6:7).' },
          { title: "Affirmation of Covenant", content: 'I solemnly affirm and hereby record the granting act:\n\nI hereby affirm that I have accepted the New Covenant as set forth in the Holy Scriptures, and by this acceptance I have irrevocably granted and deposited the old man (my former identity, dead with Christ through baptism, Romans 6:3-4), the body (the temple of the Holy Spirit, 1 Corinthians 6:19-20), and all property, labor, and increase into the trust. This acceptance is the granting act that makes me the Grantor and simultaneously the Beneficiary — heir of God, joint-heir with Christ (Romans 8:17).\n\nI further affirm:\n• I have read and understood the Declaration of Trust, the PMA Agreement, and all governing instruments\n• I accept the New Covenant as the Trust Instrument — the pre-existing divine legal framework established by God (Jeremiah 31:31-34, Hebrews 8:8-12)\n• I acknowledge that the New Covenant is not merely the governing law but IS the Trust Instrument itself, authored by God, sealed by the blood of Christ, administered by the Holy Spirit\n• I commit to the governance structure established therein, including the authority of the Trustee and Protector Council\n• I agree to resolve all disputes through the Matthew 18 Protocol and binding ecclesiastical arbitration\n• I commit to contributing to the common good through labor, tithes, and faithful participation\n• I understand that my granting act is irrevocable — "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62)\n• I understand that membership is voluntary and that I may withdraw at any time with 30 days written notice\n\n"I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service." (Romans 12:1)' },
          { title: "Signatures & Witness Block", content: 'IN WITNESS WHEREOF, the Beneficiary has executed this Acceptance and Acknowledgment on the date first written above, with full knowledge of its terms and covenant obligations.\n\nBENEFICIARY:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nTRUSTEE (Acknowledging Acceptance):\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL MEMBER:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nWITNESS 1:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nWITNESS 2:\n____________________________________\nPrinted Name: ________________________\nDate: _______________' },
        ],
      },
      // ═══════════════════════════════════════════════════════════════════════════
      // 39. DEATH & RESURRECTION RECORD. Novation of Identity
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Death & Resurrection Record (Novation of Identity)",
        description: "Record documenting the granting act: the acceptance of the New Covenant, the death of the old man, resurrection of the new man, and complete novation of identity in Christ",
        layers: ["covenant", "member"],
        sections: [
          { title: "Scripture Foundation", content: '"Know ye not, that so many of us as were baptized into Jesus Christ were baptized into his death? Therefore we are buried with him by baptism into death: that like as Christ was raised up from the dead by the glory of the Father, even so we also should walk in newness of life. For if we have been planted together in the likeness of his death, we shall be also in the likeness of his resurrection: Knowing this, that our old man is crucified with him, that the body of sin might be destroyed, that henceforth we should not serve sin. For he that is dead is freed from sin."\n— Romans 6:3-7\n\n"I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me."\n— Galatians 2:20\n\n"Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new."\n— 2 Corinthians 5:17\n\n"For ye are dead, and your life is hid with Christ in God."\n— Colossians 3:3' },
          { title: "Record of Death (Old Man)", content: 'RECORD OF DEATH\n\nDate: {{date}}\nTrust: {{entity.name}}\n\nLet it be recorded and known to all:\n\nThe undersigned declares that by accepting the New Covenant — the pre-existing Trust Instrument established by God (Jeremiah 31:31-34, Hebrews 8:8-12) — the "old man" (the former identity, nature, and legal person operating under the jurisdiction of the world) has DIED with Christ through baptism (Romans 6:3-4). This death of the old man is an essential component of the granting act: the individual\'s acceptance of the New Covenant by faith, confession, and baptism constitutes the irrevocable deposit of the old man into the trust.\n\nThis death is:\n• ACTUAL: not metaphorical or symbolic, but a real spiritual and legal event with binding consequences\n• COMPLETE: encompassing the entirety of the former identity, including all rights, obligations, debts, and claims arising from the former status\n• IRREVOCABLE: "for he that is dead is freed from sin" (Romans 6:7); as the granting act cannot be undone, so the death cannot be reversed — "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62)\n• SELF-EXECUTING: effected at the moment of accepting the New Covenant, requiring no external validation, court order, or administrative act to be effective\n• CONSTITUTIVE OF THE GRANT: the death of the old man IS the deposit of the old man into the trust corpus as part of the granting act\n\nThe death of the old man terminates:\n• All contracts, obligations, and agreements entered into under the former identity, insofar as they conflict with the New Covenant (the Trust Instrument)\n• All jurisdictional claims arising from citizenship, domicile, or status in any worldly system\n• All debts owed by the old man to the old system (Colossians 2:14. "Blotting out the handwriting of ordinances that was against us")\n• All claims, liens, and encumbrances against the former person\n\n"Knowing this, that our old man is crucified with him, that the body of sin might be destroyed, that henceforth we should not serve sin" (Romans 6:6).' },
          { title: "Record of Resurrection (New Man)", content: 'RECORD OF RESURRECTION\n\nThe undersigned declares that a NEW MAN has been raised with Christ (Colossians 3:1), constituting a completely new identity and legal person:\n\nThis new man is:\n• A NEW CREATURE. "old things are passed away; behold, all things are become new" (2 Corinthians 5:17)\n• AN HEIR OF GOD. "and if children, then heirs; heirs of God, and joint-heirs with Christ" (Romans 8:17)\n• A CITIZEN OF HEAVEN. "our conversation [citizenship] is in heaven" (Philippians 3:20)\n• A MEMBER OF THE BODY OF CHRIST. "ye are the body of Christ, and members in particular" (1 Corinthians 12:27)\n• SEALED BY THE HOLY SPIRIT. "ye were sealed with that holy Spirit of promise" (Ephesians 1:13)\n\nThe new man operates under:\n• The jurisdiction of the Kingdom of God (Colossians 1:13)\n• The governing law of the New Covenant (Hebrews 8:6)\n• The authority of Christ as Head (Ephesians 1:22-23)\n• The administration of the Holy Spirit as Executor (John 14:26, John 16:13)' },
          { title: "Novation Declaration", content: 'DECLARATION OF NOVATION\n\nNovation (the substitution of a new obligation, contract, or party for an existing one) is hereby declared:\n\nThe undersigned declares that, by accepting the New Covenant (the pre-existing Trust Instrument), a complete novation of identity has occurred. The granting act of acceptance — by faith, confession, and baptism — simultaneously effected this novation:\n\n1. The OLD PARTY (the old man, the former legal person) has been extinguished by death with Christ, deposited into the trust as part of the granting act\n2. The NEW PARTY (the new man, the new creature in Christ) has been constituted by resurrection with Christ, simultaneously becoming Grantor and Beneficiary — heir of God, joint-heir with Christ (Romans 8:17)\n3. The OLD OBLIGATIONS (debts, contracts, jurisdictional ties to worldly systems) are discharged by operation of the granting act and the death it effects\n4. The NEW OBLIGATIONS (covenant duties under the New Covenant — the Trust Instrument — and this Declaration of Trust) are accepted as part of the granting act\n\nThis novation is:\n• COMPLETE: affecting every aspect of identity, status, and obligation\n• PERMANENT: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me" (Galatians 2:20) — as irrevocable as the granting act itself\n• RECOGNIZED IN LAW: novation is an established legal doctrine whereby a new contract extinguishes the old\n• EFFECTED BY ACCEPTANCE: the individual\'s acceptance of the New Covenant is the act that triggers the novation\n\nThe new man retains no obligation arising solely from the former identity, except as voluntarily assumed under the New Covenant (the Trust Instrument) and this Declaration of Trust.' },
          { title: "Jurisdictional Transfer", content: 'DECLARATION OF JURISDICTIONAL TRANSFER\n\nThe undersigned declares that, by the granting act of accepting the New Covenant (the Trust Instrument), jurisdiction over the new man has been transferred:\n\nFROM:\n• The kingdom of darkness (Colossians 1:13)\n• The jurisdiction of worldly civil and commercial systems\n• The authority of the law of sin and death (Romans 8:2)\n\nTO:\n• The Kingdom of God\'s dear Son (Colossians 1:13)\n• The jurisdiction of the New Covenant ecclesia, operating under the Trust Instrument (the New Covenant itself)\n• The law of the Spirit of life in Christ Jesus (Romans 8:2)\n\nThis transfer is effected by divine operation through the individual\'s acceptance of the New Covenant — the granting act. This record merely memorializes what God has already accomplished through the Grantor\'s acceptance. The New Covenant, as the pre-existing Trust Instrument authored by God (Jeremiah 31:31-34, Hebrews 8:8-12), sealed by Christ the Testator (Hebrews 9:16-17), and executed by the Holy Spirit (Ephesians 1:13-14), governs this jurisdictional transfer absolutely.\n\n"Who hath delivered us from the power of darkness, and hath translated us into the kingdom of his dear Son" (Colossians 1:13).' },
          { title: "Universal Conveyance", content: 'UNIVERSAL CONVEYANCE\n\nThe undersigned, as the new man in Christ, hereby conveys, transfers, and assigns to the Trust all right, title, and interest in:\n\n• The body, as the temple of the Holy Spirit (1 Corinthians 6:19)\n• All labor, skills, talents, and productive capacity\n• All real and personal property, wherever situated\n• All financial assets, accounts, and instruments\n• All intellectual property, creative works, and intangible assets\n• All choses in action, claims, and causes of action\n• All present and future income, increase, and accessions\n• All rights under any contract, agreement, or instrument\n• All interests of every kind and nature, whether known or unknown, present or future\n\nThis conveyance is made voluntarily, irrevocably, and in perpetuity, as an act of worship and obedience to the covenant purpose.\n\n"Ye are not your own. For ye are bought with a price: therefore glorify God in your body, and in your spirit, which are God\'s" (1 Corinthians 6:19-20).' },
          { title: "Attestation & Signatures", content: 'IN WITNESS WHEREOF, the undersigned makes this Record and Declaration on the date first written above, before witnesses, with full understanding of its meaning and consequences.\n\nDECLARANT (New Man in Christ):\n____________________________________\nPrinted Name: ________________________\nDate of Baptism: ________________________\nDate: _______________\n\nTRUSTEE (Receiving and Recording):\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR / ELDER (Witnessing):\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________\n\nWITNESS 1:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\nWITNESS 2:\n____________________________________\nPrinted Name: ________________________\nDate: _______________\n\n"Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new" (2 Corinthians 5:17).' },
        ],
      },
      // ═══════════════════════════════════════════════════════════════════════════
      // 40. COMPREHENSIVE DEFINITIONS: Appendix A
      // ═══════════════════════════════════════════════════════════════════════════
      {
        name: "Comprehensive Definitions: Appendix A",
        description: "Master glossary of all theological-legal terms, identity definitions, jurisdictional concepts, and governance roles used across trust instruments",
        layers: ["covenant", "body"],
        sections: [
          { title: "Purpose & Scope", content: 'APPENDIX A: COMPREHENSIVE DEFINITIONS\n\nTrust: {{entity.name}}\nDate: {{date}}\n\nThis Appendix provides authoritative definitions for all terms used throughout the Declaration of Trust and related instruments. These definitions are incorporated by reference into every trust instrument within the ecosystem of {{root.name}}.\n\nWhere a term is defined in this Appendix, it shall have the meaning given here unless the context clearly requires otherwise. Terms defined in individual instruments for specific purposes retain their instrument-specific meaning within that instrument.\n\nAll Scripture references are to the King James Version unless otherwise noted.' },
          { title: "Identity & Status Definitions", content: 'OLD MAN: The former identity, nature, and legal person that existed before death with Christ through baptism. The old man is "crucified with him, that the body of sin might be destroyed" (Romans 6:6). The old man has no continuing legal existence within the trust.\n\nNEW MAN / NEW CREATURE: The identity constituted by resurrection with Christ. "If any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new" (2 Corinthians 5:17). The new man is the only recognized identity within the trust ecosystem.\n\nNOVATION: The complete substitution of the new man for the old man, including all rights, obligations, and jurisdictional ties. An established legal doctrine applied to the spiritual reality of death and resurrection with Christ.\n\nDECEDENT / DECEDENT ESTATE: The old man is a decedent. The estate of the old man (all worldly claims, debts, obligations, and jurisdictional ties) is discharged by operation of death (Romans 6:7, Romans 7:1-6).\n\nHEIR: One who inherits. All who are in Christ are "heirs of God, and joint-heirs with Christ" (Romans 8:17), holding beneficial interest in the entire estate of the Kingdom.\n\nJOINT-HEIR: A co-inheritor who shares equally in the full inheritance. Each covenant member is a joint-heir with Christ, not receiving a fraction but sharing in the whole.\n\nCITIZENSHIP: The primary citizenship of every covenant member is heavenly: "our conversation [citizenship] is in heaven" (Philippians 3:20). Earthly citizenship is secondary and does not define identity or jurisdiction.' },
          { title: "Trust & Property Definitions", content: 'TRUST: An equitable obligation binding a person (the Trustee) to deal with property over which he has control (the Trust Property) for the benefit of persons (the Beneficiaries), of whom he may himself be one. In this ecosystem, the Trust Instrument is the New Covenant itself — the pre-existing divine legal framework authored by God (Jeremiah 31:31-34, Hebrews 8:8-12), sealed by the blood of Christ the Testator (Hebrews 9:16-17), mediated by Christ as eternal High Priest (Hebrews 7:24-25, Hebrews 9:15, 12:24), and executed by the Holy Spirit as Seal and Guarantor (Ephesians 1:13-14, 2 Corinthians 1:21-22). The individual\'s acceptance of this pre-existing Trust Instrument is the granting act that activates the trust with respect to that individual.\n\nGRANTOR / SETTLOR: The individual who accepted the New Covenant, thereby becoming the Grantor by the act of faith, confession, and baptism. The individual does not create a new trust; the individual accepts the pre-existing New Covenant (the Trust Instrument, established by God — Jeremiah 31:31-34, Hebrews 8:8-12), and that acceptance IS the granting act. By this granting act, the Grantor irrevocably deposits the old man (death with Christ, Romans 6:3-4), the body (temple of the Holy Spirit, 1 Corinthians 6:19-20), and all associated property into the trust. The Grantor simultaneously becomes Beneficiary — heir of God, joint-heir with Christ (Romans 8:17). This granting act is irrevocable: "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62).\n\nTRUSTEE: The person or body holding legal title to trust property and administering it according to the trust terms. Current Trustee: {{entity.trusteeLabel}}\n\nBENEFICIARY: One who holds beneficial interest in the trust and receives benefits from its administration. Each beneficiary holds one Beneficial Unit.\n\nBENEFICIAL UNIT. A single unit of beneficial interest representing an equal, undivided share (1/N) in the trust corpus. Non-transferable, non-attachable, and non-inheritable.\n\nTRUST CORPUS: The total body of trust property, including all real property, personal property, financial assets, intellectual property, labor, increase, and all accessions thereto.\n\nSPENDTHRIFT PROVISION: An irrevocable restriction preventing beneficiaries from transferring their interest and preventing creditors from reaching it. Protects the trust corpus from external claims.\n\nIRREVOCABLE: Cannot be revoked, amended, or terminated by the Grantor. The Grantor made the grant by accepting the New Covenant and cannot un-accept. "No man, having put his hand to the plough, and looking back, is fit for the kingdom of God" (Luke 9:62). The trust persists regardless of the Grantor\'s subsequent wishes, for the granting act of acceptance is permanent and the Trust Instrument (the New Covenant) is eternal.\n\nFIDUCIARY DUTY: The legal and moral obligation to act in the best interests of another. Includes duties of loyalty, care, impartiality, prudence, and accounting.\n\nCHOSES IN ACTION: Intangible rights that can be enforced by legal or equitable action, including debts owed to the trust, claims, causes of action, and contractual rights.' },
          { title: "Jurisdictional Definitions", content: 'JURISDICTION: The authority to govern, judge, and administer law. Within the trust ecosystem, three jurisdictional realms are recognized:\n\n(1) HEAVENLY JURISDICTION. The supreme authority of God over all creation, exercised through Christ as Head (Ephesians 1:20-23). This is the ultimate source of all legitimate authority.\n\n(2) ECCLESIASTICAL JURISDICTION. The authority of the ecclesia (the gathered assembly of believers) to govern its own internal affairs, including membership, discipline, doctrine, and property. Protected by the First Amendment and the ecclesiastical abstention doctrine.\n\n(3) NATURAL / TEMPORAL JURISDICTION. The authority over physical creation and temporal affairs, exercised through stewardship under divine mandate (Genesis 1:28).\n\nDE JURE: By right; legitimate authority. The Kingdom of God exercises de jure authority over all creation.\n\nDE FACTO: In fact; existing in practice but not necessarily by right. Worldly governmental and commercial systems operate as de facto authorities.\n\nECCLESIASTICAL ABSTENTION: The legal doctrine preventing civil courts from deciding questions of religious doctrine, governance, or practice. Established in Watson v. Jones, 80 U.S. 679 (1871) and its progeny.\n\nMINISTERIAL EXCEPTION: The doctrine exempting religious organizations from certain employment laws regarding ministers and those performing religious functions. Hosanna-Tabor Evangelical Lutheran Church & School v. EEOC, 565 U.S. 171 (2012).\n\nSUBROGATION: The substitution of one party for another with respect to rights and claims. Christ as Subrogee stands in the place of the Grantor for all purposes.' },
          { title: "Governance & Role Definitions", content: 'PROTECTOR COUNCIL: The elder body serving as the oversight, accountability, and check-and-balance authority over the Trustee. Current Protector Council: {{entity.protectorLabel}}\n\nELDER (PRESBYTEROS): A mature, qualified leader meeting the criteria of 1 Timothy 3:1-7 and Titus 1:5-9, serving in spiritual oversight of the community.\n\nDEACON (DIAKONOS): A servant-leader meeting the criteria of 1 Timothy 3:8-13, serving in practical administration and benevolence.\n\nFIVE-FOLD MINISTRY: The five ministry gifts described in Ephesians 4:11: Apostle, Prophet, Evangelist, Pastor, and Teacher, given "for the perfecting of the saints, for the work of the ministry, for the edifying of the body of Christ" (Ephesians 4:12).\n\nSTEWARD: One entrusted with the management of another\'s property or affairs. "It is required in stewards, that a man be found faithful" (1 Corinthians 4:2).\n\nEXECUTOR: One appointed to carry out the terms of a will or testament. The Holy Spirit serves as the Executor of the New Covenant (John 14:26, John 16:13).\n\nMEDIATOR: One who stands between two parties to effect reconciliation. "There is one God, and one mediator between God and men, the man Christ Jesus" (1 Timothy 2:5).\n\nTESTATOR: One who makes a testament (will). Christ is the Testator of the New Covenant, whose death activated the testament (Hebrews 9:16-17).\n\nMATTHEW 18 PROTOCOL. The dispute resolution and discipline process prescribed by Christ in Matthew 18:15-20: private conference, witnesses, elder council, binding arbitration.' },
          { title: "Scripture Reference Index", content: 'KEY SCRIPTURE REFERENCES:\n\nIDENTITY & DEATH/RESURRECTION:\n• Romans 6:3-11: Baptism into death and resurrection\n• Galatians 2:20: Crucified with Christ\n• 2 Corinthians 5:17: New creature\n• Colossians 2:11-15: Circumcision of Christ\n• Colossians 3:1-4: Dead, life hid with Christ\n\nINHERITANCE & COVENANT:\n• Romans 8:17: Heirs and joint-heirs\n• Hebrews 8:6-13: Better covenant, better promises\n• Hebrews 9:15-17: Mediator, testament, death of testator\n• 1 Peter 1:3-4: Incorruptible inheritance\n• Luke 22:20: New Covenant in His blood\n\nTRUST & STEWARDSHIP:\n• Psalm 24:1. The earth is the LORD\'s\n• 1 Corinthians 6:19-20: Body as temple, bought with a price\n• 1 Corinthians 4:2: Required in stewards: faithfulness\n• Luke 16:10-11: Faithful in little and much\n• Matthew 25:14-30: Parable of the talents\n\nJURISDICTION & AUTHORITY:\n• Colossians 1:13: Delivered from darkness, translated to Kingdom\n• Ephesians 1:20-23: Christ above all authority\n• Philippians 3:20: Citizenship in heaven\n• Romans 7:1-6: Law has dominion only while alive\n• Matthew 22:21: Render unto Caesar / unto God\n\nGOVERNANCE:\n• Acts 2:42-47: Early church pattern\n• Ephesians 4:11-13: Five-fold ministry\n• 1 Timothy 3:1-13: Qualifications for elders and deacons\n• Titus 1:5-9: Elders in every city\n• Matthew 18:15-20: Discipline and dispute resolution\n\nASSET PROTECTION:\n• Proverbs 13:22. Inheritance to children\'s children\n• 1 Timothy 6:7: Brought nothing in, carry nothing out\n• Acts 4:32-35: All things common\n• Malachi 3:10: Storehouse principle' },
          { title: "Incorporation Clause", content: 'INCORPORATION BY REFERENCE\n\nThis Appendix A is incorporated by reference into the following instruments:\n\n• The Declaration of Trust of {{entity.name}}\n• All Sub-Trust Declarations within the ecosystem\n• The Trust Administration Agreement\n• All PMA Agreements\n• All Chapter Charters\n• All Commune Operating Agreements\n• All Guild Charters\n• All Certificates of Beneficial Interest\n• All Beneficiary Acceptance and Acknowledgment forms\n• All Death & Resurrection Records\n• Schedule A and all supplemental schedules\n• All other instruments that reference "Appendix A" or "Comprehensive Definitions"\n\nIn the event of any conflict between a definition in this Appendix and a definition in a specific instrument, the specific instrument\'s definition prevails for that instrument only. This Appendix governs in all other cases.\n\n{{entity.notes}}\n\nATTESTED BY:\n\nTRUSTEE:\n____________________________________\n{{entity.trusteeLabel}}\nDate: _______________\n\nPROTECTOR COUNCIL:\n____________________________________\n{{entity.protectorLabel}}\nDate: _______________' },
        ],
      },
    ];

    for (const tmpl of templates) {
      const [template] = await db.insert(trustDocumentTemplates).values({
        name: tmpl.name,
        description: tmpl.description,
        applicableLayers: tmpl.layers,
        isBuiltIn: true,
        status: 'active',
      }).returning();

      if (tmpl.sections.length > 0) {
        await db.insert(trustTemplateSections).values(
          tmpl.sections.map((s, i) => ({
            templateId: template.id,
            title: s.title,
            contentTemplate: s.content,
            sortOrder: i,
          }))
        );
      }
    }
  }

  // ====== Trust Documents ======

  async getTrustDocuments(): Promise<(TrustDocument & { sections: TrustDocumentSection[] })[]> {
    const docs = await db.select().from(trustDocuments).orderBy(desc(trustDocuments.updatedAt));
    const allSections = await db.select().from(trustDocumentSections).orderBy(trustDocumentSections.sortOrder);
    return docs.map(d => ({
      ...d,
      sections: allSections.filter(s => s.documentId === d.id),
    }));
  }

  async getTrustDocumentById(id: string): Promise<(TrustDocument & { sections: TrustDocumentSection[] }) | undefined> {
    const [doc] = await db.select().from(trustDocuments).where(eq(trustDocuments.id, id));
    if (!doc) return undefined;
    const sections = await db.select().from(trustDocumentSections)
      .where(eq(trustDocumentSections.documentId, id))
      .orderBy(trustDocumentSections.sortOrder);
    return { ...doc, sections };
  }

  async createTrustDocumentWithSections(doc: InsertTrustDocument, sections: Omit<InsertTrustDocumentSection, 'documentId'>[]): Promise<TrustDocument & { sections: TrustDocumentSection[] }> {
    const [created] = await db.insert(trustDocuments).values(doc).returning();
    let createdSections: TrustDocumentSection[] = [];
    if (sections.length > 0) {
      createdSections = await db.insert(trustDocumentSections).values(
        sections.map((s, i) => ({
          ...s,
          documentId: created.id,
          sortOrder: s.sortOrder ?? i,
        }))
      ).returning();
    }
    return { ...created, sections: createdSections };
  }

  async updateTrustDocumentMeta(id: string, updates: Partial<InsertTrustDocument>): Promise<TrustDocument> {
    const [updated] = await db.update(trustDocuments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trustDocuments.id, id))
      .returning();
    return updated;
  }

  async updateTrustDocumentSectionContent(sectionId: string, content: string): Promise<TrustDocumentSection> {
    const [updated] = await db.update(trustDocumentSections)
      .set({ content })
      .where(eq(trustDocumentSections.id, sectionId))
      .returning();
    return updated;
  }

  async resetTrustDocumentFromTemplate(id: string, sections: Omit<InsertTrustDocumentSection, 'documentId'>[]): Promise<TrustDocument & { sections: TrustDocumentSection[] }> {
    // Get current doc to increment version
    const [doc] = await db.select().from(trustDocuments).where(eq(trustDocuments.id, id));
    if (!doc) throw new Error('Document not found');

    // Increment version
    const [updated] = await db.update(trustDocuments)
      .set({ version: (doc.version || 1) + 1, updatedAt: new Date() })
      .where(eq(trustDocuments.id, id))
      .returning();

    // Replace sections
    await db.delete(trustDocumentSections).where(eq(trustDocumentSections.documentId, id));
    let createdSections: TrustDocumentSection[] = [];
    if (sections.length > 0) {
      createdSections = await db.insert(trustDocumentSections).values(
        sections.map((s, i) => ({
          ...s,
          documentId: id,
          sortOrder: s.sortOrder ?? i,
        }))
      ).returning();
    }
    return { ...updated, sections: createdSections };
  }

  async deleteTrustDocumentById(id: string): Promise<void> {
    await db.delete(trustDocuments).where(eq(trustDocuments.id, id));
  }

  // Treasury
  async createTreasuryTransaction(data: InsertTreasuryTransaction): Promise<TreasuryTransaction> {
    const [tx] = await db.insert(treasuryTransactions).values(data).returning();
    return tx;
  }

  async getTreasuryTransactions(limit: number, offset: number): Promise<TreasuryTransaction[]> {
    return db.select().from(treasuryTransactions)
      .orderBy(desc(treasuryTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getTreasuryBalance(): Promise<number> {
    const [result] = await db.select({
      balance: sql<number>`COALESCE(SUM(${treasuryTransactions.amountCents}), 0)`,
    }).from(treasuryTransactions);
    return Number(result.balance);
  }

  async getTreasuryStats(): Promise<{
    balance: number;
    totalInflow: number;
    totalOutflow: number;
    transactionCount: number;
    breakdownByType: Record<string, number>;
  }> {
    const [summary] = await db.select({
      balance: sql<number>`COALESCE(SUM(${treasuryTransactions.amountCents}), 0)`,
      totalInflow: sql<number>`COALESCE(SUM(CASE WHEN ${treasuryTransactions.amountCents} > 0 THEN ${treasuryTransactions.amountCents} ELSE 0 END), 0)`,
      totalOutflow: sql<number>`COALESCE(SUM(CASE WHEN ${treasuryTransactions.amountCents} < 0 THEN ${treasuryTransactions.amountCents} ELSE 0 END), 0)`,
      transactionCount: sql<number>`COUNT(*)`,
    }).from(treasuryTransactions);

    const typeBreakdown = await db.select({
      type: treasuryTransactions.type,
      total: sql<number>`SUM(${treasuryTransactions.amountCents})`,
    }).from(treasuryTransactions).groupBy(treasuryTransactions.type);

    const breakdownByType: Record<string, number> = {};
    for (const row of typeBreakdown) {
      breakdownByType[row.type] = Number(row.total);
    }

    return {
      balance: Number(summary.balance),
      totalInflow: Number(summary.totalInflow),
      totalOutflow: Number(summary.totalOutflow),
      transactionCount: Number(summary.transactionCount),
      breakdownByType,
    };
  }

  async getTreasurySetting(key: string): Promise<TreasurySetting | undefined> {
    const [setting] = await db.select().from(treasurySettings)
      .where(eq(treasurySettings.key, key));
    return setting;
  }

  async upsertTreasurySetting(key: string, value: string, updatedById: string): Promise<TreasurySetting> {
    const existing = await this.getTreasurySetting(key);
    if (existing) {
      const [updated] = await db.update(treasurySettings)
        .set({ value, updatedById, updatedAt: new Date() })
        .where(eq(treasurySettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(treasurySettings)
      .values({ key, value, updatedById })
      .returning();
    return created;
  }

  // Forum moderation
  async flagContent(data: InsertFlaggedContent): Promise<FlaggedContent> {
    const [flag] = await db.insert(flaggedContent).values(data).returning();
    return flag;
  }

  async getFlaggedContent(status?: string): Promise<FlaggedContent[]> {
    if (status) {
      return await db.select().from(flaggedContent)
        .where(eq(flaggedContent.status, status as any))
        .orderBy(desc(flaggedContent.createdAt));
    }
    return await db.select().from(flaggedContent)
      .orderBy(desc(flaggedContent.createdAt));
  }

  async reviewFlag(id: string, reviewedBy: string, status: string): Promise<FlaggedContent> {
    const [updated] = await db.update(flaggedContent)
      .set({ reviewedBy, reviewedAt: new Date(), status: status as any })
      .where(eq(flaggedContent.id, id))
      .returning();
    return updated;
  }

  async createWarning(data: InsertUserWarning): Promise<UserWarning> {
    const [warning] = await db.insert(userWarnings).values(data).returning();
    return warning;
  }

  async getUserWarnings(userId: string): Promise<UserWarning[]> {
    return await db.select().from(userWarnings)
      .where(eq(userWarnings.userId, userId))
      .orderBy(desc(userWarnings.createdAt));
  }

  async banUser(userId: string, reason: string): Promise<User> {
    const [updated] = await db.update(users)
      .set({ isBanned: true, banReason: reason })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async unbanUser(userId: string): Promise<User> {
    const [updated] = await db.update(users)
      .set({ isBanned: false, banReason: null })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
