export interface IUserServiceClient {
    getStudentByIds(studentsIds:string[]):Promise<any>
}