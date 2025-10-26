// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import { CarbonCreditMarketplace } from '../../components/CarbonCreditMarketplace';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Carbon Wallet <span className='text-sm font-normal align-top text-slate-700'>v{pkg.version}</span>
        </h1>
        <h4 className="md:w-full text-center text-slate-300 my-2">
          <p>Offset your GPU emissions with carbon credits on Solana</p>
        </h4>
        
        <div className="text-center mb-6">
          {wallet.publicKey && (
            <div className="stats shadow bg-base-200">
              <div className="stat">
                <div className="stat-title">Your Wallet</div>
                <div className="stat-value text-sm">{wallet.publicKey.toBase58().substring(0, 4)}...{wallet.publicKey.toBase58().slice(-4)}</div>
                <div className="stat-desc">SOL Balance: {(balance || 0).toLocaleString()}</div>
              </div>
            </div>
          )}
          {!wallet.publicKey && (
            <div className="text-center p-4">
              <p className="text-slate-400">Connect your wallet to get started</p>
            </div>
          )}
        </div>

        {/* Airdrop for testing */}
        {wallet.publicKey && (
          <div className="mb-6">
            <RequestAirdrop />
          </div>
        )}

        {/* Carbon Credit Marketplace */}
        <div className="w-full mt-6">
          <CarbonCreditMarketplace />
        </div>
      </div>
    </div>
  );
};
