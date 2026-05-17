import { Request, Response } from "express";
import ProjectDao from "../../dao/ProjectDao";
import TaskDao from "../../dao/TaskDao";
import { TaskStatus } from "../../../lib/enums";

class DashboardService {
  getDashboard = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const projects = await ProjectDao.findUserProjects(user);
      const projectIds = projects.map(project => project._id);
      const tasks = await TaskDao.findTasksByProjects(projectIds);
      const today = new Date();

      const tasksPerUser: Record<string, { name: string; count: number }> = {};

      tasks.forEach((task: any) => {
        const assignedUser = task.assignedTo;
        const userId = assignedUser?._id?.toString();

        if (!userId) return;

        if (!tasksPerUser[userId]) {
          tasksPerUser[userId] = {
            name: assignedUser.name,
            count: 0,
          };
        }

        tasksPerUser[userId].count += 1;
      });

      return res.status(200).json({
        success: true,
        message: "Dashboard fetched successfully",
        dashboard: {
          totalTasks: tasks.length,
          todoTasks: tasks.filter(task => task.status === TaskStatus.TODO).length,
          inProgressTasks: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS)
            .length,
          doneTasks: tasks.filter(task => task.status === TaskStatus.DONE).length,
          overdueTasks: tasks.filter(
            task => task.status !== TaskStatus.DONE && new Date(task.dueDate) < today,
          ).length,
          tasksPerUser: Object.values(tasksPerUser),
          totalProjects: projects.length,
        },
      });
    } catch (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error", err });
    }
  }
}

export default new DashboardService();
