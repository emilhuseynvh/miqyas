import { emailLayout, escapeHtml } from './layout.js';

export type DigestLink = { title: string; url: string; source: string };

export type DigestSection = { title: string; items: DigestLink[] };

export function renderConfirmEmail(link: string) {
  const subject = 'Gündəlik icmala abunəliyi təsdiqlə';
  const body = `
    <tr><td style="font-size:26px;font-weight:600;padding-top:28px;">Bir addım qaldı</td></tr>
    <tr><td style="font-size:17px;line-height:1.5;padding:12px 0 24px;">Hər səhər 08:00-da günün əsas xəbərlərini almaq üçün abunəliyi təsdiqlə.</td></tr>
    <tr><td><a href="${link}" style="display:inline-block;background:#1b1a16;color:#f7f3d9;text-decoration:none;font-size:16px;font-weight:600;padding:12px 24px;">Abunəliyi təsdiqlə</a></td></tr>`;
  const footer =
    'Bu sorğunu sən göndərməmisənsə, məktubu nəzərə alma — təsdiq etməsən heç bir məktub almayacaqsan.';
  const text = `Bir addım qaldı\n\nAbunəliyi təsdiqləmək üçün linkə keç:\n${link}\n\n${footer}`;
  return { subject, html: emailLayout(body, footer), text };
}

export function renderDigestEmail(input: {
  dateLabel: string;
  sections: DigestSection[];
  siteUrl: string;
  unsubscribeUrl: string;
}) {
  const subject = `Gündəlik icmal — ${input.dateLabel}`;
  const sectionsHtml = input.sections
    .filter((section) => section.items.length > 0)
    .map(
      (section) => `
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#2a5674;padding-top:26px;padding-bottom:6px;">${escapeHtml(section.title)}</td></tr>
    ${section.items
      .map(
        (item) => `
    <tr><td style="padding:8px 0;border-bottom:1px solid #c9c29a;">
      <a href="${item.url}" style="color:#1b1a16;text-decoration:none;font-size:18px;font-weight:600;line-height:1.3;">${escapeHtml(item.title)}</a>
      <div style="font-family:Arial,sans-serif;font-size:12px;color:#5d5b4e;padding-top:4px;">${escapeHtml(item.source)}</div>
    </td></tr>`,
      )
      .join('')}`,
    )
    .join('');

  const body = `
    <tr><td style="font-size:26px;font-weight:600;padding-top:24px;">Gündəlik icmal</td></tr>
    <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#5d5b4e;padding-top:4px;">${escapeHtml(input.dateLabel)}</td></tr>
    ${sectionsHtml}
    <tr><td style="padding-top:24px;"><a href="${input.siteUrl}" style="font-family:Arial,sans-serif;font-size:14px;color:#2a5674;">Bütün xəbərlər saytda</a></td></tr>`;
  const footer = `Bu məktubu gündəlik icmala abunə olduğun üçün alırsan. <a href="${input.unsubscribeUrl}" style="color:#5d5b4e;">Abunəlikdən çıx</a>`;

  const text = [
    `Gündəlik icmal — ${input.dateLabel}`,
    ...input.sections
      .filter((section) => section.items.length > 0)
      .map(
        (section) =>
          `\n${section.title}\n${section.items.map((item) => `- ${item.title} (${item.source})\n  ${item.url}`).join('\n')}`,
      ),
    `\nAbunəlikdən çıx: ${input.unsubscribeUrl}`,
  ].join('\n');

  return { subject, html: emailLayout(body, footer), text };
}
