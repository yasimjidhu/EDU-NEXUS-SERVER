import { Request, Response } from 'express';
import { Group } from '@entities/group';
import { GroupUseCase } from '@usecases/groupUseCase';

export class GroupController {
    constructor(private groupUseCase: GroupUseCase) { }

    async createGroup(req: Request, res: Response): Promise<void> {
        const { name, image, description, members } = req.body;

        try {
            const group: Group = await this.groupUseCase.createGroup(name, image, description, members);
            console.log('response of create group',group)
            res.status(201).json({ success: true, group });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    async joinGroup(req: Request, res: Response): Promise<void> {
        const { groupId, userId } = req.body;

        try {
            await this.groupUseCase.addUserToGroup(groupId, userId);
            res.status(200).json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };

    async leaveGroup(req: Request, res: Response): Promise<void> {
        const groupId = req.query.groupId as string | undefined;
        const userId = req.query.userId as string | undefined;

        if (!groupId || !userId) {
            res.status(400).json({ success: false, error: 'Missing groupId or userId' });
            return;
        }
        try {
            const group = await this.groupUseCase.removeUserFromGroup(groupId, userId);
            res.status(200).json({ success: true,group });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
    async getGroup(req: Request, res: Response): Promise<void> {
        const { groupId } = req.params
        try {
            const group = await this.groupUseCase.getGroup(groupId);
            res.status(200).json({ success: true, group });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
    async getUserJoinedGroups(req: Request, res: Response): Promise<void> {
        const { userId } = req.params
        try {
            const groups = await this.groupUseCase.getJoinedUserGroups(userId);
            res.status(200).json({ success: true, groups });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
    async addUsersToGroup(req: Request, res: Response): Promise<void> {
        const { groupId } = req.params
        const { userIds } = req.body
        try {
            const group = await this.groupUseCase.addUsersToGroup(groupId, userIds);
            console.log('added grups is',group)
            res.status(200).json({ success: true, group });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
}
