const mongoose = require("mongoose");

const ledgerSchema = mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "Ledger must be associated with an account"],
    index: true,
    immutable: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required for creating a ledger entry "],
    immutable: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: [true, "Ledger must be associated with the transaction"],
    index: true,
    immutable: true,
  },
  type: {
    type: String,
    enum: {
      values: ["CREDIT", "DEBIT"],
      message: "Type can be either CREDIT or DEBIT",
    },
    required: [true, "Ledger Type Is required"],
    immutable: true,
  },
});

// creating hooks to prevent the modification of the ledger

function preventLedgerModification() {
  throw new Error(
    "Ledger Entries are immutable and cannot be modified or deleted",
  );
}

// creating hooks to prevent the modification of the ledger

function preventLedgerModification() {
  throw new Error(
    "Ledger Entries are immutable and cannot be modified or deleted",
  );
}

// Prevent update operations
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("replaceOne", preventLedgerModification);

// Prevent delete operations
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);

const ledgerModel = mongoose.model("Ledger", ledgerSchema);

module.exports = ledgerModel;
        