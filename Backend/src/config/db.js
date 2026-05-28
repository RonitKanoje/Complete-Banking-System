require("dotenv").config();
const mongoose = require("mongoose");

function connectToDB() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Server is connected to DB");
    })
    .catch((err) => {
      console.log(err);
      process.exit(1); // without database server can't do anything so we are closing the server
    });
}

module.exports = { connectToDB };
