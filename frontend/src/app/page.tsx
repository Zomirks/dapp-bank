'use client';
import NotConnected from '@/components/shared/NotConnected';
import Bank from '@/components/shared/Bank';

import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <Bank />
      ) : (
        <NotConnected />
      )}
    </>
  );
}
