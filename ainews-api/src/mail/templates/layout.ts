export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function emailLayout(body: string, footer: string): string {
  return `<!doctype html>
<html lang="az">
  <body style="margin:0;background:#f7f3d9;font-family:Georgia,'Times New Roman',serif;color:#1b1a16;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr><td style="font-size:32px;font-weight:900;letter-spacing:-1px;padding-bottom:20px;border-bottom:1px dashed #1b1a16;">MİQYAS</td></tr>
            ${body}
            <tr><td style="font-family:Arial,sans-serif;font-size:12px;color:#5d5b4e;line-height:1.5;padding-top:28px;border-top:1px dashed #1b1a16;margin-top:24px;">${footer}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
