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
    async addUsersToGroup(groupId: string, userIds: string[]): Promise<Group> {
      try {
        if(!Array.isArray(userIds)){
          throw new Error('user ids should be an array of string')
        }
        
        // add users to the group
        const updatedGroup = await GroupModel.findByIdAndUpdate(groupId,
          {$addToSet:{members:{$each:userIds}}},
          {new:true,useFindAndModify: false}
        )
        console.log('updated group',updatedGroup)
        return updatedGroup?.toObject() as Group
      } catch (error:any) {
        console.error(error)
        throw new Error(`Error adding users to group: ${error.message}`);
      }
    }
    async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
      await GroupModel.findByIdAndUpdate(groupId, { $pull: { members: userId } });
    }
    async getGroupById(groupId:string):Promise<Group |undefined>{
      const groupData = await GroupModel.findById(groupId)
      return groupData?.toObject()
    }
    async  getJoinedGroupsByUserId(userId: string): Promise<Group[]> {
      const joinedGroups = await GroupModel.aggregate([
        {
          $unwind: '$members',
        },
        {
          $match: { members: userId }, 
        },
        {
          $group: {
            _id: '$_id', 
            name: { $first: '$name' },
            image: { $first: '$image' },
            description: { $first: '$description' },
            members: { $push: '$members' }, 
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' },
          },
        },
      ]);
      return joinedGroups as Group[];
    }
}