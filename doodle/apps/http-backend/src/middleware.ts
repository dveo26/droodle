import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  console.log("Auth header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Missing or malformed token in header");
    res.status(401).json({
      message: "Missing or malformed token",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token);

  if (!token) {
    console.log("No token found after Bearer");
    res.status(401).json({
      message: "Missing token",
    });
    return;
  }

  try {
    console.log("Verifying token with secret:", JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log("Decoded token:", decoded);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(403).json({
      message: "Invalid token",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
