const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,  // Try 465 if this fails
  secure: false,  // True for 465, false for 587
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS
  },
  tls: {
    rejectUnauthorized: false  // Bypass SSL errors (temporary)
  }
});

// Test transporter
transporter.verify((error, success) => {
  if (error) {
    console.log("Transporter error:", error);
  } else {
    console.log("Server is ready to send emails");
  }
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

module.exports = sendEmail;