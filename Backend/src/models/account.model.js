const mongoose = require("mongoose");
const ledger = require("./ledger.model");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Account must be associated with user"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE, FROZEN OR CLOSED",
      },
      default: "ACTIVE",
    },

    currency: {
      type: String,
      required: [true, "Currency is required for creating an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

// Creating a compound index
accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    {
      $match: {
        account: this._id,
      },
    },

    {
      $group: {
        _id: null,

        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },

        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        totalDebit: 1,
        totalCredit: 1,

        balance: {
          $subtract: ["$totalCredit", "$totalDebit"],
        },
      },
    },
  ]);

  return balanceData[0] || 0;
};

const accountModel = mongoose.model("Account", accountSchema);

module.exports = { accountModel };
