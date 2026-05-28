const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authMiddleWare(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.user_id);

    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Token is Invalid",
    });
  }
}

module.exports = { authMiddleWare };
