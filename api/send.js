import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});

  try {
    const { to, name, subject, html, code } = req.body || {};
    if (!to) return res.status(400).json({error:'email manquant'});

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com', // garde smtp.zoho.eu si ton compte est en EU
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER, // noreply@zenpaybj.xyz
        pass: process.env.ZOHO_PASS  // g!ksQii3
      }
    });

    // Template par défaut qui fait BIP comme VANTEX
    const finalSubject = subject || (code ? `Votre code ZenPay est : ${code}` : 'Bienvenue sur ZenPay');
    
    const finalHtml = html || `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <div style="background:#6d28d9;padding:20px;text-align:center;color:white;font-size:22px;font-weight:bold">ZenPay</div>
        <div style="padding:24px;background:#ffffff;border:1px solid #eee">
          <p>Bonjour ${name || ''},</p>
          <p>${code ? `Votre code de vérification est : <b style="font-size:22px;letter-spacing:3px">${code}</b>` : 'Votre inscription a bien été prise en compte.'}</p>
          <p style="color:#666;font-size:13px">Ce code expire dans 5 minutes. Ne le partagez à personne.</p>
        </div>
        <p style="text-align:center;color:#999;font-size:11px">© ZenPay • noreply@zenpaybj.xyz</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"ZenPay" <${process.env.ZOHO_USER}>`,
      to,
      subject: finalSubject,
      text: code ? `Votre code ZenPay est : ${code}` : `Bonjour ${name || ''}`,
      html: finalHtml,
      // --- LES 3 LIGNES QUI FORCENT LE BIP GMAIL ---
      priority: 'high',
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'ZenPay Mailer'
      }
    });

    return res.status(200).json({ ok: true, sentTo: to });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
