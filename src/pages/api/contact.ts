import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { name, email, message, website } = (req.body ?? {}) as ContactRequest;

  if (typeof website === "string" && website.trim()) return res.status(200).json({ success: true });

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";

  if (!cleanName || cleanName.length > 80 || !emailPattern.test(cleanEmail) || cleanEmail.length > 254 || !cleanMessage || cleanMessage.length > 5000) {
    return res.status(400).json({ error: "Please provide a valid name, email address, and message." });
  }

  const gmailUser = process.env.GMAIL_USER || "shwetanshubhatt@gmail.com";
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  if (!gmailAppPassword) return res.status(503).json({ error: "Email delivery is not configured." });

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailAppPassword },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: { name: "Shwetanshu Bhatt", address: gmailUser },
      to: gmailUser,
      replyTo: cleanEmail,
      subject: `Portfolio message from ${cleanName.replace(/[\r\n]+/g, " ")}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
    });

    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({ error: "Email delivery failed. Please try again." });
  }
}
