import { Project } from "../../lib/models";
import { Status } from "../../lib/enums";
import { TypesObjectId } from "../../lib/schemas";

class ProjectDao {
  async createProject(data: object) {
    return Project.create(data);
  }

  async findProjectById(id: TypesObjectId | string) {
    return Project.findOne({ _id: id, status: Status.ACTIVE })
      .populate("admin", "name emailId role status")
      .populate("members", "name emailId role status");
  }

  async findUserProjects(userId: TypesObjectId | string) {
    return Project.find({
      status: Status.ACTIVE,
      $or: [{ admin: userId }, { members: userId }],
    })
      .populate("admin", "name emailId role status")
      .populate("members", "name emailId role status")
      .sort({ createdAt: -1 });
  }

  async updateProject(id: TypesObjectId | string, data: object) {
    return Project.findByIdAndUpdate(
      id,
      {
        $set: data,
      },
      { new: true },
    );
  }

  async addMember(projectId: TypesObjectId | string, userId: TypesObjectId | string) {
    return Project.findByIdAndUpdate(
      projectId,
      {
        $addToSet: { members: userId },
      },
      { new: true },
    );
  }

  async removeMember(projectId: TypesObjectId | string, userId: TypesObjectId | string) {
    return Project.findByIdAndUpdate(
      projectId,
      {
        $pull: { members: userId },
      },
      { new: true },
    );
  }
}

export default new ProjectDao();
