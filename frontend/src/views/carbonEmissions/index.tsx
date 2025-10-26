// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import { TripForm } from './TripForm';
import { ResultsContainer } from './ResultsContainer';
import { fetchGpuCost } from 'pages/api/apiClient';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

export const CarbonEmissionsView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const handleCalculate = async (calculationData) => {
    setLoading(true);
    setError(null);
    setData(null);
    setSubmitted(false);

    try {
      // Call the externalized API function
      const result = await fetchGpuCost(calculationData);
      setSubmitted(true); // Set submitted to true on success
      setData(result.data); // Store the successful response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className='mt-6'>
        <div className='text-sm font-normal align-bottom text-right text-slate-600 mt-4'>v{pkg.version}</div>
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
          Carbon Wallet
        </h1>
        </div>
        <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
          <p>Earn CarbonPoints for low-carbon travel.</p>
          <p className='text-slate-500 text-2x1 leading-relaxed'>Connect your Pera Wallet, log a trip, and recieve Solana CarbonPoints automatically.</p>
        </h4>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-500 rounded-lg blur opacity-40 animate-tilt"></div>
          <div className="max-w-md mx-auto mockup-code bg-primary border-2 border-[#5252529f] p-6 px-10 my-2">
            <TripForm
              onCalculate={handleCalculate} 
              loading={loading}
              submitted={submitted}
              setSubmitted={setSubmitted}
              error={error}
              setError={setError}
            />
            <ResultsContainer result={data} isVisible={submitted}/>
          </div>
        </div>
        <div className="flex flex-col mt-2">
          <RequestAirdrop />
          <h4 className="md:w-full text-2xl text-slate-300 my-2">
          {wallet &&
          <div className="flex flex-row justify-center">
            <div>
              {(balance || 0).toLocaleString()}
              </div>
              <div className='text-slate-600 ml-2'>
                SOL
              </div>
          </div>
          }
          </h4>
        </div>
      </div>
    </div>
  );
};
