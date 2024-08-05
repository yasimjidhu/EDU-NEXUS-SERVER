import * as grpc from '@grp'
import {loadSync} from '@grpc'
import path from 'path'
import { UserRepositoryImpl } from '../repositories/UserImpl';
import { UserEntity } from '../../domain/entities/user';


const PROTO_PATH = path.resolve(__dirname,"../../../proto/userService.proto");
const packageDefinition = loadSync(PROTO_PATH,{})
const protoDescriber = grpc.loadPackageDefinition(packageDefinition) as any
const userProto = protoDescriber.UserService;

const userRepository = new UserRepositoryImpl()

function mapUserToInstructor(user:UserEntity){
    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.profile.avatar,
        dateOfBirth: user.profile.dateOfBirth.toISOString(),
        gender: user.profile.gender,
        address: user.contact.address,
        phone: user.contact.phone,
        social: user.contact.social,
        qualification: user.qualification,
        cv: user.cv,
        profit: user.profit,
        isBlocked: user.isBlocked,
        isVerified: user.isVerified,
        isGAuth: user.isGAuth,
        isRejected: user.isRejected,
    };
}

function getInstructorsHandler(call:any,callback:any){
    const instructorIds = call.request.instructorsIds;
    getInstructorsHandler.execute(instructorsIds)
    .then((instructors)=>{
        const instructorsResponse = instructors.map(mapUserToInstructor);
        callback(null,{instructors:instructorsResponse});
    })
    .catch((error:any)=>{
        callback(error,null)
    })
}

const server = new grpc.Server();
server.addService(userProto.UserService.service,{GetInstructors:getInstructorsHandler})

server.bindAsync("0.0.0.0:50051",grpc.ServerCredentials.createInSecure(),()=>{
    console.log('User service gRPC server running on port 50051')
    server.start()
})