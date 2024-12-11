require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // For serving static files
const cors = require('cors');

const app = express();
app.use(express.json()); // For handling JSON data in request body

// Serve static files (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL connection pool setup
const pool = new Pool({
  user: process.env.PG_USER,       // PostgreSQL user
  host: process.env.PG_HOST,       // PostgreSQL host (localhost)
  database: process.env.PG_DATABASE, // PostgreSQL database name
  password: process.env.PG_PASSWORD, // PostgreSQL password
  port: process.env.PG_PORT,       // PostgreSQL port (5432 by default)
});

// Check PostgreSQL connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL');
  }
});

// Route to serve the index page (static HTML)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle adding a new loan to the database
app.post('/api/add-credit', async (req, res) => {
  const { fio, amount, interestRate, termYears } = req.body;

  // Check that all fields are provided
  if (!fio || !amount || !interestRate || !termYears) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
  }

  console.log('Received data:', { fio, amount, interestRate, termYears });

  try {
    // Insert data into the employee table
    const query = `
      INSERT INTO client(fio, amount, interest_rate, term_years)
      VALUES($1, $2, $3, $4) RETURNING *;
    `;
    const values = [fio, amount, interestRate, termYears];
    
    // Execute the query using the pool
    const result = await pool.query(query, values);  // Use the pool to execute the query

    console.log('Inserted row:', result.rows[0]);  // Log inserted row

    res.status(201).json(result.rows[0]);  // Send the inserted row back as a response
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ error: 'Ошибка при добавлении данных в базу' });
  }
});

// Enable CORS for cross-origin requests
app.use(cors());

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('exit', () => {
  pool.end();  // Close the pool connection when the application is about to exit
});
