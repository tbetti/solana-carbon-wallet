import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
// Make sure this import path is correct for your project structure
import { fetchMarketplaceListings } from '../../pages/api/apiClient';

interface ListingViewProps {
  listingId: string | string[];
}

export const ListingView: FC<ListingViewProps> = ({listingId}) => {
  return (
    <>
      {`Hello world ${listingId}`}
    </>
  );
};

// Default export for the page
export default ListingView;