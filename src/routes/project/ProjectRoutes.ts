import { RequestHandler, Router } from "express";
import ProjectService from "./ProjectService";
import { validate } from "../../utils/validations";
import {
  createProjectValidation,
  memberValidation,
  updateProjectValidation,
} from "./ProjectValidations";
import { verifyToken } from "../../utils/auth";

const projectRoutes = Router();

projectRoutes.post(
  "/",
  verifyToken(),
  validate(createProjectValidation),
  ProjectService.createProject as RequestHandler,
);

projectRoutes.get("/", verifyToken(), ProjectService.getProjects as RequestHandler);

projectRoutes.get("/:id", verifyToken(), ProjectService.getProjectById as RequestHandler);

projectRoutes.put(
  "/:id",
  verifyToken(),
  validate(updateProjectValidation),
  ProjectService.updateProject as RequestHandler,
);

projectRoutes.delete(
  "/:id",
  verifyToken(),
  ProjectService.deleteProject as RequestHandler,
);

projectRoutes.post(
  "/:id/members",
  verifyToken(),
  validate(memberValidation),
  ProjectService.addMember as RequestHandler,
);

projectRoutes.delete(
  "/:id/members/:userId",
  verifyToken(),
  ProjectService.removeMember as RequestHandler,
);

export { projectRoutes };
