import { FC, useState, useCallback, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { notify } from '../utils/notifications';

interface CarbonCredit {
  id: number;
  project_name: string;
  project_type: string;
  country: string;
  price_per_credit: number;
  quantity_available: number;
}

export const CarbonCreditMarketplace: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [txLoading, setTxLoading] = useState<number | null>(null);

  // REPLACE THIS with your actual backend wallet address
  const SELLER_WALLET = new PublicKey('3H4aScVc48qzMHTjX4PAYzChmkniYDKmvKybAwy6rQBj');
  
  // Backend API URL
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

  // Fetch carbon credits from backend
  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/wallet/marketplace`);
      const data = await response.json();
      console.log({'response': data})
      setCredits(data.listings || []);
      notify({ type: 'success', message: 'Carbon credits loaded!' });
    } catch (error) {
      console.error('Error fetching credits:', error);
      notify({ type: 'error', message: 'Failed to load carbon credits' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load credits on mount
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Buy carbon credits
  const buyCredits = async (credit: CarbonCredit) => {
    if (!publicKey) {
      notify({ type: 'error', message: 'Please connect your wallet first!' });
      return;
    }

    setTxLoading(credit.id);

    try {
      // Convert price to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = Math.floor(credit.price_per_credit * LAMPORTS_PER_SOL);

      notify({ type: 'info', message: 'Creating transaction...' });

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: SELLER_WALLET,
          lamports: lamports,
        })
      );

      // Send transaction - Phantom will popup
      notify({ type: 'info', message: 'Please approve transaction in your wallet...' });
      const signature = await sendTransaction(transaction, connection);
      
      console.log('Transaction sent:', signature);
      notify({ type: 'info', message: 'Transaction sent! Waiting for confirmation...' });

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction confirmed!');

      notify({ type: 'success', message: 'Transaction confirmed! Recording purchase...' });

      // Record purchase in backend
      const response = await fetch(`${BACKEND_URL}/api/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          transaction_signature: signature,
          credit_id: credit.id,
          quantity: 1,
          price: credit.price_per_credit,
        }),
      });

      if (response.ok) {
        notify({ 
          type: 'success', 
          message: `Successfully purchased ${credit.project_name} carbon credit!`,
          txid: signature
        });
        fetchCredits(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record purchase');
      }

    } catch (error: any) {
      console.error('Transaction failed:', error);
      notify({ 
        type: 'error', 
        message: `Transaction failed: ${error.message}` 
      });
    } finally {
      setTxLoading(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195] mb-2">
          Carbon Credit Marketplace
        </h2>
        <p className="text-slate-400">
          Offset your GPU emissions with verified carbon credits on Solana
        </p>
      </div>

      {!publicKey && (
        <div className="alert alert-warning shadow-lg mb-6">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Please connect your wallet to purchase carbon credits</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-4 text-lg">Loading carbon credits...</span>
        </div>
      ) : credits.length === 0 ? (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No carbon credits available at the moment. Please check back later!</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credits.length > 0 ? (credits.map((credit) => (
            <div key={credit.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all">
              <div className="card-body">
                <h3 className="card-title text-xl">
                  {credit.project_name}
                  <div className="badge badge-secondary">{credit.project_type}</div>
                </h3>
                
                <div className="space-y-2 my-4">
                  <p className="text-sm">
                    <span className="font-semibold">Country:</span> {credit.country}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Available:</span> {credit.quantity_available} credits
                  </p>
                  <div className="divider my-2"></div>
                  <p className="text-2xl font-bold text-primary">
                    {credit.price_per_credit} SOL
                    <span className="text-sm text-slate-400 ml-2">per credit</span>
                  </p>
                </div>

                <div className="card-actions justify-end">
                  <button
                    onClick={() => buyCredits(credit)}
                    disabled={!publicKey || txLoading === credit.id || credit.quantity_available === 0}
                    className={`btn btn-primary w-full ${txLoading === credit.id ? 'loading' : ''}`}
                  >
                    {txLoading === credit.id ? 'Processing...' : credit.quantity_available === 0 ? 'Sold Out' : 'Buy 1 Credit'}
                  </button>
                </div>
              </div>
            </div>
          ))) : (<div />) 
        }
        </div>
      )}

      <div className="mt-8 text-center">
        <button 
          onClick={fetchCredits}
          className="btn btn-outline btn-sm"
          disabled={loading}
        >
          🔄 Refresh Marketplace
        </button>
      </div>
    </div>
  );
};
