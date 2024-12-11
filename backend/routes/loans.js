// backend/routes/loan.js

const express = require('express');
const router = express.Router();
const { Pool } = require('pg'); // PostgreSQL connection

// Assuming you already have a Pool initialized in app.js
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

router.post('/add-credit', async (req, res) => {
  const { fio, amount, interestRate, termYears } = req.body;
  
  try {
    const query = 'INSERT INTO client(fio, amount, interest_rate, term_years) VALUES($1, $2, $3, $4)';
    await pool.query(query, [fio, amount, interestRate, termYears]);
    res.status(201).json({ message: 'Loan added successfully!' });
  } catch (error) {
    console.error('Error adding loan:', error);
    res.status(500).json({ error: 'Error adding loan to the database' });
  }
});

module.exports = router;
