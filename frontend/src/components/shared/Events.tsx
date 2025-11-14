import { Badge } from "@/components/ui/badge"
import { formatEther } from "viem";

interface BankEvent {
    account: string;
    action: string;
    amount: bigint;
}

const Events = ({ events }: { events: BankEvent[] }) => {
    const shortenAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Transaction History</h3>

            {events.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    No transactions yet.
                </p>
            ) : (
                <div className="space-y-2">
                    {events.slice().reverse().map((event, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-1">
                                <Badge variant={event.action == 'etherWithdrawed' ? 'destructive' : 'default'}>{event.action}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    By: <span className="font-mono">{shortenAddress(event.account)}</span>
                                </span>
                            </div>

                            <div className="text-right">
                                <span className="text-sm font-semibold text-primary">
                                    {formatEther(event.amount)} ETH
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Events