import { Request, Response } from "express";
import mongoose from "mongoose";
import TaskDao from "../../dao/TaskDao";
import ProjectDao from "../../dao/ProjectDao";
import AuthDao from "../../dao/AuthDao";

class TaskService {
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

  createTask = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projectId = req.params.projectId as string;
      const { title, description, dueDate, priority, assignedTo } = req.body;

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ success: false, message: "Invalid project ID" });
      }

      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ success: false, message: "Invalid assigned user ID" });
      }

      const project = await ProjectDao.findProjectById(projectId);

      if (!project)
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });

      if (!this.isAdmin(project, user))
        return res
          .status(403)
          .json({ success: false, message: "Only admin can create task" });

      const assignedUser = await AuthDao.findUserById(assignedTo);

      if (!assignedUser)
        return res
          .status(404)
          .json({ success: false, message: "Assigned user not found" });

      if (!this.isProjectMember(project, assignedTo))
        return res.status(400).json({
          success: false,
          message: "Assigned user is not a member of this project",
        });

      const task = await TaskDao.createTask({
        title,
        description,
        dueDate,
        priority,
        assignedTo,
        project: projectId,
        createdBy: this.getId(user),
      });

      return res.status(200).json({
        success: true,
        message: "Task created successfully",
        task,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  getProjectTasks = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projectId = req.params.projectId as string;
      console.log("Fetching tasks for project:", projectId);

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        console.warn("Invalid project ID received:", projectId);
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

      const tasks = await TaskDao.findProjectTasks(projectId);

      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        tasks,
      });
    } catch (err) {
      console.error("getProjectTasks Error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  getMyTasks = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const tasks = await TaskDao.findUserTasks(user);

      return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        tasks,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  updateTask = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const taskId = req.params.taskId as string;
      const task = await TaskDao.findTaskById(taskId);

      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });

      const project = await ProjectDao.findProjectById(this.getId((task as any).project));

      if (!project)
        return res
          .status(404)
          .json({ success: false, message: "Project not found" });

      const isAssignedUser = this.getId((task as any).assignedTo) === this.getId(user);

      if (!this.isAdmin(project, user) && !isAssignedUser)
        return res
          .status(403)
          .json({ success: false, message: "You cannot update this task" });

      if (!this.isAdmin(project, user) && Object.keys(req.body).some(key => key !== "status"))
        return res.status(403).json({
          success: false,
          message: "Member can update task status only",
        });

      if (req.body.assignedTo && !this.isProjectMember(project, req.body.assignedTo))
        return res.status(400).json({
          success: false,
          message: "Assigned user is not a member of this project",
        });

      const updatedTask = await TaskDao.updateTask(taskId, req.body);

      return res.status(200).json({
        success: true,
        message: "Task updated successfully",
        task: updatedTask,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  updateTaskStatus = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const taskId = req.params.taskId as string;
      const task = await TaskDao.findTaskById(taskId);

      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });

      const project = await ProjectDao.findProjectById(this.getId((task as any).project));
      const isAssignedUser = this.getId((task as any).assignedTo) === this.getId(user);

      if (!project || (!this.isAdmin(project, user) && !isAssignedUser))
        return res
          .status(403)
          .json({ success: false, message: "You cannot update this task" });

      const updatedTask = await TaskDao.updateTask(taskId, {
        status: req.body.status,
      });

      return res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        task: updatedTask,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }

  deleteTask = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const taskId = req.params.taskId as string;
      const task = await TaskDao.findTaskById(taskId);

      if (!task)
        return res
          .status(404)
          .json({ success: false, message: "Task not found" });

      const project = await ProjectDao.findProjectById(this.getId((task as any).project));

      if (!project || !this.isAdmin(project, user))
        return res
          .status(403)
          .json({ success: false, message: "Only admin can delete task" });

      await TaskDao.deleteTask(taskId);

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }
}

export default new TaskService();
