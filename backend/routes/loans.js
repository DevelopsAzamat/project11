const express = require("express");
const router = express.Router();
const Loan = require("../../models/Loan");

// GET: Получить все заявки
router.get("/", async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Добавить новую заявку
router.post("/", async (req, res) => {
  const { fio, amount, interestRate, termYears } = req.body;
  try {
    const newLoan = new Loan({ fio, amount, interestRate, termYears });
    await newLoan.save();
    res.status(201).json(newLoan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Удалить заявку
router.delete("/:id", async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ message: "Loan deleted" });
  } catch (err) {
    res.status(404).json({ error: "Loan not found" });
  }
});

module.exports = router;
app.get("/", (req, res) => {
  res.send("Welcome to the Credit API");
});
