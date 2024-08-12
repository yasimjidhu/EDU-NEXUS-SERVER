import { Request, Response } from 'express';
import { Group } from '@entities/group';
import { GroupUseCase } from '@usecases/groupUseCase';

export class GroupController {
    constructor(private groupUseCase: GroupUseCase) { }

    async createGroup(req: Request, res: Response): Promise<void> {
        const { name,image,description, members } = req.body;

        try {
            const group: Group = await this.groupUseCase.createGroup(name,image,description, members);
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
        const { groupId, userId } = req.body;

        try {
            await this.groupUseCase.removeUserFromGroup(groupId, userId);
            res.status(200).json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    };
}
