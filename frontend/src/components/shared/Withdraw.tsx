'use client';

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert"

import { type BaseError, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/constants";
import { parseEther } from "viem";

const Withdraw = () => {
    const [validationError, setValidationError] = useState('');
    const [withdrawInput, setWithdrawInput] = useState('');

    const { data: hash, error: writeError, writeContract, isPending: writeIsPending } = useWriteContract()

    const handleWithdraw = async () => {
        setValidationError('');

        if (!withdrawInput || withdrawInput.trim() === '') {
            setValidationError('Please enter a number');
            return;
        }

        if (isNaN(Number(withdrawInput))) {
            setValidationError('Please enter a valid number');
            return;
        }

        if (Number(withdrawInput) < 0 || Number(withdrawInput) == 0) {
            setValidationError('Please enter a positive number (negative numbers are not allowed)');
            return;
        }

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'withdraw',
            args: [parseEther(withdrawInput)],
        })
    }

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })

    useEffect(() => {
        if (isConfirmed) {
            setWithdrawInput('');
        }
    }, [isConfirmed])

    return (
        <>
            <div className="p-6 border border-border rounded-lg bg-card mt-5">
                {hash && (
                <Alert className="mb-4">
                    <AlertDescription>
                        <div className="font-semibold mb-1">Transaction sent!</div>
                        <div className="text-xs break-all">Hash: {hash}</div>
                    </AlertDescription>
                </Alert>
                )}
        
                {isConfirming && (
                <Alert className="mb-4">
                    <AlertDescription>
                        Waiting for blockchain confirmation... This may take a few seconds.
                    </AlertDescription>
                </Alert>
                )}
        
                {isConfirmed && (
                <Alert className="mb-4 border-green-600 bg-green-500/10">
                    <AlertDescription className="text-foreground">
                        ✅ Transaction confirmed! Your withdraw has been made.
                    </AlertDescription>
                </Alert>
                )}
        
                {validationError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                        {validationError}
                    </AlertDescription>
                </Alert>
                )}
        
                {writeError && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                        <div className="font-semibold mb-1">Transaction failed</div>
                        <div className="text-sm">{(writeError as BaseError).shortMessage || writeError.message}</div>
                    </AlertDescription>
                </Alert>
                )}
        
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="deposit-input" className="text-base font-semibold">
                        Withdraw your ETH
                        </Label>
                        <Input
                            id="number-input"
                            type="number"
                            placeholder="Enter the ETH amount you want to withdraw"
                            value={withdrawInput}
                            min={0.00001}
                            step={0.00001}
                            onChange={(e) => setWithdrawInput(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleWithdraw}
                        className="w-full"
                        disabled={writeIsPending || isConfirming}
                    >
                        {writeIsPending || isConfirming ? 'Processing...' : 'Withdraw'}
                    </Button>
                </div>
            </div>
        </>
    )
}
export default Withdraw