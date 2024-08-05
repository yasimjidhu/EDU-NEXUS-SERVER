export interface BlockUserMessage {
    email: string;
    action: 'block';
}

export interface UnblockUserMessage {
    email: string;
    action: 'unblock';
}