import { sendMail } from "../config/emailConfig.js";
import { HttpError, asyncHandler, requireFields } from "../utils/http.js";

export const sendContactMessage = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "email", "message"]);
  const { name, email, subject, message } = req.body;
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Enter a valid email");
  if (message.length > 5000) throw new HttpError(400, "Message is too long");
  await sendMail({
    to: process.env.CONTACT_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER || "admin@localhost",
    subject: `[Contact] ${subject || "New message"} from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });
  res.json({ message: "Thanks! We'll get back to you within one working day." });
});
