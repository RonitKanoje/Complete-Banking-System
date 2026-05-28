const mongoose = require("mongoose");

const transaction = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.ObjectId,
    ref: "Account",
    required: [true, "Transaction must be associated with a from account "],
    index: true,
  },
  toAccount: {
    type: mongoose.Schema.ObjectId,
    ref: "Account",
    required: [true, "Transaction must be associated with a to account "],
    index: true,
  },
  status: {
    type: String,
    enum: {
      values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      message: "status can be either PENDING , COMPLETED , FAILED , REVERSED",
    },
    default: "PENDING",
  },
  amount: {
    type: Number,
    required: [true, "Amount is required for creating a transaction"],
    min: [0, "Transaction Amount can't be negative"],
  },
  idempotencyKey: {
    type: String,
    required: [true, "Idempotency Key is required for creating a transaction"],
    index: true,
    unique: true,
  },
});

const transactionModel = mongoose.model("Transaction", transaction);

module.exports = transactionModel;

// for one transaction we have to generate one idempotency key and we generate this key to avoid the same transaction should not occur twice
