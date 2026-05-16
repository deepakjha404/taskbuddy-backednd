import { RequestHandler, Router } from "express";
import AuthService from "./AuthService";
import { validate } from "../../utils/validations";
import { createUserValidation } from "./AuthValidations";
import { verifyToken } from "../../utils/auth";

const authRoutes = Router();

authRoutes.post(
  "/register",
  validate(createUserValidation
  ),
  AuthService.RegisterUser as RequestHandler
);

authRoutes.post(
  "/forgotpassword",
  AuthService.forgotPassword as RequestHandler
);

authRoutes.post(
  "/verify/:token",
  AuthService.verifyUser as RequestHandler
);


authRoutes.post("/login", AuthService.loginUser as RequestHandler);

authRoutes.post(
  "/changePassword",
  verifyToken(),
  AuthService.changePassword as RequestHandler
);

authRoutes.put(
  "/deleteAccount",
  verifyToken(),
  AuthService.deleteAccount as RequestHandler
);

export { authRoutes };
