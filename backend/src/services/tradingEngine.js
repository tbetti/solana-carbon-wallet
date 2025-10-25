/**
 * Trading Engine (merged)
 * Location: backend/src/services/trading-engine.js
 *
 * - Uses existing pool from ../config/database
 * - Adds richer marketplace queries and atomic purchasing
 * - Keeps backwards-compatible methods by delegating
 */

const pool = require('../config/database');

class TradingEngine {
  // ---------- NEW: Flexible marketplace query with filters ----------
  static async getMarketplaceListings(filters = {}) {
    const { projectType, minPrice, maxPrice, minQuantity, sortBy, limit } = filters;

    let query = `
      SELECT
        ml.id AS "listingId",
        ml.price_usdc AS "pricePerCredit",
        ml.quantity_available AS "quantityAvailable",
        ml.seller_wallet AS "sellerWallet",
        ml.status,
        cp.project_name AS "projectName",
        cp.project_type AS "projectType",
        cp.vintage_year AS "vintage",
        cp.location_country AS "country",
        cp.location_region AS "region",
        cc.serial_number AS "serialNumber"
      FROM marketplace_listings ml
      JOIN carbon_credits cc ON ml.credit_id = cc.id
      JOIN carbon_projects cp ON cc.project_id = cp.project_id
      WHERE ml.status = 'Active'
    `;

    const params = [];
    let i = 1;

    if (projectType) { query += ` AND cp.project_type = $${i++}`; params.push(projectType); }
    if (minPrice)    { query += ` AND ml.price_usdc >= $${i++}`; params.push(minPrice); }
    if (maxPrice)    { query += ` AND ml.price_usdc <= $${i++}`; params.push(maxPrice); }
    if (minQuantity) { query += ` AND ml.quantity_available >= $${i++}`; params.push(minQuantity); }

    const sortOptions = {
      price_asc: 'ml.price_usdc ASC',
      price_desc: 'ml.price_usdc DESC',
      quantity_asc: 'ml.quantity_available ASC',
      quantity_desc: 'ml.quantity_available DESC'
    };
    query += ` ORDER BY ${sortOptions[sortBy] || 'ml.price_usdc ASC'}`;

    query += ` LIMIT $${i}`;
    params.push(limit || 50);

    const { rows } = await pool.query(query, params);
    return { listings: rows, total: rows.length };
  }

  // ---------- NEW: Listing details by ID ----------
  static async getListingById(listingId) {
    const query = `
      SELECT
        ml.id AS "listingId",
        ml.price_usdc AS "pricePerCredit",
        ml.quantity_available AS "quantityAvailable",
        ml.seller_wallet AS "sellerWallet",
        ml.listed_at AS "listedAt",
        ml.status,
        cp.project_id AS "projectId",
        cp.project_name AS "projectName",
        cp.project_type AS "projectType",
        cp.vintage_year AS "vintage",
        cp.location_country AS "country",
        cp.location_region AS "region",
        cp.co_benefits AS "coBenefits",
        cp.project_description AS "projectDescription",
        cp.registry_type AS "registryType",
        cp.methodology,
        cp.total_credits_issued AS "totalCreditsIssued",
        cp.verification_date AS "verificationDate",
        cc.serial_number AS "serialNumber",
        cc.id AS "creditId",
        cc.quantity AS "totalCreditQuantity"
      FROM marketplace_listings ml
      JOIN carbon_credits cc ON ml.credit_id = cc.id
      JOIN carbon_projects cp ON cc.project_id = cp.project_id
      WHERE ml.id = $1
    `;
    const { rows } = await pool.query(query, [listingId]);
    return rows[0] || null;
  }

  // ---------- NEW: Create listing ----------
  static async createListing(sellerWallet, creditId, quantity, pricePerCredit) {
    // sanity: ensure credit exists and has quantity (optional, but good)
    const { rows: creditRows } = await pool.query(
      `SELECT id, quantity FROM carbon_credits WHERE id = $1`, [creditId]
    );
    if (creditRows.length === 0) throw new Error('Credit not found');
    if (parseFloat(quantity) > parseFloat(creditRows[0].quantity)) {
      throw new Error(`Cannot list ${quantity} credits. Only ${creditRows[0].quantity} available.`);
    }

    const query = `
      INSERT INTO marketplace_listings (
        credit_id, seller_wallet, price_usdc, quantity_available, status
      ) VALUES ($1, $2, $3, $4, 'Active')
      RETURNING
        id AS "listingId",
        credit_id AS "creditId",
        seller_wallet AS "sellerWallet",
        price_usdc AS "pricePerCredit",
        quantity_available AS "quantityAvailable",
        status,
        listed_at AS "listedAt"
    `;
    const { rows } = await pool.query(query, [creditId, sellerWallet, pricePerCredit, quantity]);

    // Optional: reflect listing on credit record
    await pool.query(
      `UPDATE carbon_credits SET status = 'Listed', current_owner_wallet = $1 WHERE id = $2`,
      [sellerWallet, creditId]
    );

    return rows[0];
  }

