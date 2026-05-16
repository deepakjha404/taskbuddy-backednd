import { Request, Response } from "express";
import ProjectDao from "../../dao/ProjectDao";
import AuthDao from "../../dao/AuthDao";
import { Role, Status } from "../../../lib/enums";

class ProjectService {
  private getId(data: any) {
    return data?._id ? data._id.toString() : data?.toString();
  }

  private isAdmin(project: any, userId: string) {
    return this.getId(project.admin) === userId;
  }

  private isProjectMember(project: any, userId: string) {
    const members = project.members || [];

    return (
      this.isAdmin(project, userId) ||
      members.some((member: any) => this.getId(member) === userId)
    );
  }

  async createProject(req: Request, res: Response) {
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

  async getProjects(req: Request, res: Response) {
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

  async getProjectById(req: Request, res: Response) {
    try {
      const user = req.user;
      const projectId = req.params.id as string;
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

  async updateProject(req: Request, res: Response) {
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

  async deleteProject(req: Request, res: Response) {
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

  async addMember(req: Request, res: Response) {
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

  async removeMember(req: Request, res: Response) {
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
