import { describe, it, expect } from "vitest";
import {
  insertUserSchema,
  insertContactSchema,
  insertNewsletterSchema,
  insertForumThreadSchema,
  insertForumReplySchema,
  insertForumCategorySchema,
  insertEnrollmentSchema,
  createProofHashSchema,
  loginSchema,
  updateUserRoleSchema,
  updatePageContentSchema,
} from "../schema";

describe("insertUserSchema", () => {
  const validUser = {
    email: "test@example.com",
    password: "Str0ng!Pass",
    firstName: "John",
    lastName: "Doe",
    privacyAccepted: true as const,
  };

  it("accepts a valid user with all required fields", () => {
    const result = insertUserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("accepts user with optional username", () => {
    const result = insertUserSchema.safeParse({
      ...validUser,
      username: "johndoe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email field", () => {
    const { email: _, ...noEmail } = validUser;
    const result = insertUserSchema.safeParse(noEmail);
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = insertUserSchema.safeParse({
      ...validUser,
      password: "Sh0rt!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages.some((m) => m.includes("8 characters"))).toBe(true);
    }
  });

  it("rejects password missing uppercase letter", () => {
    const result = insertUserSchema.safeParse({
      ...validUser,
      password: "alllower1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password missing lowercase letter", () => {
    const result = insertUserSchema.safeParse({
      ...validUser,
      password: "ALLUPPER1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password missing digit", () => {
    const result = insertUserSchema.safeParse({
      ...validUser,
      password: "NoDigits!Here",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password missing special character", () => {
    const result = insertUserSchema.safeParse({
      ...validUser,
      password: "NoSpecial1Char",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when privacyAccepted is false", () => {
    const result = insertUserSchema.safeParse({
      ...validUser,
      privacyAccepted: false,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when privacyAccepted is missing", () => {
    const { privacyAccepted: _, ...noPrivacy } = validUser;
    const result = insertUserSchema.safeParse(noPrivacy);
    expect(result.success).toBe(false);
  });

  it("rejects when firstName is missing", () => {
    const { firstName: _, ...noFirst } = validUser;
    const result = insertUserSchema.safeParse(noFirst);
    expect(result.success).toBe(false);
  });

  it("rejects when lastName is missing", () => {
    const { lastName: _, ...noLast } = validUser;
    const result = insertUserSchema.safeParse(noLast);
    expect(result.success).toBe(false);
  });
});

describe("insertContactSchema", () => {
  const validContact = {
    name: "Jane Smith",
    email: "jane@example.com",
    subject: "Inquiry",
    message: "I have a question about your services.",
  };

  it("accepts valid contact data", () => {
    const result = insertContactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const { name: _, ...noName } = validContact;
    const result = insertContactSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const { email: _, ...noEmail } = validContact;
    const result = insertContactSchema.safeParse(noEmail);
    expect(result.success).toBe(false);
  });

  it("rejects missing subject", () => {
    const { subject: _, ...noSubject } = validContact;
    const result = insertContactSchema.safeParse(noSubject);
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const { message: _, ...noMessage } = validContact;
    const result = insertContactSchema.safeParse(noMessage);
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    expect(insertContactSchema.safeParse({}).success).toBe(false);
  });
});

describe("insertNewsletterSchema", () => {
  it("accepts valid email", () => {
    const result = insertNewsletterSchema.safeParse({ email: "user@test.com" });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = insertNewsletterSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("insertForumThreadSchema", () => {
  const validThread = {
    title: "Discussion topic",
    content: "This is the thread body",
    categoryId: "cat-1",
    authorId: "user-1",
  };

  it("accepts valid thread data", () => {
    const result = insertForumThreadSchema.safeParse(validThread);
    expect(result.success).toBe(true);
  });

  it("accepts thread with optional isPinned and isLocked", () => {
    const result = insertForumThreadSchema.safeParse({
      ...validThread,
      isPinned: true,
      isLocked: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _, ...noTitle } = validThread;
    const result = insertForumThreadSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it("rejects missing content", () => {
    const { content: _, ...noContent } = validThread;
    const result = insertForumThreadSchema.safeParse(noContent);
    expect(result.success).toBe(false);
  });

  it("rejects missing categoryId", () => {
    const { categoryId: _, ...noCat } = validThread;
    const result = insertForumThreadSchema.safeParse(noCat);
    expect(result.success).toBe(false);
  });

  it("rejects missing authorId", () => {
    const { authorId: _, ...noAuthor } = validThread;
    const result = insertForumThreadSchema.safeParse(noAuthor);
    expect(result.success).toBe(false);
  });
});

describe("insertForumReplySchema", () => {
  const validReply = {
    content: "Great point!",
    threadId: "thread-1",
    authorId: "user-2",
  };

  it("accepts valid reply data", () => {
    const result = insertForumReplySchema.safeParse(validReply);
    expect(result.success).toBe(true);
  });

  it("accepts reply with optional parentReplyId", () => {
    const result = insertForumReplySchema.safeParse({
      ...validReply,
      parentReplyId: "reply-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing content", () => {
    const { content: _, ...noContent } = validReply;
    const result = insertForumReplySchema.safeParse(noContent);
    expect(result.success).toBe(false);
  });

  it("rejects missing threadId", () => {
    const { threadId: _, ...noThread } = validReply;
    const result = insertForumReplySchema.safeParse(noThread);
    expect(result.success).toBe(false);
  });
});

describe("insertForumCategorySchema", () => {
  it("accepts valid category with name", () => {
    const result = insertForumCategorySchema.safeParse({
      name: "General Discussion",
    });
    expect(result.success).toBe(true);
  });

  it("accepts category with optional description and color", () => {
    const result = insertForumCategorySchema.safeParse({
      name: "Announcements",
      description: "Official announcements",
      color: "#FF0000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = insertForumCategorySchema.safeParse({
      description: "No name provided",
    });
    expect(result.success).toBe(false);
  });
});

describe("insertEnrollmentSchema", () => {
  it("accepts valid enrollment with courseId", () => {
    const result = insertEnrollmentSchema.safeParse({
      courseId: "course-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing courseId", () => {
    const result = insertEnrollmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "securepass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-valid",
      password: "securepass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty email string", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "securepass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password string", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
    expect(loginSchema.safeParse({ password: "12345678" }).success).toBe(false);
  });
});

describe("createProofHashSchema", () => {
  const validHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

  it("accepts valid 64-character hex SHA-256 hash", () => {
    const result = createProofHashSchema.safeParse({ sha256: validHash });
    expect(result.success).toBe(true);
  });

  it("accepts uppercase hex characters", () => {
    const result = createProofHashSchema.safeParse({
      sha256: validHash.toUpperCase(),
    });
    expect(result.success).toBe(true);
  });

  it("accepts hash with optional label", () => {
    const result = createProofHashSchema.safeParse({
      sha256: validHash,
      label: "My important document",
    });
    expect(result.success).toBe(true);
  });

  it("rejects label longer than 200 characters", () => {
    const result = createProofHashSchema.safeParse({
      sha256: validHash,
      label: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-hex characters", () => {
    const result = createProofHashSchema.safeParse({
      sha256: "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz",
    });
    expect(result.success).toBe(false);
  });

  it("rejects hash shorter than 64 characters", () => {
    const result = createProofHashSchema.safeParse({
      sha256: "abcdef1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects hash longer than 64 characters", () => {
    const result = createProofHashSchema.safeParse({
      sha256: validHash + "aa",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = createProofHashSchema.safeParse({ sha256: "" });
    expect(result.success).toBe(false);
  });
});

describe("updateUserRoleSchema", () => {
  it("accepts valid role update", () => {
    const result = updateUserRoleSchema.safeParse({
      userId: "user-123",
      role: "admin",
    });
    expect(result.success).toBe(true);
  });

  it.each(["student", "instructor", "moderator", "admin"])(
    "accepts %s as a valid role",
    (role) => {
      const result = updateUserRoleSchema.safeParse({ userId: "u1", role });
      expect(result.success).toBe(true);
    }
  );

  it("rejects role not in the enum", () => {
    const result = updateUserRoleSchema.safeParse({
      userId: "user-123",
      role: "superadmin",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing userId", () => {
    const result = updateUserRoleSchema.safeParse({ role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects missing role", () => {
    const result = updateUserRoleSchema.safeParse({ userId: "user-123" });
    expect(result.success).toBe(false);
  });
});

describe("updatePageContentSchema", () => {
  it("accepts contentValue with description", () => {
    const result = updatePageContentSchema.safeParse({
      contentValue: "https://example.com/image.jpg",
      description: "Hero image",
    });
    expect(result.success).toBe(true);
  });

  it("accepts contentValue without description", () => {
    const result = updatePageContentSchema.safeParse({
      contentValue: "Some text",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing contentValue", () => {
    const result = updatePageContentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty object", () => {
    const result = updatePageContentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
