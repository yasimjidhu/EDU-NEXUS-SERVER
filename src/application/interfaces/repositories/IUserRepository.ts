import { User } from "@entities/user";

export interface IUserRepository{
    createUser(user:User):Promise<User>;
    updateUser(user:User):Promise<User>;
    findByEmail(email:string):Promise<User|null>;
    findById(id:string):Promise<User|null>;
    findByGoogleId(id:string):Promise<User|null>;
    resetPassword(email:string,hashedPassword:any):Promise<User|null>;
    chaneUserRole(email:string):Promise<User|null>;
    updateProfileImage(userId: string, profileImage: string): Promise<User | null>; 
}