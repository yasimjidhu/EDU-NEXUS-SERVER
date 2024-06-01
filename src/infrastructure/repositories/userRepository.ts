    import mongoose,{Schema,Document,Model} from 'mongoose'
    import { User } from '../../domain/entities/user'

    export interface UserDocument  extends Document{}

    const userSchema : Schema = new Schema({
        username:{type:String,required:true},
        email:{type:String,required:true},
        hashedPassword:{type:String,required:true}
    });

    const UserModel : Model<UserDocument> = mongoose.model<UserDocument>('User',userSchema);


    export interface UserRepository{
        createUser(user:User):Promise<User>;
        findByEmail(email:string):Promise<User|null>;
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
            return user.toObject()
        }
    }
