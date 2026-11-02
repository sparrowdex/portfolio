/**
 * Pink Y2K "instant message" email. Table layout + inline styles so it renders
 * in Gmail/Outlook. All inputs arrive already HTML-escaped.
 */
export function buildEmail({ name, email, message, firstName }: { name: string; email: string; message: string; firstName: string }) {
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const mono = "'Courier New', Courier, monospace";
  const sans = 'Arial, Helvetica, sans-serif';
  const dot = (c: string) =>
    `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c};border:1px solid rgba(0,0,0,0.25);margin-left:5px;"></span>`;
  const replyHref = `mailto:${email}?subject=${encodeURIComponent('Re: your message on my portfolio ✦')}`;
  return `
<div style="margin:0;padding:32px 12px;background:#ffd6ee;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;border-collapse:separate;">
    <tr><td style="text-align:center;padding-bottom:14px;font-family:${mono};font-size:13px;letter-spacing:3px;color:#c2006f;">✦ YOU'VE GOT MAIL ✦</td></tr>
    <tr><td style="background:#fff7fc;border:2px solid #7a0044;border-radius:12px;overflow:hidden;box-shadow:6px 6px 0 #c2006f;">
      <!-- title bar -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#ff2e93;border-bottom:2px solid #7a0044;padding:9px 14px;font-family:${mono};font-size:14px;font-weight:bold;color:#ffffff;">
            💬 ${name} — Instant Message
          </td>
          <td style="background:#ff2e93;border-bottom:2px solid #7a0044;padding:9px 14px;text-align:right;white-space:nowrap;">${dot('#ffd84a')}${dot('#5ee08a')}${dot('#ff5a7a')}</td>
        </tr>
      </table>
      <!-- chat -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:22px 22px 6px;font-family:${mono};font-size:13px;color:#7a0044;">
          <span style="color:#ff2e93;font-weight:bold;">${name}</span> has signed on ✦ <span style="color:#a37198;">${when}</span>
        </td></tr>
        <tr><td style="padding:8px 22px 4px;">
          <div style="background:#ffffff;border:2px solid #1a0f1f;border-radius:16px 16px 16px 4px;box-shadow:3px 3px 0 #1a0f1f;padding:14px 16px;font-family:${sans};font-size:15px;line-height:1.6;color:#1a0f1f;white-space:pre-wrap;">${message}</div>
        </td></tr>
        <tr><td style="padding:16px 22px 4px;font-family:${mono};font-size:13px;color:#1a0f1f;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#ffe1f1;border:1px dashed #ff8fd8;border-radius:8px;">
            <tr><td style="padding:10px 14px;font-family:${mono};font-size:13px;color:#7a0044;">
              ✿ <b>name:</b> ${name}<br />
              ✉ <b>email:</b> <a href="mailto:${email}" style="color:#c2006f;">${email}</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 22px 24px;text-align:center;">
          <a href="${replyHref}" style="display:inline-block;background:#ff2e93;color:#ffffff;text-decoration:none;font-family:${mono};font-size:15px;font-weight:bold;letter-spacing:1px;padding:12px 26px;border-radius:999px;border:2px solid #7a0044;box-shadow:0 3px 0 #7a0044;">
            ↩ REPLY TO ${firstName.toUpperCase()}
          </a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="text-align:center;padding-top:16px;font-family:${mono};font-size:11px;color:#a37198;">
      sent from sreeja's portfolio ✦ hit reply to answer them directly
    </td></tr>
  </table>
</div>`;
}
