import { Task } from "../../lib/models";
import { TypesObjectId } from "../../lib/schemas";

class TaskDao {
  async createTask(data: object) {
    return Task.create(data);
  }

  async findTaskById(id: TypesObjectId | string) {
    return Task.findById(id)
      .populate("assignedTo", "name emailId role status")
      .populate("createdBy", "name emailId role status")
      .populate("project", "name description admin members status");
  }

  async findProjectTasks(projectId: TypesObjectId | string) {
    return Task.find({ project: projectId })
      .populate("assignedTo", "name emailId role status")
      .populate("createdBy", "name emailId role status")
      .sort({ createdAt: -1 });
  }

  async findUserTasks(userId: TypesObjectId | string) {
    return Task.find({ assignedTo: userId })
      .populate("assignedTo", "name emailId role status")
      .populate("project", "name description admin members status")
      .sort({ createdAt: -1 });
  }

  async findTasksByProjects(projectIds: (TypesObjectId | string)[]) {
    return Task.find({ project: { $in: projectIds } })
      .populate("assignedTo", "name emailId role status")
      .populate("project", "name description admin members status")
      .sort({ createdAt: -1 });
  }

  async updateTask(id: TypesObjectId | string, data: object) {
    return Task.findByIdAndUpdate(
      id,
      {
        $set: data,
      },
      { new: true },
    );
  }

  async deleteTask(id: TypesObjectId | string) {
    return Task.findByIdAndDelete(id);
  }

  async getDashboardStats(userId: TypesObjectId | string) {
    return Task.find({ assignedTo: userId }).populate("assignedTo", "name emailId");
  }
}

export default new TaskDao();
