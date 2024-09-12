export interface IKycUseCase{
    initiateVerification(instructorId:string):Promise<{verificationSessionId:string,verificationUrl:string}>
    processWebhook(event:any):Promise<void>
}