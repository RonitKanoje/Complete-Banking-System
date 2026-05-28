const mongoose = require("mongoose");

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

const accountModel = mongoose.model("Account", accountSchema);

module.exports = { accountModel };
