export class User{
    constructor(
        public _id? : string,
        public username? : string,
        public email? : string,
        public hashedPassword? : string,
        public refreshToken?:string,
        public googleId?:string,
        public role?:string,
        public isBlocked?:boolean
    ){}
}   