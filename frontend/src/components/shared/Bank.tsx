'use client';

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert"

import { type BaseError, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/constants";
import { parseEther } from "viem";

const Bank = () => {
  const [validationError, setValidationError] = useState('');
  const [depositInput, setDepositInput] = useState('');

  const { data: hash, error: writeError, writeContract, isPending: writeIsPending } = useWriteContract()

  const handleSetNumber = async () => {
    setValidationError('');

    if (!depositInput || depositInput.trim() === '') {
      setValidationError('Please enter a number');
      return;
    }

    if (isNaN(Number(depositInput))) {
      setValidationError('Please enter a valid number');
      return;
    }

    if (Number(depositInput) < 0) {
      setValidationError('Please enter a positive number (negative numbers are not allowed)');
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'deposit',
      value: parseEther(depositInput),
    })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    if (isConfirmed) {
      setDepositInput('');
    }
  });

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="deposit-input" className="text-base font-semibold">
            Deposit your ETH
          </Label>
          <Input
            id="number-input"
            type="number"
            placeholder="Enter the ETH amount you want to deposit"
            value={depositInput}
            min={0.00001}
            step={0.00001}
            onChange={(e) => setDepositInput(e.target.value)}
          />
        </div>
        <Button
          onClick={handleSetNumber}
          className="w-full"
          disabled={writeIsPending || isConfirming}
        >
          {writeIsPending || isConfirming ? 'Processing...' : 'Deposit'}
        </Button>
      </div>
    </>
  )
}
export default Bank