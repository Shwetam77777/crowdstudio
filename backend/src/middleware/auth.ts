import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    // Explicit failure — never fail-open. A prior audit found a fail-open
    // auth bug in a related project; this route always denies on error.
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Optional auth: attaches userId if present/valid, but never blocks the request.
// Used for routes like GET /tracks where likes state is nice-to-have.
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
      req.userId = payload.userId;
    } catch {
      // ignore — treat as anonymous
    }
  }
  next();
}
