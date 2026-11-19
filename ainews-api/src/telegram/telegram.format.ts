export type ChannelStory = {
  title: string;
  summary: string;
  url: string;
  sourceCount: number;
  category: string | null;
  breaking: boolean;
};

export type DigestEntry = { title: string; url: string; sourceCount: number };

const MESSAGE_LIMIT = 4000;

export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function storyMessage(story: ChannelStory): string {
  const meta = [`${story.sourceCount} mənbə yazıb`, story.category].filter(Boolean).join(' | ');
  const lines = [
    ...(story.breaking ? ['🔴 <b>Son dəqiqə</b>'] : []),
    `<b>${escapeHtml(story.title)}</b>`,
    '',
    escapeHtml(story.summary),
    '',
    `${escapeHtml(meta)}`,
    `<a href="${escapeHtml(story.url)}">Bütün mənbələr Miqyas-da</a>`,
  ];
  return lines.join('\n').slice(0, MESSAGE_LIMIT);
}

export function digestMessage(date: string, entries: DigestEntry[], siteUrl: string): string {
  const items = entries.map(
    (entry, i) =>
      `${i + 1}. <a href="${escapeHtml(entry.url)}">${escapeHtml(entry.title)}</a> (${entry.sourceCount} mənbə)`,
  );
  return [
    `☀️ <b>Günün əsas xəbərləri, ${escapeHtml(date)}</b>`,
    '',
    ...items,
    '',
    `Bütün xəbərlər: <a href="${escapeHtml(siteUrl)}">${escapeHtml(new URL(siteUrl).host)}</a>`,
  ]
    .join('\n')
    .slice(0, MESSAGE_LIMIT);
}
