const express = require('express');
const { Pool } = require('pg');
const router = express.Router();  // Создание маршрутизатора

// PostgreSQL connection pool setup (reused from app.js)
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
// POST route to submit loan application
router.post('/submit-loan', async (req, res) => {
  const {
    fullName,
    birthDate,
    address,
    serialpass,
    passnum,
    pinflnum,
    phone,
    email,
    clientType,
    loanSum
  } = req.body;
  try {
    const query = `
      INSERT INTO creditor_client(
        full_name, birth_date, address, passport_series, passport_number, 
        pinfl, phone, email, client_type, loan_sum
      ) 
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
    `;
    const values = [fullName, birthDate, address, serialpass, passnum, pinflnum, phone, email, clientType, loanSum];
    
    const result = await pool.query(query, values);  // Execute query
    res.status(201).json(result.rows[0]);  // Send back inserted row as response
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Ошибка при отправке данных' });
  }
});
module.exports = router;
