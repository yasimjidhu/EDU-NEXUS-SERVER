import { GroupRepository } from '@repositories/groupRepository';
import { Group } from '@entities/group';

export class GroupUseCase{
  private groupRepository: GroupRepository;

  constructor(groupRepository: GroupRepository) {
    this.groupRepository = groupRepository;
  }
  async createGroup(name: string,image:string,description:string, members: string[]): Promise<Group> {
    return await this.groupRepository.createGroup(name,image,description, members);
  }
  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    return await this.groupRepository.addUserToGroup(groupId, userId);
  }
  async addUsersToGroup(groupId: string, userIds: string[]): Promise<Group> {
    return await this.groupRepository.addUsersToGroup(groupId, userIds);
  }
  async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    return await this.groupRepository.removeUserFromGroup(groupId, userId);
  }
  async getGroup(groupId:string):Promise<Group | undefined>{
    return await this.groupRepository.getGroupById(groupId)
  }
  async getJoinedUserGroups(userId:string):Promise<Group[]>{
    return await this.groupRepository.getJoinedGroupsByUserId(userId)
  }
}
