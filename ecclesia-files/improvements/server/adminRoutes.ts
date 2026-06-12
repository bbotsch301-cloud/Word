import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { requireAuth, requireAdmin, requireModerator, requireInstructor, loadUser, auditLog } from './adminMiddleware';
import { sendEmail, generateBulkEmailHtml } from './email';
import { generateDownloadMetadata } from './ai';
import logger from './logger';
import {
  insertVideoSchema,
  insertResourceSchema,
  insertCourseSchema,
  insertLessonSchema,
  insertForumCategorySchema,
  insertPageContentSchema,
  updatePageContentSchema,
  insertDownloadSchema,
  insertTrustEntitySchema,
  insertTrustRelationshipSchema,
  insertBasTokenConfigSchema,
  insertBasAllocationSchema,
  insertBasRoadmapMilestoneSchema,
  insertBasCouncilMemberSchema,
  insertBasFaqEntrySchema,
} from '@shared/schema';
import { resolveEntity, resolveVariables } from './trustDocumentUtils';

const router = Router();

// Apply user loading middleware to all admin routes
router.use(loadUser);

// ================================
// USER MANAGEMENT (ADMIN ONLY)
// ================================

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching users:');
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = z.object({ role: z.enum(['student', 'instructor', 'moderator', 'admin']) }).parse(req.body);
    
    const oldUser = await storage.getUser(id);
    const updatedUser = await storage.updateUserRole(id, role);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'USER', 
      id, 
      { role: oldUser?.role }, 
      { role },
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedUser);
  } catch (error) {
    logger.error({ err: error }, 'Error updating user role:');
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-active', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldUser = await storage.getUser(id);
    const updatedUser = await storage.toggleUserActive(id);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'USER', 
      id, 
      { isActive: oldUser?.isActive }, 
      { isActive: updatedUser.isActive },
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedUser);
  } catch (error) {
    logger.error({ err: error }, 'Error toggling user status:');
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// Delete user
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldUser = await storage.getUser(id);
    await storage.deleteUser(id);
    
    await auditLog(
      req.user!.id, 
      'DELETE', 
      'USER', 
      id, 
      oldUser, 
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting user:');
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Send bulk email to all active users
router.post('/users/email', requireAdmin, async (req, res) => {
  try {
    const { subject, html } = z.object({
      subject: z.string().min(1, 'Subject is required'),
      html: z.string().min(1, 'Message body is required'),
    }).parse(req.body);

    const users = await storage.getAllUsers();
    const activeUsers = users.filter(u => u.isActive && u.email);

    if (activeUsers.length === 0) {
      return res.status(400).json({ error: 'No active users with valid emails found' });
    }

    const emailBody = generateBulkEmailHtml(subject, html);
    const bccList = activeUsers.map(u => u.email).join(',');

    const success = await sendEmail({
      to: process.env.GMAIL_EMAIL || '',
      subject,
      html: emailBody,
      bcc: bccList,
    });

    const result = {
      sent: success ? activeUsers.length : 0,
      failed: success ? 0 : activeUsers.length,
      total: activeUsers.length,
    };

    await auditLog(
      req.user!.id,
      'CREATE',
      'BULK_EMAIL',
      '',
      null,
      { subject, recipientCount: activeUsers.length, success },
      req.ip,
      req.get('User-Agent')
    );

    if (!success) {
      return res.status(500).json({ error: 'Failed to send email', ...result });
    }

    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error sending bulk email:');
    res.status(500).json({ error: 'Failed to send bulk email' });
  }
});

// ================================
// VIDEO MANAGEMENT (INSTRUCTOR+)
// ================================

// Get all videos
router.get('/videos', requireInstructor, async (req, res) => {
  try {
    const videos = await storage.getAllVideos();
    res.json(videos);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching videos:');
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Create video
router.post('/videos', requireInstructor, async (req, res) => {
  try {
    const videoData = insertVideoSchema.omit({ createdById: true }).parse(req.body);
    const video = await storage.createVideo({
      ...videoData,
      createdById: req.user!.id,
    });
    
    await auditLog(
      req.user!.id, 
      'CREATE', 
      'VIDEO', 
      video.id, 
      null, 
      video,
      req.ip,
      req.get('User-Agent')
    );
    
    res.status(201).json(video);
  } catch (error) {
    logger.error({ err: error }, 'Error creating video:');
    res.status(500).json({ error: 'Failed to create video' });
  }
});

// Update video
router.patch('/videos/:id', requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const videoData = insertVideoSchema.partial().parse(req.body);
    
    const oldVideo = await storage.getAllVideos().then(videos => videos.find(v => v.id === id));
    const updatedVideo = await storage.updateVideo(id, videoData);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'VIDEO', 
      id, 
      oldVideo, 
      updatedVideo,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedVideo);
  } catch (error) {
    logger.error({ err: error }, 'Error updating video:');
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Toggle video published status
router.patch('/videos/:id/toggle-published', requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldVideo = await storage.getAllVideos().then(videos => videos.find(v => v.id === id));
    const updatedVideo = await storage.toggleVideoPublished(id);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'VIDEO', 
      id, 
      { isPublished: oldVideo?.isPublished }, 
      { isPublished: updatedVideo.isPublished },
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedVideo);
  } catch (error) {
    logger.error({ err: error }, 'Error toggling video status:');
    res.status(500).json({ error: 'Failed to toggle video status' });
  }
});

// Delete video
router.delete('/videos/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldVideo = await storage.getAllVideos().then(videos => videos.find(v => v.id === id));
    await storage.deleteVideo(id);
    
    await auditLog(
      req.user!.id, 
      'DELETE', 
      'VIDEO', 
      id, 
      oldVideo, 
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting video:');
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// ================================
// RESOURCE MANAGEMENT (INSTRUCTOR+)
// ================================

// Get all resources
router.get('/resources', requireInstructor, async (req, res) => {
  try {
    const resources = await storage.getAllResources();
    res.json(resources);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching resources:');
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Create resource
router.post('/resources', requireInstructor, async (req, res) => {
  try {
    const resourceData = insertResourceSchema.omit({ createdById: true }).parse(req.body);
    const resource = await storage.createResource({
      ...resourceData,
      createdById: req.user!.id,
    });
    
    await auditLog(
      req.user!.id, 
      'CREATE', 
      'RESOURCE', 
      resource.id, 
      null, 
      resource,
      req.ip,
      req.get('User-Agent')
    );
    
    res.status(201).json(resource);
  } catch (error) {
    logger.error({ err: error }, 'Error creating resource:');
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// Update resource
router.patch('/resources/:id', requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const resourceData = insertResourceSchema.partial().parse(req.body);
    
    const oldResource = await storage.getAllResources().then(resources => resources.find(r => r.id === id));
    const updatedResource = await storage.updateResource(id, resourceData);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'RESOURCE', 
      id, 
      oldResource, 
      updatedResource,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedResource);
  } catch (error) {
    logger.error({ err: error }, 'Error updating resource:');
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// Toggle resource published status
router.patch('/resources/:id/toggle-published', requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldResource = await storage.getAllResources().then(resources => resources.find(r => r.id === id));
    const updatedResource = await storage.toggleResourcePublished(id);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'RESOURCE', 
      id, 
      { isPublished: oldResource?.isPublished }, 
      { isPublished: updatedResource.isPublished },
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedResource);
  } catch (error) {
    logger.error({ err: error }, 'Error toggling resource status:');
    res.status(500).json({ error: 'Failed to toggle resource status' });
  }
});

// Delete resource
router.delete('/resources/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldResource = await storage.getAllResources().then(resources => resources.find(r => r.id === id));
    await storage.deleteResource(id);
    
    await auditLog(
      req.user!.id, 
      'DELETE', 
      'RESOURCE', 
      id, 
      oldResource, 
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting resource:');
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// ================================
// COURSE MANAGEMENT (INSTRUCTOR+)
// ================================

// Get all courses (including unpublished) for admin editor
router.get('/courses', requireInstructor, async (req, res) => {
  try {
    const courses = await storage.getAllCoursesWithLessonCount();
    res.json(courses);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching all courses:');
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Create course
router.post('/courses', requireInstructor, async (req, res) => {
  try {
    const courseData = insertCourseSchema.parse({ ...req.body, createdById: req.user!.id });
    const course = await storage.createCourse(courseData);

    await auditLog(
      req.user!.id,
      'CREATE',
      'COURSE',
      course.id,
      null,
      course,
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json(course);
  } catch (error) {
    logger.error({ err: error }, 'Error creating course:');
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course
router.patch('/courses/:id', requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = insertCourseSchema.partial().parse(req.body);
    
    const oldCourse = await storage.getCourse(id);
    const updatedCourse = await storage.updateCourse(id, courseData);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'COURSE', 
      id, 
      oldCourse, 
      updatedCourse,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedCourse);
  } catch (error) {
    logger.error({ err: error }, 'Error updating course:');
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Toggle course published status
router.patch('/courses/:id/toggle-published', requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldCourse = await storage.getCourse(id);
    const updatedCourse = await storage.toggleCoursePublished(id);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'COURSE', 
      id, 
      { isPublished: oldCourse?.isPublished }, 
      { isPublished: updatedCourse.isPublished },
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedCourse);
  } catch (error) {
    logger.error({ err: error }, 'Error toggling course status:');
    res.status(500).json({ error: 'Failed to toggle course status' });
  }
});

// Delete course
router.delete('/courses/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldCourse = await storage.getCourse(id);
    await storage.deleteCourse(id);
    
    await auditLog(
      req.user!.id, 
      'DELETE', 
      'COURSE', 
      id, 
      oldCourse, 
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting course:');
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Create lesson
router.post('/courses/:courseId/lessons', requireInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessonData = insertLessonSchema.parse({ ...req.body, courseId });
    
    const lesson = await storage.createLesson(lessonData);
    
    await auditLog(
      req.user!.id, 
      'CREATE', 
      'LESSON', 
      lesson.id, 
      null, 
      lesson,
      req.ip,
      req.get('User-Agent')
    );
    
    res.status(201).json(lesson);
  } catch (error) {
    logger.error({ err: error }, 'Error creating lesson:');
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson
router.patch('/lessons/:id', requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const lessonData = insertLessonSchema.partial().parse(req.body);
    
    const oldLesson = await storage.getLessonById(id);
    const updatedLesson = await storage.updateLesson(id, lessonData);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'LESSON', 
      id, 
      oldLesson, 
      updatedLesson,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedLesson);
  } catch (error) {
    logger.error({ err: error }, 'Error updating lesson:');
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete lesson
router.delete('/lessons/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const oldLesson = await storage.getLessonById(id);
    await storage.deleteLesson(id);

    await auditLog(
      req.user!.id,
      'DELETE',
      'LESSON',
      id,
      oldLesson,
      null,
      req.ip,
      req.get('User-Agent')
    );

    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting lesson:');
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// Reorder lessons
router.patch('/courses/:courseId/lessons/reorder', requireInstructor, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonIds } = z.object({ lessonIds: z.array(z.string()) }).parse(req.body);
    await storage.reorderLessons(courseId, lessonIds);
    await auditLog(req.user!.id, 'UPDATE', 'COURSE', courseId, null, { action: 'reorder_lessons' }, req.ip, req.get('User-Agent'));
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error reordering lessons:');
    res.status(500).json({ error: 'Failed to reorder lessons' });
  }
});

// Duplicate lesson
router.post('/lessons/:id/duplicate', requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const newLesson = await storage.duplicateLesson(id);
    await auditLog(req.user!.id, 'CREATE', 'LESSON', newLesson.id, null, newLesson, req.ip, req.get('User-Agent'));
    res.status(201).json(newLesson);
  } catch (error) {
    logger.error({ err: error }, 'Error duplicating lesson:');
    res.status(500).json({ error: 'Failed to duplicate lesson' });
  }
});

// Course enrollment stats
router.get('/courses/:courseId/stats', requireInstructor, async (req, res) => {
  try {
    const stats = await storage.getCourseStats(req.params.courseId);
    res.json(stats);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching course stats:');
    res.status(500).json({ error: 'Failed to fetch course stats' });
  }
});

// Audit log for specific entity
router.get('/audit-log', requireAdmin, async (req, res) => {
  try {
    const { entityType, entityId } = z.object({
      entityType: z.string(),
      entityId: z.string(),
    }).parse(req.query);
    const logs = await storage.getAuditLogForEntity(entityType, entityId);
    res.json(logs);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching audit log:');
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// Bulk delete lessons
router.post('/courses/:courseId/lessons/bulk-delete', requireAdmin, async (req, res) => {
  try {
    const { lessonIds } = z.object({ lessonIds: z.array(z.string()) }).parse(req.body);
    await storage.bulkDeleteLessons(lessonIds);
    await auditLog(req.user!.id, 'DELETE', 'LESSON', req.params.courseId, { lessonIds }, null, req.ip, req.get('User-Agent'));
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error bulk deleting lessons:');
    res.status(500).json({ error: 'Failed to bulk delete lessons' });
  }
});

// Course categories
router.get('/courses/categories', requireInstructor, async (req, res) => {
  try {
    const categories = await storage.getCourseCategories();
    res.json(categories);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching categories:');
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ================================
// FORUM MANAGEMENT (MODERATOR+)
// ================================

// Create forum category
router.post('/forum/categories', requireModerator, async (req, res) => {
  try {
    const categoryData = insertForumCategorySchema.parse(req.body);
    const category = await storage.createForumCategory(categoryData);
    
    await auditLog(
      req.user!.id, 
      'CREATE', 
      'FORUM_CATEGORY', 
      category.id, 
      null, 
      category,
      req.ip,
      req.get('User-Agent')
    );
    
    res.status(201).json(category);
  } catch (error) {
    logger.error({ err: error }, 'Error creating forum category:');
    res.status(500).json({ error: 'Failed to create forum category' });
  }
});

// Update forum category
router.patch('/forum/categories/:id', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = insertForumCategorySchema.partial().parse(req.body);
    
    const oldCategory = await storage.getForumCategoryById(id);
    const updatedCategory = await storage.updateForumCategory(id, categoryData);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'FORUM_CATEGORY', 
      id, 
      oldCategory, 
      updatedCategory,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedCategory);
  } catch (error) {
    logger.error({ err: error }, 'Error updating forum category:');
    res.status(500).json({ error: 'Failed to update forum category' });
  }
});

// Delete forum category
router.delete('/forum/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldCategory = await storage.getForumCategoryById(id);
    await storage.deleteForumCategory(id);
    
    await auditLog(
      req.user!.id, 
      'DELETE', 
      'FORUM_CATEGORY', 
      id, 
      oldCategory, 
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting forum category:');
    res.status(500).json({ error: 'Failed to delete forum category' });
  }
});

// Toggle thread pinned
router.patch('/forum/threads/:id/toggle-pinned', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldThread = await storage.getForumThreadById(id);
    const updatedThread = await storage.toggleThreadPinned(id);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'FORUM_THREAD', 
      id, 
      { isPinned: oldThread?.isPinned }, 
      { isPinned: updatedThread.isPinned },
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedThread);
  } catch (error) {
    logger.error({ err: error }, 'Error toggling thread pinned:');
    res.status(500).json({ error: 'Failed to toggle thread pinned' });
  }
});

// Toggle thread locked
router.patch('/forum/threads/:id/toggle-locked', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldThread = await storage.getForumThreadById(id);
    const updatedThread = await storage.toggleThreadLocked(id);
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'FORUM_THREAD', 
      id, 
      { isLocked: oldThread?.isLocked }, 
      { isLocked: updatedThread.isLocked },
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedThread);
  } catch (error) {
    logger.error({ err: error }, 'Error toggling thread locked:');
    res.status(500).json({ error: 'Failed to toggle thread locked' });
  }
});

// Delete forum thread
router.delete('/forum/threads/:id', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldThread = await storage.getForumThreadById(id);
    await storage.deleteForumThread(id);
    
    await auditLog(
      req.user!.id, 
      'DELETE', 
      'FORUM_THREAD', 
      id, 
      oldThread, 
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting forum thread:');
    res.status(500).json({ error: 'Failed to delete forum thread' });
  }
});

// Delete forum reply
router.delete('/forum/replies/:id', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    
    await storage.deleteForumReply(id);
    
    await auditLog(
      req.user!.id, 
      'DELETE', 
      'FORUM_REPLY', 
      id, 
      null, 
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting forum reply:');
    res.status(500).json({ error: 'Failed to delete forum reply' });
  }
});

// ================================
// FORUM MODERATION (MODERATOR+)
// ================================

// Get flagged content
router.get('/flagged', requireModerator, async (req, res) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const flags = await storage.getFlaggedContent(status);
    res.json(flags);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching flagged content');
    res.status(500).json({ error: 'Failed to fetch flagged content' });
  }
});

// Review a flag
router.patch('/flagged/:id', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = z.object({
      status: z.enum(['reviewed', 'dismissed']),
    }).parse(req.body);

    const flag = await storage.reviewFlag(id, req.user!.id, status);

    await auditLog(
      req.user!.id,
      'UPDATE',
      'FLAGGED_CONTENT',
      id,
      null,
      { status },
      req.ip,
      req.get('User-Agent')
    );

    res.json(flag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    logger.error({ err: error }, 'Error reviewing flag');
    res.status(500).json({ error: 'Failed to review flag' });
  }
});

// Issue a warning to a user
router.post('/users/:id/warn', requireModerator, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, severity } = z.object({
      reason: z.string().min(1),
      severity: z.enum(['notice', 'warning', 'final']),
    }).parse(req.body);

    const targetUser = await storage.getUser(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const warning = await storage.createWarning({
      userId: id,
      issuedBy: req.user!.id,
      reason,
      severity,
    });

    await auditLog(
      req.user!.id,
      'CREATE',
      'USER_WARNING',
      warning.id,
      null,
      { userId: id, severity },
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json(warning);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    logger.error({ err: error }, 'Error issuing warning');
    res.status(500).json({ error: 'Failed to issue warning' });
  }
});

// Get warnings for a user
router.get('/users/:id/warnings', requireModerator, async (req, res) => {
  try {
    const warnings = await storage.getUserWarnings(req.params.id);
    res.json(warnings);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching user warnings');
    res.status(500).json({ error: 'Failed to fetch user warnings' });
  }
});

// Ban a user
router.post('/users/:id/ban', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = z.object({
      reason: z.string().min(1),
    }).parse(req.body);

    const targetUser = await storage.getUser(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.role === 'admin') {
      return res.status(403).json({ error: 'Cannot ban an admin user' });
    }

    const updated = await storage.banUser(id, reason);

    await auditLog(
      req.user!.id,
      'BAN',
      'USER',
      id,
      { isBanned: false },
      { isBanned: true, banReason: reason },
      req.ip,
      req.get('User-Agent')
    );

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    logger.error({ err: error }, 'Error banning user');
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban a user
router.post('/users/:id/unban', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const targetUser = await storage.getUser(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updated = await storage.unbanUser(id);

    await auditLog(
      req.user!.id,
      'UNBAN',
      'USER',
      id,
      { isBanned: true },
      { isBanned: false },
      req.ip,
      req.get('User-Agent')
    );

    res.json(updated);
  } catch (error) {
    logger.error({ err: error }, 'Error unbanning user');
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// ================================
// ANALYTICS & MONITORING (ADMIN)
// ================================

// Get system statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await storage.getSystemStats();
    res.json(stats);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching system stats:');
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// Get recent activity audit log
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const activity = await storage.getRecentActivity();
    res.json(activity);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching recent activity:');
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// ================================
// PAGE CONTENT MANAGEMENT (ADMIN)
// ================================

// Get all page content
router.get('/page-content', requireAdmin, async (req, res) => {
  try {
    const pageContent = await storage.getAllPageContent();
    res.json(pageContent);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching page content:');
    res.status(500).json({ error: 'Failed to fetch page content' });
  }
});

// Get page content by page name
router.get('/page-content/:pageName', requireAdmin, async (req, res) => {
  try {
    const { pageName } = req.params;
    const pageContent = await storage.getPageContent(pageName);
    res.json(pageContent);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching page content:');
    res.status(500).json({ error: 'Failed to fetch page content' });
  }
});

// Create or update page content
router.post('/page-content', requireAdmin, async (req, res) => {
  try {
    const contentData = insertPageContentSchema.parse({
      ...req.body,
      updatedById: req.user!.id
    });
    
    const pageContent = await storage.upsertPageContent(contentData);
    
    await auditLog(
      req.user!.id, 
      'CREATE', 
      'PAGE_CONTENT', 
      pageContent.id, 
      null, 
      pageContent,
      req.ip,
      req.get('User-Agent')
    );
    
    res.status(201).json(pageContent);
  } catch (error) {
    logger.error({ err: error }, 'Error creating page content:');
    res.status(500).json({ error: 'Failed to create page content' });
  }
});

// Update specific page content
router.patch('/page-content/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = updatePageContentSchema.parse(req.body);
    
    const oldContent = await storage.getPageContentById(id);
    const updatedContent = await storage.updatePageContent(id, {
      ...updates,
      updatedById: req.user!.id
    });
    
    await auditLog(
      req.user!.id, 
      'UPDATE', 
      'PAGE_CONTENT', 
      id, 
      oldContent, 
      updatedContent,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json(updatedContent);
  } catch (error) {
    logger.error({ err: error }, 'Error updating page content:');
    res.status(500).json({ error: 'Failed to update page content' });
  }
});

// Delete page content
router.delete('/page-content/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const oldContent = await storage.getPageContentById(id);
    await storage.deletePageContent(id);
    
    await auditLog(
      req.user!.id, 
      'DELETE', 
      'PAGE_CONTENT', 
      id, 
      oldContent, 
      null,
      req.ip,
      req.get('User-Agent')
    );
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting page content:');
    res.status(500).json({ error: 'Failed to delete page content' });
  }
});

// ================================
// DOWNLOADS MANAGEMENT (ADMIN ONLY)
// ================================

// Get all downloads
router.get('/downloads', requireAdmin, async (req, res) => {
  try {
    const allDownloads = await storage.getAllDownloads();
    res.json(allDownloads);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching downloads:');
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

router.get('/downloads/:id', requireAdmin, async (req, res) => {
  try {
    const download = await storage.getDownload(req.params.id);
    if (!download) {
      return res.status(404).json({ error: 'Download not found' });
    }
    res.json(download);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching download:');
    res.status(500).json({ error: 'Failed to fetch download' });
  }
});

router.post('/downloads', requireAdmin, async (req, res) => {
  try {
    const downloadData = insertDownloadSchema.parse(req.body);
    const download = await storage.createDownload(downloadData);

    await auditLog(
      req.user!.id,
      'CREATE',
      'DOWNLOAD',
      download.id,
      null,
      download,
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json(download);
  } catch (error) {
    logger.error({ err: error }, 'Error creating download:');
    res.status(500).json({ error: 'Failed to create download' });
  }
});

router.put('/downloads/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const oldDownload = await storage.getDownload(id);
    const updates = insertDownloadSchema.partial().parse(req.body);
    const updated = await storage.updateDownload(id, updates);

    await auditLog(
      req.user!.id,
      'UPDATE',
      'DOWNLOAD',
      id,
      oldDownload,
      updated,
      req.ip,
      req.get('User-Agent')
    );

    res.json(updated);
  } catch (error) {
    logger.error({ err: error }, 'Error updating download:');
    res.status(500).json({ error: 'Failed to update download' });
  }
});

router.patch('/downloads/:id/toggle-published', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const oldDownload = await storage.getDownload(id);
    const updated = await storage.toggleDownloadPublished(id);

    await auditLog(
      req.user!.id,
      'UPDATE',
      'DOWNLOAD',
      id,
      { isPublished: oldDownload?.isPublished },
      { isPublished: updated.isPublished },
      req.ip,
      req.get('User-Agent')
    );

    res.json(updated);
  } catch (error) {
    logger.error({ err: error }, 'Error toggling download published:');
    res.status(500).json({ error: 'Failed to toggle download published' });
  }
});

router.delete('/downloads/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const oldDownload = await storage.getDownload(id);
    await storage.deleteDownload(id);

    await auditLog(
      req.user!.id,
      'DELETE',
      'DOWNLOAD',
      id,
      oldDownload,
      null,
      req.ip,
      req.get('User-Agent')
    );

    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting download:');
    res.status(500).json({ error: 'Failed to delete download' });
  }
});

