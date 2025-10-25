# Carbon Wallet API - Setup Instructions

## 📦 What You're Getting

This package contains a complete REST API for your carbon credit marketplace with:
- **14 API endpoints** covering all functionality
- Carbon emissions calculator
- Marketplace listing/buying system
- User transaction tracking
- Purchase recommendations

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web server framework
- `cors` - Enable cross-origin requests
- `pg` - PostgreSQL database client
- `dotenv` - Environment variables

---

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=8000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/carbon_wallet

# Solana (add when ready)
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Platform
PLATFORM_FEE_PERCENTAGE=5
```

---

### Step 3: Run the Server
```bash
npm start
```

You should see:
```
🚀 Carbon Wallet API running on port 3000
📊 Health check: http://localhost:3000/api/health
📖 API info: http://localhost:3000/api/info
```

---

### Step 4: Test It Works
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-24T12:00:00Z",
  "version": "1.0.0"
}
```

✅ **You're done with basic setup!**

---

## 📁 File Structure

```
carbon-wallet-api/
├── carbon-wallet-api.js          # Main API file (all endpoints)
├── carbon-calculation-engine.js  # CO2 calculation logic
├── trading-engine.js              # Marketplace logic
├── package.json                   # Dependencies
├── .env                          # Environment variables
├── API-DOCUMENTATION.md          # Full API docs
└── README.md                     # This file
```

---

## 🔧 What Still Needs To Be Done

### 1. Connect to Database ✅ HIGH PRIORITY

The API expects these two files (you already built them):
- `carbon-calculation-engine.js`
- `trading-engine.js`

**Make sure they can connect to your PostgreSQL database.**

In each file, add at the top:
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

---

### 2. Add Solana Blockchain Integration 🔗 MEDIUM PRIORITY

When a user buys credits, you need to:
1. Transfer USDC from buyer to seller
2. Transfer carbon credit tokens to buyer
3. Record transaction on Solana

**In `trading-engine.js`, update the `purchaseCredits()` method to:**
- Call Solana smart contract
- Verify transaction on-chain
- Update database only if blockchain transaction succeeds

**You'll need:**
```bash
npm install @solana/web3.js @solana/spl-token
```

---

### 3. Add Authentication 🔐 MEDIUM PRIORITY

Right now, anyone can call any endpoint. Add:

**Option A: Simple JWT:**
```bash
npm install jsonwebtoken
```

**Option B: Wallet Signature Verification:**
```bash
npm install @solana/web3.js tweetnacl
```

Add middleware to verify:
- User owns the wallet address they claim
- Signature is valid
- Request hasn't been replayed

---

### 4. Add Input Validation ✔️ LOW PRIORITY

Consider using a validation library:
```bash
npm install joi
# or
npm install express-validator
```

This prevents bad data from reaching your database.

---

### 5. Add Rate Limiting 🚦 LOW PRIORITY

Prevent abuse:
```bash
npm install express-rate-limit
```

Example:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

### 6. Add Logging 📝 LOW PRIORITY

Better debugging and monitoring:
```bash
npm install winston
# or
npm install morgan
```

---

## 🧪 Testing the API

### Using cURL:

**Calculate emissions:**
```bash
curl -X POST http://localhost:3000/api/calculate-emissions \
  -H "Content-Type: application/json" \
  -d '{
    "gpuType": "A100",
    "hours": 100,
    "region": "US-West"
  }'
```

**Get marketplace listings:**
```bash
curl http://localhost:3000/api/marketplace/listings?limit=5
```

**Buy credits:**
```bash
curl -X POST http://localhost:3000/api/marketplace/buy \
  -H "Content-Type: application/json" \
  -d '{
    "buyerWallet": "0x123...",
    "listingId": "550e8400-e29b-41d4-a716-446655440000",
    "quantity": 10
  }'
```

---

### Using Postman:

1. Import the endpoints from `API-DOCUMENTATION.md`
2. Create a collection for each endpoint group
3. Test each endpoint individually

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot find module 'express'"
**Solution:** Run `npm install`

### Issue: "Database connection failed"
**Solution:**
1. Check your `.env` file has correct DATABASE_URL
2. Verify PostgreSQL is running
3. Test connection: `psql $DATABASE_URL`

### Issue: "Port 3000 already in use"
**Solution:**
1. Change PORT in `.env` to something else (e.g., 3001)
2. Or kill the process: `lsof -ti:3000 | xargs kill -9`

### Issue: "CORS error in browser"
**Solution:** The API already includes CORS middleware. If still having issues, specify allowed origins:
```javascript
app.use(cors({
  origin: 'http://localhost:3001' // your frontend URL
}));
```

---

## 📊 API Endpoint Summary

**Carbon Calculation (3 endpoints):**
- Calculate single GPU emissions
- Calculate batch emissions
- Get supported GPU types

**Marketplace (5 endpoints):**
- List all credits for sale
- Get single listing details
- Create new listing (sell)
- Buy credits
- Cancel listing

**User/Wallet (3 endpoints):**
- Get transaction history
- Get user statistics
- Get seller's listings

**Recommendations (1 endpoint):**
- Get purchase recommendations

**System (2 endpoints):**
- Health check
- API info

**Total: 14 endpoints**

---

## 🔄 Development Workflow

### For Development:
```bash
npm run dev  # Auto-restarts on file changes
```

### For Production:
```bash
npm start
```

### Environment Setup:
- **Development:** Use local PostgreSQL + Solana devnet
- **Staging:** Use test database + Solana testnet
- **Production:** Use production database + Solana mainnet

---

## 📚 Additional Resources

- **Full API Documentation:** See `API-DOCUMENTATION.md`
- **Solana Web3.js Docs:** https://solana-labs.github.io/solana-web3.js/
- **Express.js Docs:** https://expressjs.com/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Solana integration working
- [ ] Authentication implemented
- [ ] Input validation added
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] API documentation updated
- [ ] Load testing completed
- [ ] Backup strategy in place

---

## 🆘 Need Help?

If your developer gets stuck:

1. Check the logs for error messages
2. Review `API-DOCUMENTATION.md` for endpoint details
3. Test endpoints individually with `curl` or Postman
4. Verify database connection separately
5. Check that all required environment variables are set

---

## 🎯 Priority Order for Implementation

**Week 1 (Must Have):**
1. ✅ API endpoints (DONE - you have this)
2. Connect to database
3. Basic testing

**Week 2 (Important):**
4. Solana integration for buying/selling
5. Authentication/authorization
6. Error handling improvements

**Week 3 (Nice to Have):**
7. Rate limiting
8. Input validation
9. Logging system
10. Production deployment

---

## 📞 Questions for Your Developer

1. **Database:** Is PostgreSQL set up with the schema from the earlier conversation?
2. **Solana:** Do we have Solana wallets configured for testing?
3. **Frontend:** What's the frontend URL for CORS configuration?
4. **Deployment:** Where will this be hosted? (AWS, Heroku, etc.)
5. **Authentication:** What auth method do we prefer? (JWT, wallet signatures, etc.)

---

**Good luck! The hard part (designing the API) is done. Now it's just connecting the pieces!** 🚀