  // ---------- NEW: Atomic purchase with transaction ----------
  static async purchaseCredits(buyerWallet, listingId, quantity) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: lrows } = await client.query(
        `
        SELECT ml.*, cc.id AS credit_id
        FROM marketplace_listings ml
        JOIN carbon_credits cc ON ml.credit_id = cc.id
        WHERE ml.id = $1 AND ml.status = 'Active'
        FOR UPDATE
        `,
        [listingId]
      );
      if (lrows.length === 0) throw new Error('Listing not found');

      const listing = lrows[0];
      if (parseFloat(listing.quantity_available) < parseFloat(quantity)) {
        throw new Error('Insufficient quantity available');
      }

      const pricePerCredit = parseFloat(listing.price_usdc);
      const subtotal = pricePerCredit * quantity;
      const platformFee = subtotal * 0.05; // 5%
      const totalCost = subtotal + platformFee;

      const tempSignature = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      const { rows: txRows } = await client.query(
        `
        INSERT INTO transactions (
          buyer_wallet, seller_wallet, listing_id, credit_id,
          quantity, price_per_credit, total_amount, platform_fee,
          transaction_signature, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Completed')
        RETURNING
          id AS "transactionId",
          quantity,
          price_per_credit AS "pricePerCredit",
          total_amount AS "totalAmount",
          platform_fee AS "platformFee",
          created_at AS "timestamp"
        `,
        [
          buyerWallet,
          listing.seller_wallet,
          listingId,
          listing.credit_id,
          quantity,
          pricePerCredit,
          totalCost,
          platformFee,
          tempSignature
        ]
      );

      await client.query(
        `
        UPDATE marketplace_listings
        SET
          quantity_available = quantity_available - $1,
          updated_at = CURRENT_TIMESTAMP,
          status = CASE
            WHEN quantity_available - $1 = 0 THEN 'Sold Out'
            ELSE 'Active'
          END
        WHERE id = $2
        `,
        [quantity, listingId]
      );

      // Update buyer / seller totals (upsert on wallet)
      await client.query(
        `
        INSERT INTO users (wallet_address, total_credits_purchased, total_co2_offset)
        VALUES ($1, $2, $2)
        ON CONFLICT (wallet_address)
        DO UPDATE SET
          total_credits_purchased = users.total_credits_purchased + EXCLUDED.total_credits_purchased,
          total_co2_offset = users.total_co2_offset + EXCLUDED.total_co2_offset
        `,
        [buyerWallet, quantity]
      );

      await client.query(
        `
        INSERT INTO users (wallet_address, total_credits_sold)
        VALUES ($1, $2)
        ON CONFLICT (wallet_address)
        DO UPDATE SET
          total_credits_sold = users.total_credits_sold + EXCLUDED.total_credits_sold
        `,
        [listing.seller_wallet, quantity]
      );

      await client.query('COMMIT');

      const t = txRows[0];
      return {
        transactionId: t.transactionId,
        quantity: parseFloat(t.quantity),
        pricePerCredit: parseFloat(t.pricePerCredit),
        totalCost: parseFloat(t.totalAmount),
        platformFee: parseFloat(t.platformFee),
        netAmount: parseFloat(t.totalAmount) - parseFloat(t.platformFee),
        timestamp: t.timestamp
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // ---------- NEW: Cancel listing ----------
  static async cancelListing(listingId, sellerWallet) {
    const { rows } = await pool.query(
      `
      UPDATE marketplace_listings
      SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND seller_wallet = $2 AND status = 'Active'
      RETURNING id AS "listingId", status, updated_at AS "cancelledAt"
      `,
      [listingId, sellerWallet]
    );
    if (rows.length === 0) throw new Error('Listing not found or unauthorized');
    return rows[0];
  }

  // ---------- NEW: Buyer transaction history ----------
  static async getTransactionHistory(walletAddress) {
    const transactionsQuery = `
      SELECT
        t.id AS "transactionId",
        t.quantity,
        t.price_per_credit AS "pricePerCredit",
        t.total_amount AS "totalAmount",
        t.platform_fee AS "platformFee",
        t.created_at AS "timestamp",
        t.status,
        t.transaction_signature AS "transactionSignature",
        cp.project_name AS "projectName",
        cp.project_type AS "projectType",
        cp.location_country AS "country",
        cp.vintage_year AS "vintage",
        cc.serial_number AS "serialNumber",
        'purchase' AS "type"
      FROM transactions t
      JOIN carbon_credits cc ON t.credit_id = cc.id
      JOIN carbon_projects cp ON cc.project_id = cp.project_id
      WHERE t.buyer_wallet = $1
      ORDER BY t.created_at DESC
    `;

    const totalsQuery = `
      SELECT
        COUNT(*) AS transaction_count,
        COALESCE(SUM(quantity),0) AS total_credits,
        COALESCE(SUM(total_amount),0) AS total_spent,
        COALESCE(SUM(quantity),0) AS total_co2_offset
      FROM transactions
      WHERE buyer_wallet = $1 AND status = 'Completed'
    `;

    const [tx, totals] = await Promise.all([
      pool.query(transactionsQuery, [walletAddress]),
      pool.query(totalsQuery, [walletAddress])
    ]);

    const s = totals.rows[0];
    return {
      transactions: tx.rows,
      totals: {
        totalCredits: parseFloat(s.total_credits),
        totalSpent: parseFloat(s.total_spent),
        totalCo2Offset: parseFloat(s.total_co2_offset)
      }
    };
  }

  // ---------- NEW: User stats ----------
  static async getUserStats(walletAddress) {
    const q = `
      SELECT
        COUNT(*) AS transaction_count,
        COALESCE(SUM(quantity),0) AS total_credits,
        COALESCE(SUM(total_amount),0) AS total_spent,
        COALESCE(SUM(quantity),0) AS total_co2_offset,
        COALESCE(AVG(price_per_credit),0) AS avg_price
      FROM transactions
      WHERE buyer_wallet = $1 AND status = 'Completed'
    `;
    const { rows } = await pool.query(q, [walletAddress]);
    const r = rows[0];
    return {
      totalCreditsPurchased: parseFloat(r.total_credits),
      totalSpent: parseFloat(r.total_spent),
      totalCo2Offset: parseFloat(r.total_co2_offset),
      averagePricePerCredit: parseFloat(r.avg_price),
      transactionCount: parseInt(r.transaction_count, 10)
    };
  }

  // ---------- NEW: Seller listings grouped ----------
  static async getSellerListings(walletAddress) {
    const q = `
      SELECT
        ml.id AS "listingId",
        ml.price_usdc AS "pricePerCredit",
        ml.quantity_available AS "quantityAvailable",
        ml.status,
        ml.listed_at AS "listedAt",
        ml.updated_at AS "updatedAt",
        cp.project_name AS "projectName",
        cp.project_type AS "projectType",
        cp.vintage_year AS "vintage"
      FROM marketplace_listings ml
      JOIN carbon_credits cc ON ml.credit_id = cc.id
      JOIN carbon_projects cp ON cc.project_id = cp.project_id
      WHERE ml.seller_wallet = $1
      ORDER BY ml.listed_at DESC
    `;
    const { rows } = await pool.query(q, [walletAddress]);
    return {
      activeListings: rows.filter(l => l.status === 'Active'),
      completedListings: rows.filter(l => l.status === 'Completed' || l.status === 'Sold Out'),
      cancelledListings: rows.filter(l => l.status === 'Cancelled')
    };
  }

  // ---------- NEW: Rich recommendPurchase (with filters) ----------
  static async recommendPurchase(creditsNeeded, preferredTypes = [], maxPricePerCredit = null) {
    let q = `
      SELECT
        ml.id AS "listingId",
        ml.price_usdc AS "pricePerCredit",
        ml.quantity_available AS "available",
        cp.project_name AS "projectName",
        cp.project_type AS "projectType",
        cp.location_country AS "country",
        cp.vintage_year AS "vintage",
        (ml.price_usdc * $1) AS "totalCost",
        $1 AS "quantity"
      FROM marketplace_listings ml
      JOIN carbon_credits cc ON ml.credit_id = cc.id
      JOIN carbon_projects cp ON cc.project_id = cp.project_id
      WHERE ml.status = 'Active' AND ml.quantity_available >= $1
    `;
    const params = [creditsNeeded];
    let i = 2;

    if (preferredTypes && preferredTypes.length > 0) {
      q += ` AND cp.project_type = ANY($${i++})`;
      params.push(preferredTypes);
    }
    if (maxPricePerCredit) {
      q += ` AND ml.price_usdc <= $${i++}`;
      params.push(maxPricePerCredit);
    }

    q += ` ORDER BY ml.price_usdc ASC LIMIT 5`;

    const { rows } = await pool.query(q, params);
    return {
      creditsNeeded,
      recommendations: rows,
      cheapestOption: rows[0] || null
    };
  }

  // ---------- Backwards-compat: your original names ----------

  // old: listCredits -> createListing
  static async listCredits(creditId, sellerWallet, priceUsdc, quantity) {
    return TradingEngine.createListing(sellerWallet, creditId, quantity, priceUsdc);
  }

  // old: buyCredits -> purchaseCredits
  static async buyCredits(listingId, buyerWallet, quantity) {
    return TradingEngine.purchaseCredits(buyerWallet, listingId, quantity);
  }

  // old: getMarketplace -> getMarketplaceListings
  static async getMarketplace(filters = {}) {
    const r = await TradingEngine.getMarketplaceListings(filters);
    return { listings: r.listings, count: r.total };
  }

  // old: getUserTransactions -> getTransactionHistory
  static async getUserTransactions(walletAddress) {
    return TradingEngine.getTransactionHistory(walletAddress);
  }

  // ---------- Cleanup ----------
  static async closePool() {
    // If your ../config/database exports a shared pool, usually you don't end it globally.
    // Expose for tests/CLI cleanup only.
    if (pool?.end) await pool.end();
  }
}

module.exports = TradingEngine;
