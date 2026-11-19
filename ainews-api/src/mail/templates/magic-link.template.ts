export type MagicLinkPurpose = 'login' | 'register';

type TemplateInput = {
  purpose: MagicLinkPurpose;
  link: string;
  ttlMinutes: number;
};

const copy: Record<
  MagicLinkPurpose,
  { subject: string; heading: string; body: string; action: string }
> = {
  login: {
    subject: 'Miqyas hesabına giriş linki',
    heading: 'Hesabına daxil ol',
    body: 'Hesabına daxil olmaq üçün aşağıdakı düyməyə kliklə.',
    action: 'Daxil ol',
  },
  register: {
    subject: 'Miqyas hesabını təsdiqlə',
    heading: 'Xoş gəldin',
    body: 'Hesab yaratmağı tamamlamaq üçün aşağıdakı düyməyə kliklə. Sonra adını və soyadını daxil edəcəksən.',
    action: 'Hesabı yarat',
  },
};

export function renderMagicLinkEmail({ purpose, link, ttlMinutes }: TemplateInput) {
  const c = copy[purpose];
  const note = `Link ${ttlMinutes} dəqiqə ərzində etibarlıdır və yalnız bir dəfə istifadə oluna bilər. Bu sorğunu sən göndərməmisənsə, məktubu nəzərə alma.`;

  const html = `<!doctype html>
<html lang="az">
  <body style="margin:0;background:#f7f3d9;font-family:Georgia,'Times New Roman',serif;color:#1b1a16;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
            <tr><td style="font-size:32px;font-weight:900;letter-spacing:-1px;padding-bottom:24px;border-bottom:1px dashed #1b1a16;">MİQYAS</td></tr>
            <tr><td style="font-size:26px;font-weight:600;padding-top:28px;">${c.heading}</td></tr>
            <tr><td style="font-size:17px;line-height:1.5;padding:12px 0 24px;">${c.body}</td></tr>
            <tr>
              <td>
                <a href="${link}" style="display:inline-block;background:#1b1a16;color:#f7f3d9;text-decoration:none;font-size:16px;font-weight:600;padding:12px 24px;">${c.action}</a>
              </td>
            </tr>
            <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#5d5b4e;line-height:1.5;padding-top:28px;">${note}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${c.heading}\n\n${c.body}\n\n${link}\n\n${note}`;

  return { subject: c.subject, html, text };
}
