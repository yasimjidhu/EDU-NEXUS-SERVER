import { Group } from "@entities/group";
import { GroupModel } from "../database/models/GroupModel";

export class GroupRepository {
    async createGroup(name: string,image:string,description:string, members: string[]): Promise<Group> {
      const group = new GroupModel({ name,image,description, members });
      console.log('group created in backend',group)
      return (await group.save()).toObject()
    }
  
    async addUserToGroup(groupId: string, userId: string): Promise<void> {
      await GroupModel.findByIdAndUpdate(groupId, { $addToSet: { members: userId } });
    }
  
    async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
      await GroupModel.findByIdAndUpdate(groupId, { $pull: { members: userId } });
    }
}