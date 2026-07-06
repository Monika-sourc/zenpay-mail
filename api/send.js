import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({error:'POST only'});

  try {
    const { to, name, subject, html, code } = req.body || {};
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

    const finalSubject = subject || (code ? `Votre code ZenPay est : ${code}` : 'Bienvenue sur ZenPay');
    
    const finalText = code 
      ? `Bonjour ${name || ''},\nVotre code de verification ZenPay est : ${code}\nCe code expire dans 5 minutes.`
      : `Bonjour ${name || ''},\nBienvenue sur ZenPay.`;

    const finalHtml = html || `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;line-height:1.5">
        <p>Bonjour ${name || ''},</p>
        <p>${code ? `Votre code de vérification est : <b style="font-size:22px;letter-spacing:3px">${code}</b>` : 'Votre inscription a bien été prise en compte.'}</p>
        <p style="color:#666;font-size:13px">Ce code expire dans 5 minutes. Ne le partagez à personne.</p>
        <p style="color:#999;font-size:11px">© ZenPay • noreply@zenpaybj.xyz</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"ZenPay" <${process.env.ZOHO_USER}>`,
      to,
      subject: finalSubject,
      text: finalText,
      html: finalHtml,
      envelope: {
        from: 'noreply@send.zenpaybj.xyz',
        to: to
      }
    });

    return res.status(200).json({ ok: true, sentTo: to });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
