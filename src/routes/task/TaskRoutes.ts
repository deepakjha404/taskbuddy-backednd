import { RequestHandler, Router } from "express";
import TaskService from "./TaskService";
import { validate } from "../../utils/validations";
import {
  createTaskValidation,
  updateStatusValidation,
  updateTaskValidation,
} from "./TaskValidations";
import { verifyToken } from "../../utils/auth";

const taskRoutes = Router();

taskRoutes.get("/my", verifyToken(), TaskService.getMyTasks as RequestHandler);

taskRoutes.get(
  "/projects/:projectId",
  verifyToken(),
  TaskService.getProjectTasks as RequestHandler,
);

taskRoutes.post(
  "/projects/:projectId",
  verifyToken(),
  validate(createTaskValidation),
  TaskService.createTask as RequestHandler,
);

taskRoutes.put(
  "/:taskId",
  verifyToken(),
  validate(updateTaskValidation),
  TaskService.updateTask as RequestHandler,
);

taskRoutes.patch(
  "/:taskId/status",
  verifyToken(),
  validate(updateStatusValidation),
  TaskService.updateTaskStatus as RequestHandler,
);

taskRoutes.delete("/:taskId", verifyToken(), TaskService.deleteTask as RequestHandler);

export { taskRoutes };
