const pool = require('../config/database');

class TradingEngine {
  static async listCredits(creditId, sellerWallet, priceUsdc, quantity) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const creditCheck = await client.query(
        'SELECT * FROM carbon_credits WHERE id = $1',
        [creditId]
      );

      if (creditCheck.rows.length === 0) throw new Error('Credit not found');

      const credit = creditCheck.rows[0];

      if (quantity > credit.quantity) {
        throw new Error(`Cannot list ${quantity} credits. Only ${credit.quantity} available.`);
      }

      const listingResult = await client.query(
        `INSERT INTO marketplace_listings
         (credit_id, seller_wallet, price_usdc, quantity_available, status)
         VALUES ($1, $2, $3, $4, 'Active')
         RETURNING *`,
        [creditId, sellerWallet, priceUsdc, quantity]
      );

      await client.query(
        `UPDATE carbon_credits
         SET status = 'Listed', current_owner_wallet = $1
         WHERE id = $2`,
        [sellerWallet, creditId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        listing: listingResult.rows[0],
        message: `Successfully listed ${quantity} credits at ${priceUsdc} USDC each`
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async buyCredits(listingId, buyerWallet, quantity) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const listingResult = await client.query(
        `SELECT l.*, c.project_id, c.serial_number
         FROM marketplace_listings l
         JOIN carbon_credits c ON l.credit_id = c.id
         WHERE l.id = $1 AND l.status = 'Active'`,
        [listingId]
      );

      if (listingResult.rows.length === 0) {
        throw new Error('Listing not found or inactive');
      }

      const listing = listingResult.rows[0];

      if (quantity > listing.quantity_available) {
        throw new Error(`Only ${listing.quantity_available} credits available`);
      }

      const pricePerCredit = parseFloat(listing.price_usdc);
      const totalAmount = pricePerCredit * quantity;
      const platformFee = totalAmount * 0.05;
      const sellerReceives = totalAmount - platformFee;

      const transactionResult = await client.query(
        `INSERT INTO transactions
         (buyer_wallet, seller_wallet, listing_id, credit_id, quantity,
          price_per_credit, total_amount, platform_fee, status, block_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Completed', CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          buyerWallet,
          listing.seller_wallet,
          listingId,
          listing.credit_id,
          quantity,
          pricePerCredit,
          totalAmount,
          platformFee
        ]
      );

      const newQuantity = listing.quantity_available - quantity;

      if (newQuantity === 0) {
        await client.query(
          `UPDATE marketplace_listings
           SET quantity_available = 0, status = 'Sold', sold_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [listingId]
        );
      } else {
        await client.query(
          `UPDATE marketplace_listings
           SET quantity_available = $1
           WHERE id = $2`,
          [newQuantity, listingId]
        );
      }

      await client.query(
        `INSERT INTO users (wallet_address, total_credits_purchased, total_co2_offset)
         VALUES ($1, $2, $3)
         ON CONFLICT (wallet_address)
         DO UPDATE SET
           total_credits_purchased = users.total_credits_purchased + $2,
           total_co2_offset = users.total_co2_offset + $3`,
        [buyerWallet, quantity, quantity]
      );

      await client.query(
        `INSERT INTO users (wallet_address, total_credits_sold)
         VALUES ($1, $2)
         ON CONFLICT (wallet_address)
         DO UPDATE SET
           total_credits_sold = users.total_credits_sold + $2`,
        [listing.seller_wallet, quantity]
      );

      await client.query('COMMIT');

      return {
        success: true,
        transaction: transactionResult.rows[0],
        summary: {
          buyer: buyerWallet,
          seller: listing.seller_wallet,
          quantity,
          pricePerCredit,
          totalAmount,
          platformFee,
          sellerReceives,
          projectId: listing.project_id,
          serialNumber: listing.serial_number
        },
        message: `Successfully purchased ${quantity} carbon credits`
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getMarketplace(filters = {}) {
    let query = `
      SELECT
        l.id as listing_id,
        l.price_usdc,
        l.quantity_available,
        l.listed_at,
        c.project_id,
        c.serial_number,
        c.quantity as total_credit_quantity,
        p.project_name,
        p.project_type,
        p.location_country,
        p.vintage_year,
        p.registry_type,
        p.co_benefits
      FROM marketplace_listings l
      JOIN carbon_credits c ON l.credit_id = c.id
      JOIN carbon_projects p ON c.project_id = p.project_id
      WHERE l.status = 'Active'
    `;

    const params = [];
    let paramCount = 1;

    if (filters.minPrice) { query += ` AND l.price_usdc >= $${paramCount}`; params.push(filters.minPrice); paramCount++; }
    if (filters.maxPrice) { query += ` AND l.price_usdc <= $${paramCount}`; params.push(filters.maxPrice); paramCount++; }
    if (filters.projectType) { query += ` AND p.project_type = $${paramCount}`; params.push(filters.projectType); paramCount++; }
    if (filters.country) { query += ` AND p.location_country = $${paramCount}`; params.push(filters.country); paramCount++; }

    query += ` ORDER BY l.price_usdc ASC`;

    const result = await pool.query(query, params);

    return { listings: result.rows, count: result.rows.length };
  }

  static async getUserTransactions(walletAddress) {
    const result = await pool.query(
      `SELECT
        t.*,
        p.project_name,
        p.project_type,
        p.location_country
       FROM transactions t
       JOIN carbon_credits c ON t.credit_id = c.id
       JOIN carbon_projects p ON c.project_id = p.project_id
       WHERE t.buyer_wallet = $1
       ORDER BY t.block_timestamp DESC`,
      [walletAddress]
    );

    const totals = result.rows.reduce((acc, tx) => {
      acc.totalCredits += parseFloat(tx.quantity);
      acc.totalSpent += parseFloat(tx.total_amount);
      acc.totalCo2Offset += parseFloat(tx.quantity);
      return acc;
    }, { totalCredits: 0, totalSpent: 0, totalCo2Offset: 0 });

    return { transactions: result.rows, totals };
  }

  static async recommendPurchase(creditsNeeded) {
    const result = await pool.query(
      `SELECT
        l.id as listing_id,
        l.price_usdc,
        l.quantity_available,
        l.seller_wallet,
        p.project_name,
        p.project_type
       FROM marketplace_listings l
       JOIN carbon_credits c ON l.credit_id = c.id
       JOIN carbon_projects p ON c.project_id = p.project_id
       WHERE l.status = 'Active' AND l.quantity_available >= $1
       ORDER BY l.price_usdc ASC
       LIMIT 5`,
      [creditsNeeded]
    );

    if (result.rows.length === 0) {
      return { available: false, message: 'No listings with sufficient quantity available' };
    }

    const recommendations = result.rows.map(listing => ({
      listingId: listing.listing_id,
      projectName: listing.project_name,
      projectType: listing.project_type,
      pricePerCredit: parseFloat(listing.price_usdc),
      quantity: creditsNeeded,
      totalCost: parseFloat((listing.price_usdc * creditsNeeded).toFixed(2)),
      available: listing.quantity_available
    }));

    return {
      available: true,
      creditsNeeded,
      recommendations,
      cheapestOption: recommendations[0]
    };
  }
}

module.exports = TradingEngine;
