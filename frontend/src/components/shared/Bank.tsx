'use client';

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert"

import { type BaseError, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import { publicClient } from "@/lib/client";
import { parseAbiItem, parseEther } from "viem";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/constants";

import Balance from "./Balance";
import Withdraw from "./Withdraw";
import Events from "./Events";

import { BankEvent } from "@/types";

const Bank = () => {
	const [validationError, setValidationError] = useState('');
	const [depositInput, setDepositInput] = useState('');
	const [events, setEvents] = useState<BankEvent[]>([]);	

	const { data: hash, error: writeError, writeContract, isPending: writeIsPending } = useWriteContract()

	const getEvents = async () => {
		const BankEvents = await publicClient.getLogs({
			address: CONTRACT_ADDRESS,
			events: [
				parseAbiItem('event etherDeposited(address indexed account, uint amount)'),
				parseAbiItem('event etherWithdrawed(address indexed account, uint amount)')
			],
			fromBlock: 0n,
			toBlock: 'latest'
		});
		
		setEvents(BankEvents.map((event) => {
			return {
				account: event.args.account as string,
				action: event.eventName,
				amount: event.args.amount as bigint
			}
		}))
	}

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

		if (Number(depositInput) < 0 || Number(depositInput) == 0) {
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
			getEvents();
		}
	}, [isConfirmed])

	useEffect(() => {
		getEvents();
	}, []);

	return (
		<>
			<Balance />
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
					✅ Transaction confirmed! Your deposit has been made.
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
			</div>

			<Withdraw />
			<Events events={events} />
		</>
	)
}
export default Bank