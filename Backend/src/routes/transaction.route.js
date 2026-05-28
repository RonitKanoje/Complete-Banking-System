const { Router } = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const transactionRoutes = Router();

/**
 * -POST api/transactions
 * - Create a new transaction
 */

transactionRoutes.post(
  "/",
  authMiddleware.authMiddleWare,
  transactionController.createTransaction,
);

/**
 * - POST /api/transactions/system/inital-funds
 * - Create inital funds transaction from system user
 */

transactionRoutes.post("/system/initial-funds",authMiddleware.authMiddleWare,tra)

module.exports = transactionRoutes;
