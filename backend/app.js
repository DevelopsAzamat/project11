const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config(); // Загружаем переменные окружения

const app = express();
app.use(cors());
app.use(express.json());

// Подключаемся к MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase"; // Используем строку из .env или дефолтную

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 30000 })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Завершаем приложение при ошибке подключения
  });

// Модель кредита
const creditSchema = new mongoose.Schema({
  fio: { type: String, required: true },
  amount: { type: String, required: true },
  interestRate: { type: String, required: true },
  termYears: { type: String, required: true },
});

const Credit = mongoose.model("Credit", creditSchema);

// Главная страница
const path = require("path");

// Middleware для статических файлов
app.use(express.static(path.join(__dirname, "public")));

// Роут для добавления кредита в базу данных
app.post("/add-credit", async (req, res) => {
  const { fio, amount, interestRate, termYears } = req.body;
  try {
    const newCredit = new Credit({ fio, amount, interestRate, termYears });
    await newCredit.save();
    res.status(201).json(newCredit);
  } catch (err) {
    res.status(400).json({ error: "Ошибка при сохранении данных: " + err.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
