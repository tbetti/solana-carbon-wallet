import { Router } from 'express';
const router = Router();
import { getTransactionHistory, getUserStats, getSellerListings } from '../trading-engine';
// ============================================================================
// USER/WALLET ENDPOINTS
// ============================================================================

/**
 * GET /:walletAddress/transactions
 * Get transaction history for a wallet
 *
 * Response:
 * {
 *   "transactions": [
 *     {
 *       "transactionId": "uuid",
 *       "type": "purchase",
 *       "quantity": 10,
 *       "pricePerCredit": 12.50,
 *       "totalAmount": 125.00,
 *       "projectName": "Solar Farm",
 *       "timestamp": "2024-10-24T12:00:00Z"
 *     }
 *   ],
 *   "totals": {
 *     "totalCredits": 150,
 *     "totalSpent": 1875.00,
 *     "totalCo2Offset": 150
 *   }
 * }
 */

router.get('/:walletAddress/transactions', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const history = await getTransactionHistory(walletAddress);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve transaction history',
      message: error.message
    });
  }
});

/**
 * GET /:walletAddress/stats
 * Get statistics for a wallet
 *
 * Response:
 * {
 *   "totalCreditsPurchased": 150,
 *   "totalSpent": 1875.00,
 *   "totalCo2Offset": 150,
 *   "averagePricePerCredit": 12.50,
 *   "transactionCount": 15
 * }
 */
router.get('/:walletAddress/stats', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const stats = await getUserStats(walletAddress);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user statistics',
      message: error.message
    });
  }
});

/**
 * GET /:walletAddress/listings
 * Get all listings created by a wallet
 *
 * Response:
 * {
 *   "activeListings": [...],
 *   "completedListings": [...],
 *   "cancelledListings": [...]
 * }
 */
router.get('/:walletAddress/listings', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const listings = await getSellerListings(walletAddress);

    res.json({
      success: true,
      data: listings
    });

  } catch (error) {
    console.error('Seller listings error:', error);
    res.status(500).json({
      error: 'Failed to retrieve seller listings',
      message: error.message
    });
  }
});

export default router;
