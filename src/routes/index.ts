import { Router, Request, Response } from "express";
import { authRoutes } from "./auth/AuthRoutes";


const routers = Router();

routers.use("/auth", authRoutes);


routers.get("/health-check", (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "router health: OK" });
});

export default routers;
