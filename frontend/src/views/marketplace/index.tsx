import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
// Make sure this import path is correct for your project structure
import { fetchMarketplaceListings } from '../../pages/api/apiClient';
import pkg from '../../../package.json'; // Adjust path as needed
import { ListingsDisplay } from './ListingsDisplay';

export const MarketPlaceView: FC = ({}) => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This useEffect runs once when the component mounts
  useEffect(() => {
    // Define an async function inside useEffect
    const loadListings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call the API function with all nulls, as requested
        const result = await fetchMarketplaceListings({
          projectType: null,
          minPrice: null,
          maxPrice: null,
          minQuantity: null,
          sortBy: null,
          limit: 10,
        });
        console.log(result.data.listings[0]);
        setListings(result.data.listings || []);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the function
    loadListings();
  }, []);

  // Helper function to render content based on state
  const renderContent = () => {
    if (loading) {
      return <div className="text-white text-center">Loading listings...</div>;
    }

    if (error) {
      return (
        <div className="text-red-400 text-center">
          <p>Error loading listings:</p>
          <p>{error}</p>
        </div>
      );
    }

    // Pass the fetched listings to the new display component
    return <ListingsDisplay listings={listings} />;
  };

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6">
          <div className="text-sm font-normal align-bottom text-right text-slate-600 mt-4">
            v{pkg.version}
          </div>
          <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
            🛒 Carbon Credit Marketplace
          </h1>
        </div>
        <div className="relative group w-full">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-500 rounded-lg blur opacity-40 animate-tilt"></div>
          <div className="w-full mx-auto mockup-code bg-primary border-2 border-[#5252529f] p-6 px-10 my-2">
            {/* This will now show Loading, Error, or Listings */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Default export for the page
export default MarketPlaceView;