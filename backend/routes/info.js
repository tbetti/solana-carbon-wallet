const express = require('express');
const router = express.Router();
// ============================================================================
// HEALTH CHECK & INFO ENDPOINTS
// ============================================================================

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * GET /info
 * Get API information
 */
router.get('/info', (req, res) => {
  res.json({
    name: 'Carbon Wallet API',
    version: '1.0.0',
    description: 'API for carbon credit marketplace on Solana',
    endpoints: {
      carbon: [
        'POST /calculate-emissions',
        'POST /calculate-emissions/batch',
        'GET /gpu-types'
      ],
      marketplace: [
        'GET /marketplace/listings',
        'GET /marketplace/listing/:id',
        'POST /marketplace/list',
        'POST /marketplace/buy',
        'DELETE /marketplace/listing/:id'
      ],
      user: [
        'GET /user/:walletAddress/transactions',
        'GET /user/:walletAddress/stats',
        'GET /user/:walletAddress/listings'
      ],
      recommendations: [
        'POST /recommend/purchase'
      ]
    }
  });
});

module.exports = router;;
