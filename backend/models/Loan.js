// backend/models/loan.js

const pool = require('../db'); // Подключаем пул соединений PostgreSQL

// Функция для добавления кредита
const addLoan = async (fio, amount, interestRate, termYears) => {
  const query = `
    INSERT INTO loans (fio, amount, interestRate, termYears)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [fio, amount, interestRate, termYears];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Возвращаем добавленный кредит
  } catch (error) {
    throw new Error('Ошибка добавления кредита: ' + error.message);
  }
};

// Функция для получения всех кредитов
const getLoans = async () => {
  const query = 'SELECT * FROM loans;';
  try {
    const result = await pool.query(query);
    return result.rows; // Возвращаем список всех кредитов
  } catch (error) {
    throw new Error('Ошибка получения кредитов: ' + error.message);
  }
};

module.exports = {
  addLoan,
  getLoans,
};
