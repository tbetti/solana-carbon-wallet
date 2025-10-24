// routes/marketplace.js
import { Router } from 'express';
const router = Router();
import { getMarketplaceListings, getListingById, createListing, purchaseCredits, cancelListing } from '../trading-engine'; // Note the ../ path

// ============================================================================
// MARKETPLACE ENDPOINTS
// ============================================================================

/**
 * GET /api/marketplace/listings
 * 
 * * Get all active carbon credit listings
 *
 * Query Parameters:
 * - projectType: filter by project type (e.g., "Renewable Energy")
 * - minPrice: minimum price per credit
 * - maxPrice: maximum price per credit
 * - minQuantity: minimum quantity available
 * - sortBy: "price_asc", "price_desc", "quantity_asc", "quantity_desc"
 * - limit: number of results (default: 50)
 *
 * Response:
 * {
 *   "listings": [
 *     {
 *       "listingId": "uuid",
 *       "projectName": "Solar Farm Project",
 *       "projectType": "Renewable Energy",
 *       "pricePerCredit": 12.50,
 *       "quantityAvailable": 1000,
 *       "vintage": 2024,
 *       "country": "India",
 *       "sellerWallet": "0x..."
 *     }
 *   ],
 *   "total": 45
 * }
 */
router.get('/listings', async (req, res) => {
  try {
    const filters = {
      projectType: req.query.projectType,
      minPrice: parseFloat(req.query.minPrice) || null,
      maxPrice: parseFloat(req.query.maxPrice) || null,
      minQuantity: parseInt(req.query.minQuantity) || null,
      sortBy: req.query.sortBy || 'price_asc',
      limit: parseInt(req.query.limit) || 50
    };
    const listings = await getMarketplaceListings(filters);
    res.json({ success: true, data: listings });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to retrieve marketplace listings', message: error.message });
  }
});

/**
 * GET /api/marketplace/listing/:id
 * 
 * Get details of a specific listing
 *
 * Response:
 * {
 *   "listingId": "uuid",
 *   "creditDetails": {...},
 *   "projectDetails": {...},
 *   "pricePerCredit": 12.50,
 *   "quantityAvailable": 1000
 * }
 */
router.get('/listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await getListingById(id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json({ success: true, data: listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to retrieve listing', message: error.message });
  }
});

/**
 * POST /api/marketplace/list
 * 
 * Create a new listing to sell carbon credits
 *
 * Request Body:
 * {
 *   "sellerWallet": "0x...",
 *   "creditId": "uuid",
 *   "quantity": 100,
 *   "pricePerCredit": 15.00
 * }
 *
 * Response:
 * {
 *   "listingId": "uuid",
 *   "message": "Listing created successfully"
 * }
 */
router.post('/list', async (req, res) => {
  try {
    // ... (copy your validation logic here) ...
    const { sellerWallet, creditId, quantity, pricePerCredit } = req.body;

    if (!sellerWallet || !creditId || !quantity || !pricePerCredit) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const listing = await createListing(
      sellerWallet, creditId, quantity, pricePerCredit
    );
    res.status(201).json({ success: true, data: listing, message: 'Listing created successfully' });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing', message: error.message });
  }
});

/**
 * POST /api/marketplace/buy
 * Purchase carbon credits from a listing
 *
 * Request Body:
 * {
 *   "buyerWallet": "0x...",
 *   "listingId": "uuid",
 *   "quantity": 10
 * }
 *
 * Response:
 * {
 *   "transactionId": "uuid",
 *   "totalCost": 125.00,
 *   "platformFee": 6.25,
 *   "netAmount": 118.75,
 *   "message": "Purchase successful"
 * }
 */
router.post('/buy', async (req, res) => {
  try {
    // ... (copy your validation and logic here) ...
    const { buyerWallet, listingId, quantity } = req.body;

    if (!buyerWallet || !listingId || !quantity) {
         return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = await purchaseCredits(
      buyerWallet, listingId, quantity
    );
    res.status(201).json({ success: true, data: transaction, message: 'Purchase successful' });
  } catch (error) {
    // ... (copy your specific error handling here) ...
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to complete purchase', message: error.message });
  }
});

/**
 * DELETE /api/marketplace/listing/:id
 * 
 * Cancel/remove a listing
 *
 * Request Body:
 * {
 *   "sellerWallet": "0x..."
 * }
 *
 * Response:
 * {
 *   "message": "Listing cancelled successfully"
 * }
 */
router.delete('/listing/:id', async (req, res) => {
  try {
    // ... (copy your logic here) ...
    const { id } = req.params;
    const { sellerWallet } = req.body;

    if (!sellerWallet) {
         return res.status(400).json({ error: 'sellerWallet is required' });
    }

    await cancelListing(id, sellerWallet);
    res.json({ success: true, message: 'Listing cancelled successfully' });
  } catch (error) {
    console.error('Cancel listing error:', error);
    res.status(500).json({ error: 'Failed to cancel listing', message: error.message });
  }
});

export default router;
