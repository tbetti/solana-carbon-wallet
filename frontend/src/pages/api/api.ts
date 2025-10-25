// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

// Define the URL of your external backend API
const backendUrl = 'http://localhost:8000/api/';

type Data = {
  name: string
}

export function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ name: 'John Doe' })
}

export async function carbonHandler(req, res) {
   try {
    const response = await fetch(`${backendUrl}calculate`, {
      method: req.method,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the request to the backend was successful
    if (!response.ok) {
      // If not, send the error status and message back to the front-end
      const errorData = await response.text();
      return res.status(response.status).json({ error: errorData });
    }

    // If successful, get the JSON data from the backend response
    const data = await response.json();

    // Send the data from the backend back to your front-end
    res.status(200).json(data);
  } catch (error) {
    // Handle any network or other errors
    console.error('Error in API proxy route:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
