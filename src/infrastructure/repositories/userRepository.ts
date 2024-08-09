import mongoose,{Schema,Document,Model} from 'mongoose'
import { User } from '@entities/user'
import { IUserRepository } from '@interfaces/repositories/IUserRepository';

    enum UserRole{
        Admin = 'admin',
        User = 'student',
        Instructor = 'instructor'
    }
    interface UserDocument extends Document {
        googleId: string;
        username: string;
        email: string;
        hashedPassword: string;
        profileImage?: string;  
    }

   
    const userSchema : Schema = new Schema({
        googleId:{type:String,required:false,unique:true},
        username:{type:String,required:true},
        email:{type:String,required:true},
        hashedPassword:{type:String,required:false},
        role:{type:String,enum:Object.values(UserRole),default:UserRole.User},
        isBlocked:{type:Boolean,required:false,default:false},
        profileImage:{type:String}
    });

    const UserModel : Model<UserDocument> = mongoose.model<UserDocument>('User',userSchema);

    export { UserModel, UserDocument };


    export class UserRepositoryImpl implements IUserRepository{
        async createUser(user: User): Promise<User> {
            const newUser = await UserModel.create({
                username: user.username,
                email: user.email,
                hashedPassword: user.hashedPassword,
                profileImage: user.profileImage !== undefined ? user.profileImage : null,
            });
        
            return newUser.toObject();
        }

        async updateUser(user: User): Promise<User> {
            if (!user) {
                throw new Error('User object must be provided');
            }
    
            const updatedUser = await UserModel.findOneAndUpdate({ _id: user._id }, user, { new: true });
    
            if (!updatedUser) {
                throw new Error('User not found or update failed');
            }
    
            return updatedUser.toObject();
        }
    

        async findByEmail(email: string): Promise<User|null> {
            const user = await UserModel.findOne({email})
            if(!user){
                return null
            }
            return user.toObject() as User
        }
        async findById(id:string):Promise<User|null>{
            const user = await UserModel.findOne({id})
            return user ? user.toObject() : null
        }
        async findByGoogleId(id: string): Promise<User | null> {
            const user = await UserModel.findOne({googleId:id})
            return user ? user.toObject() : null
        }
        async resetPassword(email:string,hashedPassword:any):Promise<User|null>{
            const user = this.findByEmail(email)

            if(!user){
                return null
            }
            await UserModel.findOneAndUpdate(
                {email},
                {$set:{hashedPassword}}
            )
            return user
        }
        async chaneUserRole(email:string):Promise<User|null>{
            const updatedUser = await UserModel.findOneAndUpdate(
                {email},
                {$set:{role:'instructor'}}
            )
            if(!updatedUser){
                return null
            }
            return updatedUser.toObject()
        }
        async updateProfileImage(userId: string, profileImage: string): Promise<User | null> {
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: { profileImage } },
                { new: true }
            );
    
            return updatedUser ? updatedUser.toObject() as User : null;
        }
    }
