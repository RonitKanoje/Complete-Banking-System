const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
/**
 * - user register controller
 * - POST api/auth/register
 */
async function userRegisterController(req, res) {
  try {
    const { email, password, name } = req.body;

    const isExist = await userModel.findOne({
      email: email,
    });

    if (isExist) {
      return res.status(422).json({
        message: "User already exist with this email",
        status: "failed",
      });
    }

    const user = await userModel.create({
      email,
      password,
      name,
    });

    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token);

    await emailService.sendRegistrationEmail(user.email, user.name);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "failed",
    });
  }
}

/**
 * - user login
 * - POST api/auth/login
 */
async function userLogin(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        status: "failed",
      });
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email or Password is Invalid",
        status: "failed",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Email or Password is Invalid",
        status: "failed",
      });
    }

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.cookie("token", token);

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "failed",
    });
  }
}

module.exports = { userRegisterController, userLogin };
