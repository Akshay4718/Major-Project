import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: `"CPMS" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  };

  try {
    console.log(`📤 Attempting to send email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending email: ", error);
    console.error("Email details:", { to, subject });
    throw error; // Re-throw to let caller handle it
  }
};

export default sendMail;