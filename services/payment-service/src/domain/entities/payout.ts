
export class PayoutEntity {
    id?: string;
    paymentId: string;
    accountType: 'admin' | 'instructor';
    accountId: string;
    amount: number;
    currency?: string; 
    destination:any;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  
    constructor(
      paymentId: string,
      accountType: 'admin' | 'instructor',
      accountId: string,
      amount: number,
      currency: string,
      destination:any,
      status: string = 'pending'
    ) {
      this.paymentId = paymentId;
      this.accountType = accountType;
      this.accountId = accountId;
      this.amount = amount;
      this.currency = currency;
      this.destination = destination;
      this.status = status;
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }
  }
  