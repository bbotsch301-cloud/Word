import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// Mock the logger to avoid pino initialization
vi.mock("../logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import {
  requireAuth,
  requireAdmin,
  requireModerator,
  requireInstructor,
  loadUser,
} from "../adminMiddleware";

function mockReq(user?: any): Request {
  const req = {
    session: user ? { userId: user.id } : ({} as any),
    user,
  } as unknown as Request;
  return req;
}

function mockRes(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe("Route security: protected endpoints return 401 without auth", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("requireAuth returns 401 when session has no userId", () => {
    const req = mockReq();
    const res = mockRes();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("requireAuth calls next when session contains userId", () => {
    const req = {
      session: { userId: "user-1" } as any,
    } as unknown as Request;
    const res = mockRes();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("requireAdmin returns 401 when no user is attached to request", () => {
    const req = mockReq();
    const res = mockRes();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("requireModerator returns 401 when no user is attached", () => {
    const req = mockReq();
    const res = mockRes();

    requireModerator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("requireInstructor returns 401 when no user is attached", () => {
    const req = mockReq();
    const res = mockRes();

    requireInstructor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe("Route security: admin endpoints return 403 for non-admin users", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("returns 403 for student role on admin-only endpoint", () => {
    const req = mockReq({ id: "u1", role: "student" });
    const res = mockRes();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 for instructor role on admin-only endpoint", () => {
    const req = mockReq({ id: "u2", role: "instructor" });
    const res = mockRes();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 for moderator role on admin-only endpoint", () => {
    const req = mockReq({ id: "u3", role: "moderator" });
    const res = mockRes();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows admin role through admin-only endpoint", () => {
    const req = mockReq({ id: "u4", role: "admin" });
    const res = mockRes();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("Route security: forum category creation requires moderator role", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("rejects student from creating forum categories", () => {
    const req = mockReq({ id: "u1", role: "student" });
    const res = mockRes();

    requireModerator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Moderator access required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects instructor from creating forum categories", () => {
    const req = mockReq({ id: "u2", role: "instructor" });
    const res = mockRes();

    requireModerator(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows moderator to create forum categories", () => {
    const req = mockReq({ id: "u3", role: "moderator" });
    const res = mockRes();

    requireModerator(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("allows admin to create forum categories", () => {
    const req = mockReq({ id: "u4", role: "admin" });
    const res = mockRes();

    requireModerator(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("Route security: instructor endpoints require instructor+ role", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
  });

  it("rejects student from instructor endpoints", () => {
    const req = mockReq({ id: "u1", role: "student" });
    const res = mockRes();

    requireInstructor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Instructor access required" });
    expect(next).not.toHaveBeenCalled();
  });

  it.each(["admin", "moderator", "instructor"])(
    "allows %s role through instructor endpoints",
    (role) => {
      const req = mockReq({ id: "u1", role });
      const res = mockRes();

      requireInstructor(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    }
  );
});

describe("loadUser middleware", () => {
  let next: NextFunction;

  beforeEach(() => {
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("calls next without attaching user when no session userId", async () => {
    const req = {
      session: {} as any,
    } as unknown as Request;
    const res = mockRes();

    await loadUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("calls next even when session userId is present (loads user from storage)", async () => {
    // Mock the dynamic import of storage
    vi.mock("../storage", () => ({
      storage: {
        getUser: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "test@example.com",
          role: "student",
        }),
      },
    }));

    const req = {
      session: { userId: "user-1" } as any,
    } as unknown as Request;
    const res = mockRes();

    await loadUser(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
