export class FeedbackEntity {
    public _id?:string;
    public name: string;
    public image:string;
    public email: string;
    public message: string;
    public subject:string;
    public userId?: string;
    public createdAt?: Date;

    constructor(
        _id:string,
        name: string,
        image:string,
        email: string,
        message: string,
        subject:string,
        userId?: string,
        createdAt?:Date
    ) {
        this._id=_id||'',
        this.name = name || '';
        this.image = image || '',
        this.email = email || '';
        this.message = message || '';
        this.subject = subject || '';
        this.userId = userId;
        this.createdAt = createdAt;
    }
}