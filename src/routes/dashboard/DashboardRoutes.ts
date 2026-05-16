import { RequestHandler, Router } from "express";
import { verifyToken } from "../../utils/auth";
import DashboardService from "./DashboardService";

const dashboardRoutes = Router();

dashboardRoutes.get(
  "/",
  verifyToken(),
  DashboardService.getDashboard as RequestHandler,
);

export { dashboardRoutes };
