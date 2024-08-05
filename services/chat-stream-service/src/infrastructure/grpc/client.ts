import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { IUserServiceClient } from '@interfaces/IUserServiceClient'

const PROTO_PATH = __dirname +  '../../../../proto/userService.proto'

const packageDefinition = protoLoader.loadSync(PROTO_PATH,{
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const userServiceProto = grpc.loadPackageDefinition(packageDefinition).userservice as any

export class UserServiceClient implements IUserServiceClient{
    private client:any;

    constructor(){
        this.client = new userServiceProto.UserService(
            'localhost:50052',
            grpc.credentials.createInsecure()
        );
    }

    public getStudentByIds(studentsIds:string[]):Promise<any>{
        return new Promise((resolve,reject)=>{
            this.client.GetStudentsByIds({user_ids:studentsIds},(error:any,response:any)=>{
                if(error){
                    console.log(error)
                    reject(error)
                }else{
                    resolve(response.users)
                }
            })
        })
    }
}
