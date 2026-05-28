const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating user"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
      unique: [true, "Email already exist"],
    },
    name: {
      type: String,
      required: [true, "Name is required for a creating an account "],
    },
    password: {
      type: String,
      required: [true, "Password is required for creating an account"],
      minlength: [6, "Password should of atleast 6 characters"],
      select: false, // whenever we are fetching user using a query password will not be there
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function name() {
  // before saving the data into database run this function
  if (!this.isModified("password")) {
    return;
  }
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  return;
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
