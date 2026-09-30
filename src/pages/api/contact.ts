import type { NextApiRequest, NextApiResponse } from "next";
import { personal } from "@/data";

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

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) return res.status(503).json({ error: "Email delivery is not configured." });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [process.env.CONTACT_TO_EMAIL || personal.email],
        reply_to: cleanEmail,
        subject: `Portfolio message from ${cleanName}`,
        text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\n${cleanMessage}`,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return res.status(502).json({ error: "Email provider could not accept the message." });
    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({ error: "Email delivery failed. Please try again." });
  }
}
