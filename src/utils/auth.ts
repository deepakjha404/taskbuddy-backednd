import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUSerDoc } from "../../lib/schemas";
declare global {
  namespace Express {
    interface Request {
      user: IUSerDoc | JwtPayload | string | any;
    }
  }
}
export const verifyToken = (permission?: string) =>
  (async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ error: "Access denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as jwt.JwtPayload;

      req.user = decoded.user as JwtPayload;

      return next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  }) as RequestHandler;
