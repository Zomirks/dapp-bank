export interface BankEvent {
    account: string;
    action: string;
    amount: bigint;
}