import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS toujours présent, même en cas d'erreur
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});

  try {
    const { to, name, subject, html } = req.body || {};
    if (!to) return res.status(400).json({error:'email manquant'});

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
      subject: subject || 'Bienvenue sur ZenPay',
      html: html || `<p>Bonjour ${name || ''}, inscription réussie.</p>`
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    // on renvoie l'erreur avec CORS
    return res.status(500).json({ error: err.message });
  }
}
