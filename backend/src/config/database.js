const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Uncomment if needed for cloud DBs
  // ssl: { rejectUnauthorized: false },
});

module.exports = pool;
