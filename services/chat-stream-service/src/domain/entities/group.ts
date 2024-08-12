export interface Group {
    id?: string;
    name: string;
    image:string;
    description:string;
    members: string[];
    createdAt?: Date;
    updatedAt?: Date;
}