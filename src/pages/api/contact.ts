import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST ?? "mail.smtp2go.com";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 2525);
const SMTP_USER = process.env.SMTP_USER ?? "no-reply@boyd.fyi";
const SMTP_PASS = process.env.SMTP_PASS ?? "cLbwWVcQH6dF2qlB";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "cdyboyd@gmail.com";
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL ?? "no-reply@boyd.fyi";

export const POST: APIRoute = async ({ request }) => {
	let body: any;
	try {
		body = await request.json();
	} catch {
		return json({ error: "invalid request" }, 400);
	}

	const name = String(body?.name ?? "").trim();
	const email = String(body?.email ?? "").trim();
	const message = String(body?.message ?? "").trim();

	if (!name || !email || !message) {
		return json({ error: "name, email, and message are required" }, 400);
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return json({ error: "invalid email address" }, 400);
	}
	if (name.length > 200 || message.length > 10000) {
		return json({ error: "message too long" }, 400);
	}

	try {
		const transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			secure: SMTP_PORT === 465,
			auth: { user: SMTP_USER, pass: SMTP_PASS },
		});
		await transporter.sendMail({
			from: FROM_EMAIL,
			to: TO_EMAIL,
			replyTo: email,
			subject: `[cody.onl] message from ${name}`,
			text: `Name: ${name}\nEmail: ${email}\n\n${message}\n`,
		});
		return json({ message: "message sent — thanks!" }, 200);
	} catch (err) {
		console.error("contact send failed:", err);
		return json({ error: "send failed — try email instead" }, 500);
	}
};

function json(data: unknown, status: number) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}
