import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { pool } from "./db";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const PgStore = connectPgSimple(session);

export const sessionMiddleware = session({
  store: new PgStore({
    pool,
    tableName: "session",       // auto-created on first run
    createTableIfMissing: true,
  }),
  secret: (() => {
    const secret = process.env.SESSION_SECRET;
    if (!secret) throw new Error("SESSION_SECRET env var is required");
    return secret;
  })(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
});

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    req.session.userId = undefined;
    return res.status(401).json({ error: "Invalid session" });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: "Account suspended" });
  }

  (req as any).user = user;
  next();
};

export const requireInstructor = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!['admin', 'moderator', 'instructor'].includes(user.role || '')) {
    return res.status(403).json({ error: "Instructor access required" });
  }
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user) {
      (req as any).user = user;
    }
  }
  next();
};