export interface IGenerateOtp{
    execute(email:string):Promise<string>
}