// ================================
// AI-GENERATED DOWNLOAD METADATA
// ================================

// Simple in-memory rate limiter for AI endpoint
const aiRateLimits = new Map<string, number[]>();

router.post('/downloads/ai-generate', requireAdmin, async (req, res) => {
  try {
    // Rate limiting: 5 requests per minute per user
    const userId = req.user!.id;
    const now = Date.now();
    const windowMs = 60_000;
    const maxRequests = 5;

    const timestamps = aiRateLimits.get(userId) || [];
    const recent = timestamps.filter(t => now - t < windowMs);

    if (recent.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many AI generation requests. Please wait a minute.' });
    }

    recent.push(now);
    aiRateLimits.set(userId, recent);

    const { fileName, fileType, fileSize, title } = z.object({
      fileName: z.string().min(1),
      fileType: z.string().min(1),
      fileSize: z.string().optional(),
      title: z.string().optional(),
    }).parse(req.body);

    const metadata = await generateDownloadMetadata({ fileName, fileType, fileSize, title });
    res.json(metadata);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    logger.error({ err: error }, 'Error generating AI download metadata');
    const message = error.message?.includes('ANTHROPIC_API_KEY')
      ? 'AI service is not configured'
      : 'Failed to generate metadata';
    res.status(500).json({ error: message });
  }
});

