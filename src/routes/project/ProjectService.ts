import { Request, Response } from "express";
import mongoose from "mongoose";
import ProjectDao from "../../dao/ProjectDao";
import AuthDao from "../../dao/AuthDao";
import { Role, Status } from "../../../lib/enums";

class ProjectService {
  private getId = (data: any) => {
    return data?._id ? data._id.toString() : data?.toString();
  };

  private isAdmin = (project: any, user: any) => {
    return this.getId(project.admin) === this.getId(user);
  };

  private isProjectMember = (project: any, user: any) => {
    const members = project.members || [];

    return (
      this.isAdmin(project, user) ||
      members.some((member: any) => this.getId(member) === this.getId(user))
    );
  };

  createProject = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const { name, description } = req.body;

      const project = await ProjectDao.createProject({
        name,
        description,
        admin: user,
        members: [user],
      });

      await AuthDao.updateUser(user, { role: Role.ADMIN });

      return res.status(200).json({
        success: true,
        message: "Project created successfully",
        project,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  getProjects = async (req: Request, res: Response) => {
    try {
      const user = req.user;

      const projects = await ProjectDao.findUserProjects(user);

      return res.status(200).json({
        success: true,
        message: "Projects fetched successfully",
        projects,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  getProjectById = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projectId = req.params.id as string;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const project = await ProjectDao.findProjectById(projectId);

      if (!project)
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });

      if (!this.isProjectMember(project, user))
        return res
          .status(403)
          .json({ success: false, message: "You are not part of this project" });

      return res.status(200).json({
        success: true,
        message: "Project fetched successfully",
        project,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  updateProject = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projectId = req.params.id as string;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const project = await ProjectDao.findProjectById(projectId);

      if (!project)
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });

      if (!this.isAdmin(project, user))
        return res
          .status(403)
          .json({ success: false, message: "Only admin can update project" });

      const updatedProject = await ProjectDao.updateProject(projectId, req.body);

      return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project: updatedProject,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  deleteProject = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projectId = req.params.id as string;
      const project = await ProjectDao.findProjectById(projectId);

      if (!project)
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });

      if (!this.isAdmin(project, user))
        return res
          .status(403)
          .json({ success: false, message: "Only admin can delete project" });

      await ProjectDao.updateProject(projectId, { status: Status.ARCHIVED });

      return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  addMember = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projectId = req.params.id as string;
      const { userId } = req.body;
      const project = await ProjectDao.findProjectById(projectId);

      if (!project)
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });

      if (!this.isAdmin(project, user))
        return res
          .status(403)
          .json({ success: false, message: "Only admin can add member" });

      const member = await AuthDao.findUserById(userId);

      if (!member)
        return res
          .status(404)
          .json({ success: false, message: "Member not found" });

      const updatedProject = await ProjectDao.addMember(projectId, userId);

      return res.status(200).json({
        success: true,
        message: "Member added successfully",
        project: updatedProject,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  removeMember = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projectId = req.params.id as string;
      const userId = req.params.userId as string;
      const project = await ProjectDao.findProjectById(projectId);

      if (!project)
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });

      if (!this.isAdmin(project, user))
        return res
          .status(403)
          .json({ success: false, message: "Only admin can remove member" });

      if (this.getId(project.admin) === userId)
        return res
          .status(400)
          .json({ success: false, message: "Admin cannot be removed" });

      const updatedProject = await ProjectDao.removeMember(projectId, userId);

      return res.status(200).json({
        success: true,
        message: "Member removed successfully",
        project: updatedProject,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }
}

export default new ProjectService();
