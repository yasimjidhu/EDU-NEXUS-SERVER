export interface BlockUserMessage {
    email: string;
    action: 'block';
}

export interface UnblockUserMessage {
    email: string;
    action: 'unblock';
}
export interface KycVerificationSuccessMessage {
    email: string;
    action: 'kyc-verified';
}