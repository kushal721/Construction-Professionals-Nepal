import nodemailer from "nodemailer";

const isConfigured = () =>
  Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      !process.env.EMAIL_USER.includes("your_email")
  );

let transporter;

// Sends mail when SMTP is configured; otherwise logs it so local development
// works without credentials.
export const sendMail = async ({ to, subject, html, text }) => {
  if (!isConfigured()) {
    console.log(`\n[mail:dev] To: ${to}\n[mail:dev] Subject: ${subject}\n[mail:dev] ${text || html}\n`);
    return { dev: true };
  }
  transporter ??= nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  try {
    return await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error(`[mail] Failed to send "${subject}" to ${to}: ${err.message}`);
    if (process.env.NODE_ENV !== "production") console.log(`[mail:dev] ${text || html}`);
    return { failed: true };
  }
};
