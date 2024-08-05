export class UserEntity {
  constructor(
    public firstName: string,
    public lastName: string,
    // public userName: string,
    public email: string,
    public password: string,
    public role: string,
    public profile: {
      avatar: string;
      dateOfBirth: Date;
      gender: string;
    },
    public gender:string,
    public contact: {
      address: string;
      phone: string;
      social: string;
    },
    public qualification?:string,
    public cv?: string // Making cv optional
  ) {
    this.profit = 0;
    this.isBlocked = false;
    this.isVerified = false;
    this.isGAuth = false;
    this.isRejected = false;
  }

  public profit: number;
  public isBlocked: boolean;
  public isVerified: boolean;
  public isGAuth: boolean;
  public isRejected: boolean;
}
