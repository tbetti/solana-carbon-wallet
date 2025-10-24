const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(cors());
app.use(express.json());

// ============================================================================
// IMPORT & MOUNT ROUTES
// ============================================================================

// Import your new router files
const carbonRoutes = require('./routes/carbon');
const marketplaceRoutes = require('./routes/marketplace');
const userRoutes = require('./routes/user');
const recommendRoutes = require('./routes/recommend');
const infoRoutes = require('./routes/info');
const walletRoutes =require('./routes/wallet');

// Mount them to their base paths
app.use('/api/carbon', carbonRoutes);

// This line means: "Use marketplaceRoutes for any request starting with /api/marketplace"
app.use('/api/marketplace', marketplaceRoutes);

// This line means: "Use userRoutes for any request starting with /api/user"
app.use('/api/user', userRoutes);

// This line means: "Use recommendRoutes for any request starting with /api/recommend"
app.use('/api/recommend', recommendRoutes);

// This line means: "Use infoRoutes for any request starting with /api"
// (This will catch /api/health and /api/info)
app.use('/api', infoRoutes);

app.use('/api/wallet', walletRoutes);


// ============================================================================
// ERROR HANDLING (Keep this at the bottom)
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} does not exist`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Carbon Wallet API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📖 API info: http://localhost:${PORT}/api/info`);
});

module.exports = app;