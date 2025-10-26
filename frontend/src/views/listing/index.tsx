import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Or useParams from 'react-router-dom'
import { fetchListingDetails } from '../../pages/api/apiClient'; // Path to the function above
import { ListingDisplay } from './ListingDisplay';

export const ListingView = () => {
  const router = useRouter();
  const { id } = router.query; // Get the ID from the URL

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure the ID is available before fetching
    if (!id) {
      return; // Wait for the router to be ready
    }

    // Helper function to load data
    const loadListing = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make sure we only use a single string ID
        const listingId = Array.isArray(id) ? id[0] : id;

        const data = await fetchListingDetails(listingId);
        setListing(data.data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id]); // Re-run the effect when the 'id' changes

  // --- Render based on state ---

  if (loading) {
    return <div>Loading listing details...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!listing) {
    return <div>Listing not found.</div>;
  }

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
    return <ListingDisplay listing={listing} />;
  };

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6">
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
