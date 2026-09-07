const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, email, phone, interest, message } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required fields.' });
    }

    const smtpPassword = process.env.IONOS_SMTP_PASSWORD || 'Zeha_$10$10$22';

    // Configure IONOS Official Transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.de',
      port: 465,
      secure: true,
      auth: {
        user: 'kontakt@team-track.de',
        pass: smtpPassword
      }
    });

    // Premium Branded HTML Email Template
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Neue TeamTrack Projektanfrage</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; margin: 0; padding: 24px; }
          .wrapper { max-width: 620px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
          .header { background: linear-gradient(135deg, #0891b2 0%, #0284c7 50%, #2563eb 100%); padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { color: #e0f2fe; margin: 6px 0 0 0; font-size: 13px; font-weight: 500; }
          .body { padding: 32px 24px; }
          .badge { display: inline-block; background-color: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.4); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 20px; }
          .card { background-color: #1e293b; border-radius: 14px; border: 1px solid #334155; padding: 20px; margin-bottom: 20px; }
          .row { display: table; width: 100%; padding: 8px 0; border-bottom: 1px solid #334155; }
          .row:last-child { border-bottom: none; }
          .label { display: table-cell; width: 35%; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top; }
          .value { display: table-cell; width: 65%; font-size: 14px; font-weight: 600; color: #f8fafc; vertical-align: top; }
          .value a { color: #38bdf8; text-decoration: none; }
          .value strong { color: #34d399; font-weight: 700; }
          .msg-card { background-color: #1e293b; border-left: 4px solid #06b6d4; border-radius: 8px; padding: 16px; font-size: 14px; color: #e2e8f0; line-height: 1.6; margin-top: 6px; }
          .btn-container { text-align: center; margin: 32px 0 16px 0; }
          .reply-btn { display: inline-block; background: linear-gradient(135deg, #06b6d4, #0284c7); color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 15px rgba(6,182,212,0.3); }
          .footer { text-align: center; padding: 20px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; background-color: #0b1120; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>🚀 TeamTrack Web Inquiry</h1>
            <p>Neue Projektberatungsanfrage über die Website</p>
          </div>
          <div class="body">
            <div style="text-align: center;">
              <span class="badge">Eingehende Kundenanfrage</span>
            </div>

            <div class="card">
              <div class="row">
                <div class="label">Kunde / Name:</div>
                <div class="value" style="color: #38bdf8; font-size: 15px;">${name}</div>
              </div>
              <div class="row">
                <div class="label">Firma / Unternehmen:</div>
                <div class="value">${company || 'Nicht angegeben'}</div>
              </div>
              <div class="row">
                <div class="label">E-Mail:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="row">
                <div class="label">Telefon:</div>
                <div class="value">${phone ? `<a href="tel:${phone}">${phone}</a>` : 'Nicht angegeben'}</div>
              </div>
              <div class="row">
                <div class="label">Interesse / Modul:</div>
                <div class="value"><strong>${interest || 'Individuelle WebApp'}</strong></div>
              </div>
            </div>

            <div style="margin-top: 16px;">
              <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Projektbeschreibung & Notiz:</div>
              <div class="msg-card">
                ${message ? message.replace(/\n/g, '<br>') : '<em>Keine zusätzliche Notiz hinterlassen.</em>'}
              </div>
            </div>

            <div class="btn-container">
              <a href="mailto:${email}?subject=Ihre%20Anfrage%20bei%20TeamTrack%20Softwareentwicklung" class="reply-btn">
                ✉️ Direkt per E-Mail antworten (${name})
              </a>
            </div>
          </div>

          <div class="footer">
            <strong>TeamTrack Softwareentwicklung & IT-Beratung</strong><br>
            Balthasar-Neumann-Straße 38, 97236 Randersacker<br>
            Inhaberin: Huriye Ünalsoy • <a href="https://team-track.de" style="color: #64748b;">team-track.de</a>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send Mail via IONOS SMTP directly
    const info = await transporter.sendMail({
      from: '"TeamTrack Webform" <kontakt@team-track.de>',
      to: 'kontakt@team-track.de, teamtrack.software@hotmail.com',
      replyTo: email,
      subject: `🚀 Neue Projektanfrage: ${company || name} - ${interest || 'Software'}`,
      html: htmlBody
    });

    console.log('Message sent successfully via IONOS SMTP:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });

  } catch (error) {
    console.error('Server error processing inquiry:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};