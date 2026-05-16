import { User } from "../../lib/models";
import { TypesObjectId } from "../../lib/schemas";

class AuthDao {
  async findUserBy(email: string) {
    return User.findOne({ emailId: email });
  }

  async findUserById(id: TypesObjectId) {
    return User.findOne({ _id: id });
  }

  async createuser(data: Object) {
    return User.create(data);
  }

  async lockUser(id: TypesObjectId, lockDurationInMinutes: number = 5) {
    const lockUntil = new Date(Date.now() + lockDurationInMinutes * 60 * 1000);
    return User.findByIdAndUpdate(
      id,
      {
        $set: {
          attempt: 0,
          isLocked: true,
          lockUntil,
        },
      },
      { new: true },
    );
  }

  async updateUser(id: TypesObjectId, data: object) {
    return User.findByIdAndUpdate(
      id,
      {
        $set: data,
      },
      { new: true },
    );
  }

  async updateUserByemail(emailId: string, password: string) {
    return User.findOneAndUpdate(
      { emailId: emailId },
      { $set: { password: password } },
      { new: true },
    );
  }
}

export default new AuthDao();
