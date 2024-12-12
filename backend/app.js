const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

// Initialize app and configure middleware
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files

// Import the routes from loans.js
const loanRoutes = require('./routes/loans');
app.use('/api', loanRoutes); // Prefix all loan-related routes with /api

// PostgreSQL connection setup
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Check PostgreSQL connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL');
  }
});

// Serve the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('exit', () => {
  pool.end();  // Close the pool connection on exit
});
