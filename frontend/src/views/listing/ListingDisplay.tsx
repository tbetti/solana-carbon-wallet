import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// --- Placeholder for your actual purchase logic ---
// You would replace this with your real Phantom/Solana functions
const fakePurchaseLogic = async (listingId, quantity, totalCost) => {
  // 1. (YOUR CODE) Connect to Phantom and request transaction
  console.log(`Requesting ${totalCost} USDC for ${quantity} of ${listingId}`);
  
  // 2. (YOUR CODE) Simulate waiting for user approval
  await new Promise(resolve => setTimeout(resolve, 2500)); 
  
  // 3. (YOUR CODE) Simulate receiving a transaction signature
  const fakeSignature = `sig_${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 9)}`;
  
  // 4. (YOUR CODE) Call your backend API to record the purchase
  // await apiClient.recordPurchase(listingId, quantity, fakeSignature, ...);
  console.log("Backend API called to record purchase.");

  return fakeSignature;
};
// --- End of placeholder logic ---


/**
 * A component to handle the purchase flow for a specific listing.
 * Assumes 'listing' prop is provided, matching the API response.
 */
export const ListingDisplay = ({ listing }) => {
  const router = useRouter();
  
  // State for the purchase flow
  const [purchaseState, setPurchaseState] = useState('confirm'); // 'confirm', 'pending', 'success', 'error'
  const [quantity, setQuantity] = useState(1);
  const [transactionSig, setTransactionSig] = useState(null);
  const [error, setError] = useState(null);

  // Extract and calculate costs
  // Use parseFloat to keep decimals, not parseInt
  const price = parseFloat(listing.pricePerCredit); 
  const subtotal = price * quantity;
  const platformFee = subtotal * 0.05; // 5% platform fee
  const totalCost = subtotal + platformFee;

  // Handle the purchase button click
  const handlePurchase = async () => {
    setPurchaseState('pending');
    setError(null);
    try {
      // Call your actual purchase logic here
      const signature = await fakePurchaseLogic(listing.listingId, quantity, totalCost);
      
      setTransactionSig(signature);
      setPurchaseState('success');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unknown error occurred.');
      setPurchaseState('error');
    }
  };

  // Helper function to render the current state
  const renderStateContent = () => {
    
    // ⏳ STATE: PENDING
    if (purchaseState === 'pending') {
      return (
        <div className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[250px]">
          {/* You can replace this with a proper spinner component */}
          <div className="w-12 h-12 border-4 border-t-transparent border-[#00A884] rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">
            ⏳ Waiting for Phantom approval...
          </p>
          <p className="text-sm text-gray-500">Please confirm the transaction in your wallet.</p>
        </div>
      );
    }
    
    // ✅ STATE: SUCCESS
    if (purchaseState === 'success') {
      return (
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-green-600">✅ Transaction Confirmed!</h3>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg text-sm space-y-2">
            <p className="flex justify-between">
              <span className="text-gray-600">Transaction:</span>
              <span className="font-mono text-gray-900 truncate max-w-[200px]">{transactionSig}</span>
            </p>
            <a 
              href={`https://explorer.solana.com/tx/${transactionSig}?cluster=devnet`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[#00A884] hover:underline font-medium"
            >
              [View on Solana Explorer]
            </a>
          </div>
          <p className="text-center text-lg text-gray-800">
            You now own {quantity} carbon credit! 🌱
          </p>
          <Link href="/my-offsets" passHref>
            <button className="w-full h-12 px-6 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors">
              Go to My Offsets
            </button>
          </Link>
        </div>
      );
    }
    
    // ❌ STATE: ERROR
    if (purchaseState === 'error') {
      return (
         <div className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[250px]">
          <h3 className="text-2xl font-semibold text-red-600">❌ Purchase Failed</h3>
          <p className="text-center text-gray-600">{error}</p>
          <button 
            onClick={() => setPurchaseState('confirm')}
            className="w-full h-12 px-6 bg-[#00A884] hover:bg-[#00A884]/90 text-white font-semibold rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    // ➡️ STATE: CONFIRM (Default)
    return (
      <div className="p-6">
        <div className="space-y-3 text-lg text-gray-800">
          <div className="flex justify-between">
            <span className="text-gray-600">Project:</span>
            {/* Correctly access the nested project name */}
            <span className="font-semibold">{listing.projectName}</span>
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="quantity" className="text-gray-600">Quantity:</label>
            <input 
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max={listing.quantityAvailable}
              className="w-20 text-right font-semibold border-b-2 border-gray-300 focus:border-[#00A884] outline-none"
            />
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold">{subtotal.toFixed(2)} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform Fee (5%):</span>
            <span className="font-semibold">{platformFee.toFixed(2)} USDC</span>
          </div>
          
          {/* Divider (like ────────────────) */}
          <hr className="my-3 border-gray-300"/> 
          
          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>{totalCost.toFixed(2)} USDC</span>
          </div>
        </div>
        
        {/* Purchase Button */}
        <div className="mt-6">
          <button 
            onClick={handlePurchase}
            disabled={quantity > listing.quantityAvailable}
            className="w-full h-12 px-6 bg-[#00A884] hover:bg-[#00A884]/90 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {quantity > listing.quantityAvailable ? 'Not Enough Available' : 'Confirm Purchase 👛'}
          </button>
        </div>
      </div>
    );
  };

  // Main component layout
  return (
    // This is the main box (like ╔═════...═══╗)
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden text-gray-900">
      
      {/* This is the header (like ║ Complete... ║) */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-center">
          {purchaseState === 'success' ? 'Purchase Confirmed' : 'Complete Your Purchase'}
        </h2>
      </div>

      {/* This is the body (like ╠═════...═══╣) */}
      <div>
        {renderStateContent()}
      </div>
      
      {/* This is the footer (like ╚═════...═══╝) */}
    </div>
  );
};
