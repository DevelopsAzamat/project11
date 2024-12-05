const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  fio: { type: String, required: true },
  amount: { type: String, required: true },
  interestRate: { type: String, required: true },
  termYears: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Loan", loanSchema);
