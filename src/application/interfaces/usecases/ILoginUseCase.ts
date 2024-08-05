import { User } from "@entities/user";
import { Request, Response } from "express";

export interface ILoginUseCase {
    execute(email: string, password: string): Promise<{ token: string, refreshToken: string, user: User } | null | { role: string }>;
    logout(req: Request, res: Response): Promise<void>;
}