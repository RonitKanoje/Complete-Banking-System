require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"BankingSystem" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Banking System!";

  const text = `Hello ${name},

Thank you for registering at Banking System.
We are excited to have you with us!`;

  const html = `
    <p>Hello ${name},</p>
    <p>Thank you for registering at <b>Banking System</b>.</p>
    <p>We are excited to have you with us!</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful!";

  const text = `Hello ${name},

Your transaction of ₹${amount} to account ${toAccount} was completed successfully.

Thank you for using Banking System.`;

  const html = `
    <p>Hello ${name},</p>

    <p>
      Your transaction of <b>₹${amount}</b> 
      to account <b>${toAccount}</b> 
      was completed successfully.
    </p>

    <p>Thank you for using <b>Banking System</b>.</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed!";

  const text = `Hello ${name},

We were unable to process your transaction of ₹${amount} to account ${toAccount}.

Please try again later or contact support if the issue persists.

Thank you for using Banking System.`;

  const html = `
    <p>Hello ${name},</p>

    <p>
      We were unable to process your transaction of 
      <b>₹${amount}</b> 
      to account <b>${toAccount}</b>.
    </p>

    <p>
      Please try again later or contact support if the issue persists.
    </p>

    <p>Thank you for using <b>Banking System</b>.</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
