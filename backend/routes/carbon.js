const express = require('express');
const router = express.Router();
const CarbonEngine = require('../src/services/carbonCalculator')
// ============================================================================
// CARBON CALCULATION ENDPOINTS
// ============================================================================

/**
 * POST /calculate
 * Calculate CO2 emissions from GPU usage
 *
 * Request Body:
 * {
 *   "gpuType": "A100",
 *   "hours": 100,
 *   "region": "US-West"  // optional
 * }
 *
 * Response:
 * {
 *   "gpuType": "A100",
 *   "hours": 100,
 *   "powerConsumption": 400,
 *   "totalKwh": 40,
 *   "co2Tons": 0.016,
 *   "creditsNeeded": 1,
 *   "estimatedCostUSDC": 15.00,
 *   "region": "US-West"
 * }
 */

router.post('/calculate', async (req, res) => {
  try {
    const { gpuType, hours, region } = req.body;

    // Validate input
    if (!gpuType || !hours) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['gpuType', 'hours']
      });
    }

    if (hours <= 0) {
      return res.status(400).json({
        error: 'Hours must be greater than 0'
      });
    }

    // Calculate emissions
    const result = await CarbonEngine.calculateEmissions(
      gpuType,
      hours,
      region
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Calculate emissions error:', error);
    res.status(500).json({
      error: 'Failed to calculate emissions',
      message: error.message
    });
  }
});

/**
 * POST /calculate/batch
 * Calculate emissions for multiple GPU usage sessions
 *
 * Request Body:
 * {
 *   "sessions": [
 *     { "gpuType": "A100", "hours": 50 },
 *     { "gpuType": "H100", "hours": 30 }
 *   ],
 *   "region": "EU-Central"  // optional
 * }
 *
 * Response:
 * {
 *   "sessions": [...],
 *   "totals": {
 *     "totalCo2Tons": 0.045,
 *     "totalCreditsNeeded": 1,
 *     "totalCost": 15.00
 *   }
 * }
 */
router.post('/calculate/batch', async (req, res) => {
  try {
    const { sessions, region } = req.body;

    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
      return res.status(400).json({
        error: 'Sessions array is required and must not be empty'
      });
    }

    const result = await CarbonEngine.calculateBatchEmissions(
      sessions,
      region
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Batch calculation error:', error);
    res.status(500).json({
      error: 'Failed to calculate batch emissions',
      message: error.message
    });
  }
});

/**
 * GET /gpu-types
 * Get list of supported GPU types with specs
 *
 * Response:
 * {
 *   "gpuTypes": [
 *     {
 *       "name": "A100",
 *       "powerWatts": 400,
 *       "manufacturer": "NVIDIA"
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/gpu-types', async (req, res) => {
  try {
    const gpuTypes = await CarbonEnginegetSupportedGPUs();

    res.json({
      success: true,
      data: gpuTypes
    });

  } catch (error) {
    console.error('GPU types error:', error);
    res.status(500).json({
      error: 'Failed to retrieve GPU types',
      message: error.message
    });
  }
});

module.exports = router;
