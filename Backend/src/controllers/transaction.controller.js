const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const accountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * -- Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 *
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {
  /**
   * 1. Validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "FromAccount ,toAccount, amount and idempotencyKey is required",
    });
  }

  const fromUSerAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }

  /**
   * 2. Validate idempotency key
   */

  const isTransactionAlreadyExist = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });
  if (isTransactionAlreadyExist) {
    if (isTransactionAlreadyExist.status == "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExist,
      });
    }
    if (isTransactionAlreadyExist.status == "PENDING") {
      return res.status(200).json({
        message: "Transaction is still in process",
      });
    }
    if (isTransactionAlreadyExist.status == "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed , please retry",
      });
    }
    if (isTransactionAlreadyExist.status == "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed please try again",
      });
    }
  }

  /**
   * - 3. Check account status
   */
  if (fromAccount.status != "ACTIVE" || toAccount.status != "ACTIVE") {
    return res.status(400).json({
      message: "Both fromAccount or toAccount must be ACTIVE",
    });
  }
  /**
   * 4. Derive sender balance from the ledger
   */

  const balance = await fromUSerAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient Balance Cuurent Balance is ${balance} and Requested amount is ${amount}`,
    });
  }

  /**
   * 5 Create Transaction
   */

  const session = await mongoose.startSession();
  session.startTransaction(); // this provides ACID properties

  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    },
    { session },
  );
  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    },
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  /**
   * 10 Send email notification
   */

  await emailService.sendTransactionEmail(
    req.user.mail,
    req.user.name,
    amount,
    toAccount,
  );

  return res.status(201).json({
    message: "Transaction completed successfully",
  });
}

module.exports = {
  createTransaction,
};
