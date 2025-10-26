/**
 * Express API Routes for Carbon Credits
 *
 * This file is the JavaScript/Express conversion of the provided Python/Flask app.
 * It uses 'sqlite' (a promise-wrapper) and 'sqlite3' (the driver)
 * to replicate the database logic with async/await.
 */

const express = require('express');
const router = express.Router();
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const DATABASE = 'carbon_credits'; // Matches your Python app

/**
 * Helper function to get a database connection.
 * This is the async Node.js equivalent of your `get_db()` function.
 */
async function getDb() {
  // open() will create the DB connection.
  // The 'sqlite' package automatically handles the row factory,
  // returning objects just like `conn.row_factory = sqlite3.Row`.
  return open({
    filename: DATABASE,
    driver: sqlite3.Database
  });
}

// --- Routes ---

/**
 * @route   GET /api/marketplace
 * @desc    Get all available carbon credits
 * @maps    Python @app.route('/api/marketplace', methods=['GET'])
 */
router.get('/marketplace', async (req, res) => {
  let db;
  try {
    db = await getDb();
    
    // The query is identical, but we use `db.all()` to fetch all results
    const query = `
      SELECT 
        l.id,
        l.price_per_credit,
        l.quantity_available,
        c.project_name,
        c.project_type,
        c.country,
        c.vintage_year
      FROM listings l
      INNER JOIN carbon_credits c ON l.credit_id = c.id
      WHERE l.quantity_available > 0
      ORDER BY l.price_per_credit ASC
    `;
    
    // `db.all()` runs the query and returns an array of objects
    const listings = await db.all(query);
    
    // No manual mapping needed, `sqlite` package returns objects directly.
    return res.status(200).json({ listings: listings });

  } catch (e) {
    console.error(`Error fetching marketplace: ${e.message}`);
    return res.status(500).json({ error: e.message });
  } finally {
    // Ensure the database connection is closed, just like `conn.close()`
    if (db) await db.close();
  }
});

/**
 * @route   POST /api/purchase
 * @desc    Record a carbon credit purchase
 * @maps    Python @app.route('/api/purchase', methods=['POST'])
 */
router.post('/purchase', async (req, res) => {
  let db;
  try {
    // `request.json` in Flask is `req.body` in Express
    const {
      wallet_address,
      transaction_signature,
      credit_id,
      quantity = 1, // JS default value syntax
      price
    } = req.body;

    // `if not all([...])` check
    if (!wallet_address || !transaction_signature || !credit_id || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db = await getDb();

    // --- Begin Transaction ---
    // This is the equivalent of Python's implicit transaction
    // that is finalized with `conn.commit()` or `conn.rollback()`
    await db.run('BEGIN');

    // Check if listing exists and has enough quantity
    // `db.get()` is used to fetch a single row, like `cursor.fetchone()`
    const listing = await db.get(
      "SELECT quantity_available FROM listings WHERE id = ?",
      [credit_id]
    );

    if (!listing) {
      await db.run('ROLLBACK'); // Rollback on failure
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.quantity_available < quantity) {
      await db.run('ROLLBACK');
      return res.status(400).json({ error: 'Not enough credits available' });
    }

    // Record transaction
    // `datetime.now().isoformat()` is `new Date().toISOString()`
    const timestamp = new Date().toISOString();
    
    // `db.run()` is used for INSERT/UPDATE/DELETE, like `cursor.execute()`
    await db.run(`
      INSERT INTO transactions (
        wallet_address, 
        transaction_signature, 
        credit_id, 
        quantity, 
        price_paid, 
        timestamp
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      wallet_address,
      transaction_signature,
      credit_id,
      quantity,
      price,
      timestamp
    ]);

    // Update listing quantity
    await db.run(`
      UPDATE listings 
      SET quantity_available = quantity_available - ?
      WHERE id = ?
    `, [quantity, credit_id]);

    // --- Commit Transaction ---
    // Equivalent to `conn.commit()`
    await db.run('COMMIT');

    // Send the success response
    return res.status(200).json({
      success: true,
      message: 'Purchase recorded successfully',
      transaction_signature: transaction_signature
    });

  } catch (e) {
    console.error(`Error recording purchase: ${e.message}`);
    // If an error occurred, perform the `conn.rollback()`
    if (db) {
      try {
        await db.run('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to rollback:', rollbackError);
      }
    }
    return res.status(500).json({ error: e.message });
  } finally {
    // Equivalent to `conn.close()`
    if (db) await db.close();
  }
});

/**
 * @route   GET /api/user-credits/:wallet_address
 * @desc    Get carbon credits owned by a wallet
 * @maps    Python @app.route('/api/user-credits/<wallet_address>')
 */
router.get('/user-credits/:wallet_address', async (req, res) => {
  let db;
  try {
    // URL parameters are on `req.params`
    const { wallet_address } = req.params;

    db = await getDb();
    
    // The query is identical
    const query = `
      SELECT 
        t.transaction_signature,
        t.quantity,
        t.price_paid,
        t.timestamp,
        c.project_name,
        c.project_type,
        c.country
      FROM transactions t
      INNER JOIN carbon_credits c ON t.credit_id = c.id
      WHERE t.wallet_address = ?
      ORDER BY t.timestamp DESC
    `;
    
    // Pass the URL parameter as a bound parameter
    const credits = await db.all(query, [wallet_address]);
    
    // No manual mapping needed
    return res.status(200).json({ credits: credits });

  } catch (e) {
    console.error(`Error fetching user credits: ${e.message}`);
    return res.status(500).json({ error: e.message });
  } finally {
    if (db) await db.close();
  }
});

/**
 * This is the Node.js equivalent of Python's:
 * if __name__ == '__main__':
 * app.run(debug=True, port=8000)
 *
 * This logic would go in your main server file (e.g., index.js or app.js)
 *
 * const express = require('express');
 * const cors = require('cors');
 * const creditRoutes = require('./routes/credits'); // This file
 *
 * const app = express();
 *
 * // Enable CORS (like Flask-CORS)
 * app.use(cors());
 * // Enable JSON parsing (like Flask's automatic request.json)
 * app.use(express.json());
 *
 * // Use the routes
 * app.use('/api', creditRoutes); // All routes are prefixed with /api
 *
 * const PORT = process.env.PORT || 8000;
 * app.listen(PORT, () => {
 * console.log(`Server running on http://localhost:${PORT}`);
 * });
 */

// Export the router to be used in your main app.js
module.exports = router;
