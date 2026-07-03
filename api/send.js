import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});
  
  const { to, name, subject, html } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_USER,
      pass: process.env.ZOHO_PASS
    }
  });

  await transporter.sendMail({
    from: `"ZenPay" <${process.env.ZOHO_USER}>`,
    to,
    subject: subject || 'Notification ZenPay',
    html: html || `<p>Bonjour ${name || ''},</p><p>Merci pour votre inscription.</p>`
  });

  res.status(200).json({ ok: true });
}
