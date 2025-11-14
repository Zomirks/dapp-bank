'use client';
import { useReadContract, useAccount } from 'wagmi';

import { Alert, AlertDescription } from "@/components/ui/alert"

// Constantes du smart contract (adresse et ABI)
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/constants";
import { useEffect } from 'react';
import { formatEther } from "viem";

const Balance = () => {
    const { address } = useAccount();

    const { data: balance, error: readError, isPending: readIsPending, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getBalanceOfUser',
        account: address
    });

    useEffect(() => {
        refetch();
    });

    if (readIsPending) return <div className="p-6 text-center">Loading your current deposit...</div>

    if (readError) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Unable to read from smart contract. Make sure you are connected to the correct network (Hardhat network).
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div>Your current deposit : {formatEther(balance as bigint)} ETH</div>
    )
}
export default Balance