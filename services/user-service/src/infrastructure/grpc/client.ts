import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const PROTO_PATH = __dirname + '/../../../proto/user_service.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// const userServiceProto = grpc.loadPackageDefinition(packageDefinition).userservice;

const proto = grpc.loadPackageDefinition(packageDefinition) as unknown as {
  userservice: {
    UserService: grpc.ServiceClientConstructor;
  };
};

const client = new proto.userservice.UserService('user-service:50051', grpc.credentials.createInsecure());

export async function getInstructorsByIds(instructorIds: string[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    client.getInstructors({ instructorIds }, (error:any, response:any) => {
      if (error) {
        return reject(error);
      }
      resolve(response.instructors);
    });
  });
}
