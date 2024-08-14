import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProfileUseCase } from '../../application/use-case/ProfileUseCase';
import { UserRepositoryImpl } from '../repositories/UserImpl';

const PROTO_PATH = __dirname + '../../../../proto/userService.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userServiceProto = grpc.loadPackageDefinition(packageDefinition).userservice as any;

const userRepository = new UserRepositoryImpl()
const userUseCase = new ProfileUseCase(userRepository)

export class GrpcServer {
  private server: grpc.Server;
  private userUseCase: ProfileUseCase;

  constructor(userUseCase: ProfileUseCase) {
    this.server = new grpc.Server();
    this.userUseCase = userUseCase;
  }

  public start(port: number): void {
    this.server.addService(userServiceProto.UserService.service, {
      GetInstructorsByIds: this.getInstructors.bind(this),
      GetStudentsByIds:this.getStudents.bind(this)
    });
    this.server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err: Error | null, port: number) => {
      if (err) {
        console.error(`Failed to bind server: ${err}`);
        return;
      }
      this.server.start();
      console.log(`gRPC server running on port ${port}`);
    });
  }

  private async getInstructors(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
    try {
      const instructors = await this.userUseCase.getEnrolledCourseInstructors(call.request.user_ids);
      callback(null, { users:instructors });
    } catch (error: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }
  private async getStudents(call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>): Promise<void> {
    try { 
      console.log('user call received in user-service getstudents', call.request.user_ids);
      const students = await this.userUseCase.getStudentsByIds(call.request.user_ids);
      console.log('fetched messaged students in user-service',students)
      callback(null, { users:students });
    } catch (error: any) {
      callback({
        code: grpc.status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }
}
