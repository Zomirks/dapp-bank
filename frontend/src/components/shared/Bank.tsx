'use client';

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert"

import { type BaseError, useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'

import { publicClient } from "@/lib/client";
import { parseAbiItem, parseEther } from "viem";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/utils/constants";

import Balance from "./Balance";
import Withdraw from "./Withdraw";
import Deposit from "./Deposit";
import Events from "./Events";

import { BankEvent } from "@/types";

const Bank = () => {
	const { address } = useAccount();

	const [loadingEvents, setLoadingEvents] = useState(false);
	const [events, setEvents] = useState<BankEvent[]>([]);	

	const { data: hash, error: writeError, writeContract, isPending: writeIsPending } = useWriteContract()

	const { data: balance, error: readError, isPending: readIsPending, refetch } = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: CONTRACT_ABI,
		functionName: 'getBalanceOfUser',
		account: address
	});

	const getEvents = async () => {
		setLoadingEvents(true);
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
				account: event.args.account?.toString() || '',
				action: event.eventName,
				amount: event.args.amount || 0n,
			}
		}));
		setLoadingEvents(false);
	}

	useEffect(() => {
		getEvents();
	}, []);


	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord</h1>
				<p className="text-muted-foreground">Gérez vos ETH en toute simplicité</p>
			</div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-3">
					<Balance balance={typeof balance === 'bigint' ? balance : 0n} isPending={readIsPending} />
				</div>

				<div className="lg:col-span-1">
                    <Deposit refetch={refetch} getEvents={getEvents} />
                </div>

				<div className="lg:col-span-1">
					<Withdraw refetch={refetch} getEvents={getEvents} />
				</div>

				<div className="lg:col-span-1">
					<Events events={events} />
				</div>
			</div>
		</div>
	)
}
export default Bank