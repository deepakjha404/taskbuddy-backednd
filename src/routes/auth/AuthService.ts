import { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcrypt";
import AuthDao from "../../dao/AuthDao";

import jwt, { JwtPayload } from "jsonwebtoken";
import { Status } from "../../../lib/enums";

class AuthService {
  RegisterUser = async (req: Request, res: Response) => {
    try {
      const { name, emailId, password } = req.body;

      const user = await AuthDao.findUserBy(emailId);

      if (user)
        return res
          .status(409)
          .json({ success: false, message: "Email Already exist" });

      const hashedPassword = await bcrypt.hash(password, 8);

      const registeredUser = await AuthDao.createuser({
        name,
        emailId: emailId,
        password: hashedPassword,
      });

      console.log(registeredUser);

      if (!registeredUser)
        return res
          .status(401)
          .json({ sucess: false, message: "Something Went Wrong" });

      return res
        .status(200)
        .json({ success: true, message: "user registred successsfully" });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  };

  loginUser = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await AuthDao.findUserBy(email);

      if (!user)
        return res.status(404).json({
          success: false,
          message: `User with email ${email} is not registered`,
        });

      if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
        return res.status(403).json({
          message:
            "Your account is temporarily locked due to multiple failed login attempts. Please try again later.",
        });
      }

      const isMatched = await bcrypt.compare(password, user.password);

      if (!isMatched) {
        const updateAttempt = (user.attempt || 0) + 1;

        if (updateAttempt > 5) {
          await AuthDao.lockUser(user._id);

          return res.status(403).json({
            success: false,
            message:
              "Account locked due to too many failed login attempts. Please contact support or use the 'Forgot Password' feature.",
            errorCode: "ACCOUNT_LOCKED",
          });
        }

        await AuthDao.updateUser(user._id, { attempt: updateAttempt });

        return res.status(401).json({
          success: false,
          message: `Invalid username or password. You have ${
            5 - updateAttempt
          } attempts remaining before your account is locked.`,
          errorCode: "INVALID_CREDENTIALS",
        });
      }

      await AuthDao.updateUser(user._id, {
        isLocked: false,
        lockUntil: null,
        attempt: 0,
      });

      const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        _id: user._id,
        emailId: user.emailId,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email address is required to reset the password.",
        });
      }

      const user = await AuthDao.findUserBy(email);

      if (!user)
        return res.status(404).json({
          success: false,
          message: `User with email ${email} is not registered.`,
          errorCode: "USER_NOT_FOUND",
        });

      const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
        expiresIn: "5m",
      });

      return res.status(200).json({
        success: true,
        message:
          "Password reset token generated. (NOTE: For development testing only. This must be replaced by email sending in production.)",
        token: token,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  };

  verifyUser = async (req: Request, res: Response) => {
    try {
      const token = req.params.token as string;
      const { password, conformPassword } = req.body;

      if (!token)
        return res.status(400).json({
          success: false,
          message: "Missing token parameter in the request URL.",
        });

      if (password !== conformPassword)
        return res.status(400).json({
          success: false,
          message: "Passwords do not match.",
        });

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      if (!decoded)
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Invalid or expired authentication token.",
          errorCode: "AUTH_INVALID_TOKEN",
        });

      const hashedPassword = await bcrypt.hash(conformPassword, 8);

      const updatePassword = await AuthDao.updateUserByemail(
        decoded.email,
        hashedPassword,
      );

      if (!updatePassword)
        return res.status(500).json({
          success: false,
          message:
            "A server error occurred while attempting to update the password. Please try again.",
          errorCode: "DB_UPDATE_FAILED",
        });

      return res.status(200).json({
        success: true,
        message: "Password has been successfully updated.",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred. Please try again later.",
        errorCode: "UNHANDLED_EXCEPTION",
      });
    }
  };

  changePassword = async (req: Request, res: Response) => {
    try {
      const id = req.user;
      const { password, conformPassword } = req.body;

      if (!id)
        return res
          .status(401)
          .json({ message: "Unauthorized: User ID missing" });

      if (password !== conformPassword)
        return res.status(400).json({
          success: false,
          message: "Passwords do not match.",
        });

      const hashedPassword = await bcrypt.hash(conformPassword, 8);

      const changePassword = await AuthDao.updateUser(id, {
        password: hashedPassword,
      });

      if (!changePassword)
        return res.status(500).json({
          success: false,
          message:
            "A server error occurred while attempting to update the password. Please try again.",
          errorCode: "DB_UPDATE_FAILED",
        });

      return res.status(200).json({
        success: true,
        message: "Password has been successfully updated.",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred. Please try again later.",
        errorCode: "UNHANDLED_EXCEPTION",
      });
    }
  };

  deleteAccount = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      const userAccount = await AuthDao.findUserById(user);

      if (!userAccount)
        return res
          .status(404)
          .json({ success: false, message: "user not found" });

      const deleteAccount = await AuthDao.updateUser(user, {
        status: Status.ARCHIVED,
      });

      if (!deleteAccount)
        return res.status(500).json({
          success: false,
          message: "Failed to delete account. Please try again later.",
        });

      return res.status(200).json({
        success: true,
        message: "Account deleted successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An unexpected server error occurred. Please try again later.",
        errorCode: "UNHANDLED_EXCEPTION",
      });
    }
  };
}

export default new AuthService();