// ================================
// NEWSLETTER CAMPAIGNS (ADMIN ONLY)
// ================================

// Get all newsletter subscribers
router.get('/newsletter-subscribers', requireAdmin, async (req, res) => {
  try {
    const subscribers = await storage.getAllNewsletterSubscribers();
    res.json({ subscribers, count: subscribers.length });
  } catch (error) {
    logger.error({ err: error }, 'Error fetching newsletter subscribers:');
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// Get all campaigns
router.get('/newsletter-campaigns', requireAdmin, async (req, res) => {
  try {
    const campaigns = await storage.getAllNewsletterCampaigns();
    res.json(campaigns);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching newsletter campaigns:');
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Create draft campaign
router.post('/newsletter-campaigns', requireAdmin, async (req, res) => {
  try {
    const { subject, body } = z.object({
      subject: z.string().min(1, 'Subject is required'),
      body: z.string().min(1, 'Body is required'),
    }).parse(req.body);

    const campaign = await storage.createNewsletterCampaign({
      subject,
      body,
      createdById: req.user!.id,
    });

    await auditLog(
      req.user!.id,
      'CREATE',
      'NEWSLETTER_CAMPAIGN',
      campaign.id,
      null,
      { subject },
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json(campaign);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    logger.error({ err: error }, 'Error creating newsletter campaign:');
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Get single campaign
router.get('/newsletter-campaigns/:id', requireAdmin, async (req, res) => {
  try {
    const campaign = await storage.getNewsletterCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching newsletter campaign:');
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Update draft campaign
router.put('/newsletter-campaigns/:id', requireAdmin, async (req, res) => {
  try {
    const campaign = await storage.getNewsletterCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status === 'sent') return res.status(400).json({ error: 'Cannot edit a sent campaign' });

    const { subject, body } = z.object({
      subject: z.string().min(1).optional(),
      body: z.string().min(1).optional(),
    }).parse(req.body);

    const updated = await storage.updateNewsletterCampaign(req.params.id, { subject, body } as any);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.errors });
    logger.error({ err: error }, 'Error updating newsletter campaign:');
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Send campaign
router.post('/newsletter-campaigns/:id/send', requireAdmin, async (req, res) => {
  try {
    const campaign = await storage.getNewsletterCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status === 'sent') return res.status(400).json({ error: 'Campaign already sent' });

    const subscribers = await storage.getAllNewsletterSubscribers();
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No subscribers to send to' });
    }

    const emailBody = generateBulkEmailHtml(campaign.subject, campaign.body);
    const bccList = subscribers.map(s => s.email).join(',');

    const success = await sendEmail({
      to: process.env.GMAIL_EMAIL || '',
      subject: campaign.subject,
      html: emailBody,
      bcc: bccList,
    });

    if (!success) {
      return res.status(500).json({ error: 'Failed to send campaign email' });
    }

    // Update campaign status
    await storage.markNewsletterCampaignSent(req.params.id, subscribers.length);

    await auditLog(
      req.user!.id,
      'CREATE',
      'NEWSLETTER_SEND',
      req.params.id,
      null,
      { subject: campaign.subject, recipientCount: subscribers.length },
      req.ip,
      req.get('User-Agent')
    );

    res.json({ success: true, recipientCount: subscribers.length });
  } catch (error) {
    logger.error({ err: error }, 'Error sending newsletter campaign:');
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Delete campaign
router.delete('/newsletter-campaigns/:id', requireAdmin, async (req, res) => {
  try {
    const campaign = await storage.getNewsletterCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    await storage.deleteNewsletterCampaign(req.params.id);

    await auditLog(
      req.user!.id,
      'DELETE',
      'NEWSLETTER_CAMPAIGN',
      req.params.id,
      { subject: campaign.subject },
      null,
      req.ip,
      req.get('User-Agent')
    );

    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting newsletter campaign:');
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// ================================
// SUBSCRIPTION MANAGEMENT (ADMIN ONLY)
// ================================

// Grant or revoke premium subscription
router.patch('/users/:id/subscription', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = z.object({
      action: z.enum(['grant', 'revoke']),
    }).parse(req.body);

    const targetUser = await storage.getUser(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldData = {
      subscriptionTier: targetUser.subscriptionTier,
      subscriptionStatus: targetUser.subscriptionStatus,
    };

    if (action === 'grant') {
      const now = new Date();
      await storage.updateUserSubscription(id, {
        subscriptionTier: 'premium',
        subscriptionStatus: 'active',
        subscriptionStartDate: now,
        subscriptionEndDate: null,
        premiumGrantedBy: req.user!.id,
        premiumGrantedAt: now,
      });

      await storage.createSubscriptionRecord({
        userId: id,
        tier: 'premium',
        status: 'active',
        source: 'admin_grant',
        startDate: now,
        grantedByAdminId: req.user!.id,
        notes: `Premium granted by admin ${req.user!.email || req.user!.id}`,
      });
    } else {
      await storage.updateUserSubscription(id, {
        subscriptionTier: 'free',
        subscriptionStatus: 'none',
        subscriptionEndDate: new Date(),
      });

      await storage.createSubscriptionRecord({
        userId: id,
        tier: 'free',
        status: 'cancelled',
        source: 'admin_grant',
        startDate: new Date(),
        cancelledAt: new Date(),
        grantedByAdminId: req.user!.id,
        notes: `Premium revoked by admin ${req.user!.email || req.user!.id}`,
      });
    }

    const updatedUser = await storage.getUser(id);

    await auditLog(
      req.user!.id,
      action === 'grant' ? 'GRANT_PREMIUM' : 'REVOKE_PREMIUM',
      'USER',
      id,
      oldData,
      { subscriptionTier: updatedUser?.subscriptionTier, subscriptionStatus: updatedUser?.subscriptionStatus },
      req.ip,
      req.get('User-Agent')
    );

    res.json(updatedUser);
  } catch (error) {
    logger.error({ err: error }, 'Error updating subscription:');
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Get subscription stats (with churn rate)
router.get('/subscription-stats', requireAdmin, async (req, res) => {
  try {
    const stats = await storage.getSubscriptionStatsWithChurn();
    res.json(stats);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching subscription stats:');
    res.status(500).json({ error: 'Failed to fetch subscription stats' });
  }
});

// List all users with subscription info (supports search)
router.get('/subscribers', requireAdmin, async (req, res) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const subscribers = await storage.getAllSubscribers(search);
    // Return relevant subscription fields
    const result = subscribers.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      subscriptionStatus: u.subscriptionStatus || 'none',
      subscriptionTier: u.subscriptionTier || 'free',
      subscriptionStartDate: u.subscriptionStartDate,
      subscriptionEndDate: u.subscriptionEndDate,
      stripeCustomerId: u.stripeCustomerId,
      createdAt: u.createdAt,
    }));
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching subscribers:');
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// Admin manually update a user's subscription
router.patch('/subscribers/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const schema = z.object({
      status: z.enum(['active', 'cancelled', 'expired']),
      plan: z.string().min(1),
      endDate: z.string().nullable(),
    });
    const data = schema.parse(req.body);

    const oldUser = await storage.getUser(userId);
    if (!oldUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await storage.adminUpdateSubscription(userId, data);

    // Create a subscription history record
    await storage.createSubscriptionRecord({
      userId,
      tier: data.plan,
      status: data.status,
      source: 'manual',
      startDate: updatedUser.subscriptionStartDate || new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      grantedByAdminId: req.user!.id,
      notes: `Manual override by admin ${req.user!.email || req.user!.id}: status=${data.status}, plan=${data.plan}`,
    });

    await auditLog(
      req.user!.id,
      'UPDATE',
      'SUBSCRIPTION',
      userId,
      { subscriptionStatus: oldUser.subscriptionStatus, subscriptionTier: oldUser.subscriptionTier },
      { subscriptionStatus: data.status, subscriptionTier: data.plan },
      req.ip,
      req.get('User-Agent')
    );

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    logger.error({ err: error }, 'Error updating subscriber:');
    res.status(500).json({ error: 'Failed to update subscriber' });
  }
});

// ================================
// TRUST STRUCTURE (ADMIN ONLY)
// ================================

// Get entire trust structure (entities + relationships)
router.get('/trust-structure', requireAdmin, async (req, res) => {
  try {
    const structure = await storage.getTrustStructure();
    res.json(structure);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching trust structure');
    res.status(500).json({ error: 'Failed to fetch trust structure' });
  }
});

// Seed trust structure with default data
router.post('/trust-structure/seed', requireAdmin, async (req, res) => {
  try {
    await storage.seedTrustStructure();
    const structure = await storage.getTrustStructure();
    res.json(structure);
  } catch (error) {
    logger.error({ err: error }, 'Error seeding trust structure');
    res.status(500).json({ error: 'Failed to seed trust structure' });
  }
});

// Reset trust structure — delete everything and re-seed defaults
router.post('/trust-structure/reset', requireAdmin, async (req, res) => {
  try {
    await storage.resetTrustStructure();
    const structure = await storage.getTrustStructure();
    await auditLog(req.user!.id, 'DELETE', 'TRUST_STRUCTURE', 'all', null, { action: 'reset' }, req.ip, req.headers['user-agent']);
    res.json(structure);
  } catch (error) {
    logger.error({ err: error }, 'Error resetting trust structure');
    res.status(500).json({ error: 'Failed to reset trust structure' });
  }
});

// Create a trust entity
router.post('/trust-entities', requireAdmin, async (req, res) => {
  try {
    const data = insertTrustEntitySchema.parse(req.body);
    const entity = await storage.createTrustEntity(data);
    await auditLog(req.user!.id, 'CREATE', 'TRUST_ENTITY', entity.id, null, { name: entity.name, layer: entity.layer }, req.ip, req.headers['user-agent']);
    res.json(entity);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    logger.error({ err: error }, 'Error creating trust entity');
    res.status(500).json({ error: 'Failed to create trust entity' });
  }
});

// Update a trust entity
router.put('/trust-entities/:id', requireAdmin, async (req, res) => {
  try {
    const entity = await storage.updateTrustEntity(req.params.id, req.body);
    await auditLog(req.user!.id, 'UPDATE', 'TRUST_ENTITY', entity.id, null, { name: entity.name }, req.ip, req.headers['user-agent']);
    res.json(entity);
  } catch (error) {
    logger.error({ err: error }, 'Error updating trust entity');
    res.status(500).json({ error: 'Failed to update trust entity' });
  }
});

// Delete a trust entity
router.delete('/trust-entities/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteTrustEntity(req.params.id);
    await auditLog(req.user!.id, 'DELETE', 'TRUST_ENTITY', req.params.id, null, null, req.ip, req.headers['user-agent']);
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting trust entity');
    res.status(500).json({ error: 'Failed to delete trust entity' });
  }
});

// Create a trust relationship
router.post('/trust-relationships', requireAdmin, async (req, res) => {
  try {
    const data = insertTrustRelationshipSchema.parse(req.body);
    const rel = await storage.createTrustRelationship(data);
    res.json(rel);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    logger.error({ err: error }, 'Error creating trust relationship');
    res.status(500).json({ error: 'Failed to create trust relationship' });
  }
});

// Delete a trust relationship
router.delete('/trust-relationships/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteTrustRelationship(req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting trust relationship');
    res.status(500).json({ error: 'Failed to delete trust relationship' });
  }
});

// ================================
// TRUST DOCUMENT TEMPLATES
// ================================

router.get('/trust-document-templates', requireAdmin, async (req, res) => {
  try {
    const templates = await storage.getTrustDocumentTemplates();
    res.json(templates);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching trust document templates');
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.get('/trust-document-templates/:id', requireAdmin, async (req, res) => {
  try {
    const template = await storage.getTrustDocumentTemplate(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json(template);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching trust document template');
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

router.post('/trust-document-templates', requireAdmin, async (req, res) => {
  try {
    const { name, description, applicableLayers, status } = req.body;
    const template = await storage.createTrustDocumentTemplate({ name, description, applicableLayers, status });
    res.json(template);
  } catch (error) {
    logger.error({ err: error }, 'Error creating trust document template');
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.put('/trust-document-templates/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, applicableLayers, status } = req.body;
    const template = await storage.updateTrustDocumentTemplate(req.params.id, { name, description, applicableLayers, status });
    res.json(template);
  } catch (error) {
    logger.error({ err: error }, 'Error updating trust document template');
    res.status(500).json({ error: 'Failed to update template' });
  }
});

router.delete('/trust-document-templates/:id', requireAdmin, async (req, res) => {
  try {
    const template = await storage.getTrustDocumentTemplate(req.params.id);
    if (template?.isBuiltIn) {
      return res.status(400).json({ error: 'Cannot delete built-in templates' });
    }
    await storage.deleteTrustDocumentTemplate(req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting trust document template');
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

router.post('/trust-document-templates/:id/sections', requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body;
    const result = await storage.replaceTrustTemplateSections(req.params.id, sections);
    await storage.updateTrustDocumentTemplate(req.params.id, {});
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, 'Error replacing template sections');
    res.status(500).json({ error: 'Failed to update sections' });
  }
});

router.post('/trust-document-templates/seed', requireAdmin, async (req, res) => {
  try {
    await storage.reseedTrustDocumentTemplates();
    const templates = await storage.getTrustDocumentTemplates();
    res.json(templates);
  } catch (error) {
    logger.error({ err: error }, 'Error seeding trust document templates');
    res.status(500).json({ error: 'Failed to seed templates' });
  }
});

// ================================
// TRUST DOCUMENTS
// ================================

router.get('/trust-documents', requireAdmin, async (req, res) => {
  try {
    const docs = await storage.getTrustDocuments();
    res.json(docs);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching trust documents');
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/trust-documents/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await storage.getTrustDocumentById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(doc);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching trust document');
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

router.post('/trust-documents/generate', requireAdmin, async (req, res) => {
  try {
    const { entityId, templateId, title, subtitle, sections } = req.body;
    const doc = await storage.createTrustDocumentWithSections(
      { entityId, templateId, title, subtitle, status: 'draft' },
      sections || []
    );
    res.json(doc);
  } catch (error) {
    logger.error({ err: error }, 'Error generating trust document');
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

// Generate documents for ALL entities × ALL applicable templates (seeds templates first if needed)
router.post('/trust-documents/generate-all', requireAdmin, async (req, res) => {
  try {
    // Ensure trust structure exists
    await storage.seedTrustStructure();
    // Force reseed built-in templates to ensure latest versions are available
    await storage.reseedTrustDocumentTemplates();
    const templates = await storage.getTrustDocumentTemplates();
    const { entities, relationships } = await storage.getTrustStructure();
    logger.info({ entityCount: entities.length, templateCount: templates.length }, 'Generate all: entities and templates loaded');

    // Check which entity+template combos already have documents
    const existingDocs = await storage.getTrustDocuments();
    const existingCombos = new Set(existingDocs.map(d => `${d.entityId}:${d.templateId}`));

    const generated = [];
    for (const entity of entities) {
      // Find ALL applicable templates for this entity's layer
      const applicableTemplates = templates.filter(t =>
        (t.applicableLayers || []).includes(entity.layer)
      );

      if (applicableTemplates.length === 0) continue;

      const resolved = resolveEntity(entity, entities, relationships);

      for (const template of applicableTemplates) {
        // Skip if this entity+template combo already exists
        if (existingCombos.has(`${entity.id}:${template.id}`)) continue;

        const resolvedSections = template.sections.map((s, i) => ({
          title: s.title,
          content: resolveVariables(s.contentTemplate, resolved),
          sortOrder: s.sortOrder ?? i,
        }));

        const doc = await storage.createTrustDocumentWithSections(
          { entityId: entity.id, templateId: template.id, title: template.name, subtitle: entity.name, status: 'draft' },
          resolvedSections
        );
        generated.push(doc);
      }
    }

    res.json({ generated: generated.length, documents: generated });
  } catch (error) {
    logger.error({ err: error }, 'Error generating all trust documents');
    res.status(500).json({ error: 'Failed to generate all documents' });
  }
});

router.put('/trust-documents/:id', requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, status } = req.body;
    const doc = await storage.updateTrustDocumentMeta(req.params.id, { title, subtitle, status });
    res.json(doc);
  } catch (error) {
    logger.error({ err: error }, 'Error updating trust document');
    res.status(500).json({ error: 'Failed to update document' });
  }
});

router.put('/trust-documents/:id/sections/:sectionId', requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;
    const section = await storage.updateTrustDocumentSectionContent(req.params.sectionId, content);
    res.json(section);
  } catch (error) {
    logger.error({ err: error }, 'Error updating document section');
    res.status(500).json({ error: 'Failed to update section' });
  }
});

router.post('/trust-documents/:id/reset', requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body;
    const doc = await storage.resetTrustDocumentFromTemplate(req.params.id, sections || []);
    res.json(doc);
  } catch (error) {
    logger.error({ err: error }, 'Error resetting trust document');
    res.status(500).json({ error: 'Failed to reset document' });
  }
});

router.delete('/trust-documents/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteTrustDocumentById(req.params.id);
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting trust document');
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ================================
// TREASURY MANAGEMENT (ADMIN ONLY)
// ================================

router.get('/treasury/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await storage.getTreasuryStats();
    res.json(stats);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching treasury stats');
    res.status(500).json({ error: 'Failed to fetch treasury stats' });
  }
});

router.get('/treasury/transactions', requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const transactions = await storage.getTreasuryTransactions(limit, offset);
    res.json(transactions);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching treasury transactions');
    res.status(500).json({ error: 'Failed to fetch treasury transactions' });
  }
});

router.post('/treasury/transactions', requireAdmin, async (req, res) => {
  try {
    const { amount, description, notes } = z.object({
      amount: z.number(),
      description: z.string().min(1),
      notes: z.string().optional(),
    }).parse(req.body);

    const amountCents = Math.round(amount * 100);
    const transaction = await storage.createTreasuryTransaction({
      type: 'manual_adjustment',
      amountCents,
      currency: 'USD',
      description,
      notes: notes || null,
      performedByAdminId: req.user!.id,
    });
    res.json(transaction);
  } catch (error) {
    logger.error({ err: error }, 'Error creating treasury transaction');
    res.status(500).json({ error: 'Failed to create treasury transaction' });
  }
});

router.get('/treasury/settings/:key', requireAdmin, async (req, res) => {
  try {
    const setting = await storage.getTreasurySetting(req.params.key);
    if (!setting) return res.status(404).json({ error: 'Setting not found' });
    res.json(setting);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching treasury setting');
    res.status(500).json({ error: 'Failed to fetch treasury setting' });
  }
});

router.put('/treasury/settings/:key', requireAdmin, async (req, res) => {
  try {
    const { value } = z.object({ value: z.string() }).parse(req.body);
    const setting = await storage.upsertTreasurySetting(req.params.key, value, req.user!.id);
    res.json(setting);
  } catch (error) {
    logger.error({ err: error }, 'Error updating treasury setting');
    res.status(500).json({ error: 'Failed to update treasury setting' });
  }
});

// ================================
// BAS TOKEN MANAGEMENT (ADMIN ONLY)
// ================================

// Config
router.get('/bas/config', requireAdmin, async (req, res) => {
  try {
    const config = await storage.getBasTokenConfig();
    res.json(config);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching BAS config');
    res.status(500).json({ error: 'Failed to fetch BAS config' });
  }
});

router.put('/bas/config/:key', requireAdmin, async (req, res) => {
  try {
    const { value, description } = z.object({ value: z.string(), description: z.string().optional() }).parse(req.body);
    const config = await storage.upsertBasTokenConfig(req.params.key, value, description, req.user!.id);
    await auditLog(req.user!.id, 'UPDATE', 'BAS_TOKEN_CONFIG', config.id, null, { key: req.params.key, value }, req.ip, req.get('User-Agent'));
    res.json(config);
  } catch (error) {
    logger.error({ err: error }, 'Error updating BAS config');
    res.status(500).json({ error: 'Failed to update BAS config' });
  }
});

router.patch('/bas/config/:id/visibility', requireAdmin, async (req, res) => {
  try {
    const { isVisible } = z.object({ isVisible: z.boolean() }).parse(req.body);
    const config = await storage.updateBasTokenConfigVisibility(req.params.id, isVisible);
    await auditLog(req.user!.id, 'UPDATE', 'BAS_TOKEN_CONFIG', req.params.id, null, { isVisible }, req.ip, req.get('User-Agent'));
    res.json(config);
  } catch (error) {
    logger.error({ err: error }, 'Error toggling BAS config visibility');
    res.status(500).json({ error: 'Failed to toggle BAS config visibility' });
  }
});

router.delete('/bas/config/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteBasTokenConfig(req.params.id);
    await auditLog(req.user!.id, 'DELETE', 'BAS_TOKEN_CONFIG', req.params.id, null, null, req.ip, req.get('User-Agent'));
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting BAS config');
    res.status(500).json({ error: 'Failed to delete BAS config' });
  }
});

// Allocations
router.get('/bas/allocations', requireAdmin, async (req, res) => {
  try {
    const allocations = await storage.getBasAllocations();
    res.json(allocations);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching BAS allocations');
    res.status(500).json({ error: 'Failed to fetch BAS allocations' });
  }
});

router.post('/bas/allocations', requireAdmin, async (req, res) => {
  try {
    const data = insertBasAllocationSchema.parse(req.body);
    const allocation = await storage.createBasAllocation(data);
    await auditLog(req.user!.id, 'CREATE', 'BAS_ALLOCATION', allocation.id, null, data, req.ip, req.get('User-Agent'));
    res.json(allocation);
  } catch (error) {
    logger.error({ err: error }, 'Error creating BAS allocation');
    res.status(500).json({ error: 'Failed to create BAS allocation' });
  }
});

router.patch('/bas/allocations/:id', requireAdmin, async (req, res) => {
  try {
    const data = insertBasAllocationSchema.partial().parse(req.body);
    const allocation = await storage.updateBasAllocation(req.params.id, data);
    await auditLog(req.user!.id, 'UPDATE', 'BAS_ALLOCATION', req.params.id, null, data, req.ip, req.get('User-Agent'));
    res.json(allocation);
  } catch (error) {
    logger.error({ err: error }, 'Error updating BAS allocation');
    res.status(500).json({ error: 'Failed to update BAS allocation' });
  }
});

router.delete('/bas/allocations/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteBasAllocation(req.params.id);
    await auditLog(req.user!.id, 'DELETE', 'BAS_ALLOCATION', req.params.id, null, null, req.ip, req.get('User-Agent'));
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting BAS allocation');
    res.status(500).json({ error: 'Failed to delete BAS allocation' });
  }
});

// Roadmap
router.get('/bas/roadmap', requireAdmin, async (req, res) => {
  try {
    const milestones = await storage.getBasRoadmapMilestones();
    res.json(milestones);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching BAS roadmap');
    res.status(500).json({ error: 'Failed to fetch BAS roadmap' });
  }
});

router.post('/bas/roadmap', requireAdmin, async (req, res) => {
  try {
    const data = insertBasRoadmapMilestoneSchema.parse(req.body);
    const milestone = await storage.createBasRoadmapMilestone(data);
    await auditLog(req.user!.id, 'CREATE', 'BAS_ROADMAP', milestone.id, null, data, req.ip, req.get('User-Agent'));
    res.json(milestone);
  } catch (error) {
    logger.error({ err: error }, 'Error creating BAS roadmap milestone');
    res.status(500).json({ error: 'Failed to create BAS roadmap milestone' });
  }
});

router.patch('/bas/roadmap/:id', requireAdmin, async (req, res) => {
  try {
    const data = insertBasRoadmapMilestoneSchema.partial().parse(req.body);
    const milestone = await storage.updateBasRoadmapMilestone(req.params.id, data);
    await auditLog(req.user!.id, 'UPDATE', 'BAS_ROADMAP', req.params.id, null, data, req.ip, req.get('User-Agent'));
    res.json(milestone);
  } catch (error) {
    logger.error({ err: error }, 'Error updating BAS roadmap milestone');
    res.status(500).json({ error: 'Failed to update BAS roadmap milestone' });
  }
});

router.delete('/bas/roadmap/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteBasRoadmapMilestone(req.params.id);
    await auditLog(req.user!.id, 'DELETE', 'BAS_ROADMAP', req.params.id, null, null, req.ip, req.get('User-Agent'));
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting BAS roadmap milestone');
    res.status(500).json({ error: 'Failed to delete BAS roadmap milestone' });
  }
});

// Council
router.get('/bas/council', requireAdmin, async (req, res) => {
  try {
    const members = await storage.getBasCouncilMembers();
    res.json(members);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching BAS council');
    res.status(500).json({ error: 'Failed to fetch BAS council' });
  }
});

router.post('/bas/council', requireAdmin, async (req, res) => {
  try {
    const data = insertBasCouncilMemberSchema.parse(req.body);
    const member = await storage.createBasCouncilMember(data);
    await auditLog(req.user!.id, 'CREATE', 'BAS_COUNCIL', member.id, null, data, req.ip, req.get('User-Agent'));
    res.json(member);
  } catch (error) {
    logger.error({ err: error }, 'Error creating BAS council member');
    res.status(500).json({ error: 'Failed to create BAS council member' });
  }
});

router.patch('/bas/council/:id', requireAdmin, async (req, res) => {
  try {
    const data = insertBasCouncilMemberSchema.partial().parse(req.body);
    const member = await storage.updateBasCouncilMember(req.params.id, data);
    await auditLog(req.user!.id, 'UPDATE', 'BAS_COUNCIL', req.params.id, null, data, req.ip, req.get('User-Agent'));
    res.json(member);
  } catch (error) {
    logger.error({ err: error }, 'Error updating BAS council member');
    res.status(500).json({ error: 'Failed to update BAS council member' });
  }
});

router.delete('/bas/council/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteBasCouncilMember(req.params.id);
    await auditLog(req.user!.id, 'DELETE', 'BAS_COUNCIL', req.params.id, null, null, req.ip, req.get('User-Agent'));
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting BAS council member');
    res.status(500).json({ error: 'Failed to delete BAS council member' });
  }
});

// FAQ
router.get('/bas/faq', requireAdmin, async (req, res) => {
  try {
    const entries = await storage.getBasFaqEntries();
    res.json(entries);
  } catch (error) {
    logger.error({ err: error }, 'Error fetching BAS FAQ');
    res.status(500).json({ error: 'Failed to fetch BAS FAQ' });
  }
});

router.post('/bas/faq', requireAdmin, async (req, res) => {
  try {
    const data = insertBasFaqEntrySchema.parse(req.body);
    const entry = await storage.createBasFaqEntry(data);
    await auditLog(req.user!.id, 'CREATE', 'BAS_FAQ', entry.id, null, data, req.ip, req.get('User-Agent'));
    res.json(entry);
  } catch (error) {
    logger.error({ err: error }, 'Error creating BAS FAQ entry');
    res.status(500).json({ error: 'Failed to create BAS FAQ entry' });
  }
});

router.patch('/bas/faq/:id', requireAdmin, async (req, res) => {
  try {
    const data = insertBasFaqEntrySchema.partial().parse(req.body);
    const entry = await storage.updateBasFaqEntry(req.params.id, data);
    await auditLog(req.user!.id, 'UPDATE', 'BAS_FAQ', req.params.id, null, data, req.ip, req.get('User-Agent'));
    res.json(entry);
  } catch (error) {
    logger.error({ err: error }, 'Error updating BAS FAQ entry');
    res.status(500).json({ error: 'Failed to update BAS FAQ entry' });
  }
});

router.delete('/bas/faq/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteBasFaqEntry(req.params.id);
    await auditLog(req.user!.id, 'DELETE', 'BAS_FAQ', req.params.id, null, null, req.ip, req.get('User-Agent'));
    res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, 'Error deleting BAS FAQ entry');
    res.status(500).json({ error: 'Failed to delete BAS FAQ entry' });
  }
});

// Seed defaults
router.post('/bas/seed', requireAdmin, async (req, res) => {
  try {
    await storage.seedBasTokenDefaults();
    await auditLog(req.user!.id, 'CREATE', 'BAS_SEED', 'defaults', null, null, req.ip, req.get('User-Agent'));
    res.json({ success: true, message: 'BAS token defaults seeded' });
  } catch (error) {
    logger.error({ err: error }, 'Error seeding BAS defaults');
    res.status(500).json({ error: 'Failed to seed BAS defaults' });
  }
});

export default router;