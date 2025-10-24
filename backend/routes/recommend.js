const express = require('express')
const router = express.Router();
const RecomendEngine = require('../recommend-engine')
// ============================================================================
// RECOMMENDATION ENDPOINTS
// ============================================================================

/**
 * POST /recommend/purchase
 * Get recommended carbon credit purchases based on emissions
 *
 * Request Body:
 * {
 *   "creditsNeeded": 5,
 *   "preferredTypes": ["Renewable Energy", "Forestry"],  // optional
 *   "maxPricePerCredit": 20.00  // optional
 * }
 *
 * Response:
 * {
 *   "creditsNeeded": 5,
 *   "recommendations": [
 *     {
 *       "listingId": "uuid",
 *       "projectName": "Wind Farm India",
 *       "projectType": "Renewable Energy",
 *       "pricePerCredit": 11.50,
 *       "quantity": 5,
 *       "totalCost": 57.50,
 *       "available": 1000
 *     }
 *   ],
 *   "cheapestOption": {...}
 * }
 */

router.post('/recommend/purchase', async (req, res) => {
  try {
    const { creditsNeeded, preferredTypes, maxPricePerCredit } = req.body;

    if (!creditsNeeded || creditsNeeded <= 0) {
      return res.status(400).json({
        error: 'creditsNeeded must be greater than 0'
      });
    }

    const recommendations = await RecomendEngine.recommendPurchase(
      creditsNeeded,
      preferredTypes,
      maxPricePerCredit
    );

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: error.message
    });
  }
});

module.exports = router;
