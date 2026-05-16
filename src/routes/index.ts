import { Router, Request, Response } from "express";
import { authRoutes } from "./auth/AuthRoutes";
import { projectRoutes } from "./project";
import { taskRoutes } from "./task";
import { dashboardRoutes } from "./dashboard";


const routers = Router();

routers.use("/auth", authRoutes);
routers.use("/projects", projectRoutes);
routers.use("/tasks", taskRoutes);
routers.use("/dashboard", dashboardRoutes);


routers.get("/health-check", (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "router health: OK" });
});

export default routers;
