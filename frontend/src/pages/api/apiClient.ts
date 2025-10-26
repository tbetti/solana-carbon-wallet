// client-side data fetching logic.

/**
 * Fetches the GPU cost calculation from the backend proxy.
 *
 * @param {object} calculationData - The data for the calculation.
 * @param {string} calculationData.gpuType - The type of GPU (e.g., "A100").
 * @param {number} calculationData.hours - The number of hours.
 * @param {string} [calculationData.region] - The optional region (e.g., "US-West").
 * @returns {Promise<object>} - A promise that resolves with the calculation result.
 * @throws {Error} - Throws an error if the API call fails.
 */

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/';

export const fetchGpuCost = async ({ gpuType, hours, region }) => {
  // Construct the request body from the arguments
  const requestBody = {
    gpuType,
    hours,
    region
  };

  const response = await fetch(`${backendUrl}carbon/calculate`, {
    method: 'POST', // Specify the method
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody), // Send the JSON body
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to fetch data');
  }

  const result = await response.json();
  return result; // Return the successful response
};

export const fetchMarketplaceListings = async ({
  projectType,
  minPrice,
  maxPrice,
  minQuantity,
  sortBy,
  limit
}) => {
  const queryParams = {
    projectType,
    minPrice,
    maxPrice,
    minQuantity,
    sortBy,
    limit
  };

  // Filter out any null/undefined values
  const definedParams = Object.entries(queryParams).filter(
    ([key, value]) => value !== null && value !== undefined
  );

  // Build the URL query string
  const urlQuery = new URLSearchParams(
    definedParams.map(([key, value]) => [key, String(value)])
  ).toString();

  // Construct the final URL. If there are params, add a '?'
  const fetchUrl = `${backendUrl}marketplace/listings${urlQuery ? `?${urlQuery}` : ''}`;

  console.log(`Fetching from: ${fetchUrl}`);

  const response = await fetch(fetchUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || 'Failed to fetch data');
  }

  const result = await response.json();
  return result; // Return the successful response
};

/**
 * Fetches the details for a single marketplace listing from the API.
 *
 * @param {string} id - The UUID of the listing to fetch.
 * @returns {Promise<object>} A promise that resolves to the listing details object.
 * @throws {Error} Throws an error if the network response is not ok (e.g., 404, 500).
 */
export const fetchListingDetails = async (id) => {

  if (!id) {
    throw new Error('Listing ID is required.');
  }

  const response = await fetch(`${backendUrl}marketplace/listing/${id}`);

  if (!response.ok) {
    // If the server returns an error (like 404 "Not Found" or 500),
    // we throw an error to be caught by the caller.
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch listing: ${response.statusText}`);
  }

  // Parse the JSON data from the response
  const data = await response.json();
  
  // The response matches your spec:
  // { listingId, creditDetails, projectDetails, ... }
  return data;
};
