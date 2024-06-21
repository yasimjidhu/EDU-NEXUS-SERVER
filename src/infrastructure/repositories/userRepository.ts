    import mongoose,{Schema,Document,Model} from 'mongoose'
    import { User } from '../../domain/entities/user'

    enum UserRole{
        Admin = 'admin',
        User = 'user',
        Instructor = 'instructor'
    }

    export interface UserDocument  extends Document{}

    const userSchema : Schema = new Schema({
        googleId:{type:String,required:false,unique:true},
        username:{type:String,required:true},
        email:{type:String,required:true},
        hashedPassword:{type:String,required:false},
        role:{type:String,enum:Object.values(UserRole),default:UserRole.User},
        isBlocked:{type:Boolean,required:false,default:false}
    });

    const UserModel : Model<UserDocument> = mongoose.model<UserDocument>('User',userSchema);


    export interface UserRepository{
        createUser(user:User):Promise<User>;
        findByEmail(email:string):Promise<User|null>;
        findById(id:string):Promise<User|null>;
        findByGoogleId(id:string):Promise<User|null>;
        resetPassword(email:string,hashedPassword:any):Promise<User|null>;
    }

    export class UserRepositoryImpl implements UserRepository{
        async createUser(user: User): Promise<User> {
            const newUser = new UserModel(user)
            await newUser.save()
            return newUser.toObject()
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
    }
