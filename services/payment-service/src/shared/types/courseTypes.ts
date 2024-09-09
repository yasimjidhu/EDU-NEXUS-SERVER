export interface TCourse {
    user_id: string;
    course_id: string;
    instructor_id?: string;
    amount: number;
    currency: string;
    course_name: string;
    email: string;
    adminAccountId: string;
    instructorAccountId: string;
}