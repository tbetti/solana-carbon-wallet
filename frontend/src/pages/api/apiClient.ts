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

const backendUrl = 'http://localhost:8000/api/';

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
