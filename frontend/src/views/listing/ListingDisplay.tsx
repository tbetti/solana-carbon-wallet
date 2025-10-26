import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Or useParams from 'react-router-dom'
import { fetchListingDetails } from '../../pages/api/apiClient'; // Path to the function above

export const ListingDisplay = ({listing}) => {
  console.log(listing)
  return (
    <div>
      <h1>{listing.projectName}</h1>
      <p>Listing ID: {listing.listingId}</p>
      
      <h2>Price: ${parseInt(listing.pricePerCredit).toFixed(2)} / credit</h2>
      <p>Available: {listing.quantityAvailable} credits</p>

      {/* Add a purchase button */}
      <button>Buy Now</button>

      <h3>Project Details</h3>
      <pre>{JSON.stringify(listing.projectDetails, null, 2)}</pre>
      
      <h3>Credit Details</h3>
      <pre>{JSON.stringify(listing.creditDetails, null, 2)}</pre>
    </div>
  );
};
