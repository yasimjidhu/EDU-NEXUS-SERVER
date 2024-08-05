export interface EmailRepository{
    sendApprovalEmail(email:string):Promise<void>
    sendRejectionEmail(email:string):Promise<void>
    sendCourseApprovalEmail(email: string, courseName: string): Promise<void>;
    sendCourseRejectionEmail(email: string, courseName: string): Promise<void>;
}