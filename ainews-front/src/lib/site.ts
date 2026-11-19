export const site = {
  name: "Miqyas",
  url: process.env.SITE_URL ?? "https://miqyas.site",
  contactEmail: process.env.CONTACT_EMAIL ?? "info@miqyas.site",
  // Rəsmi profillər (Facebook, Telegram, Instagram, LinkedIn...) vergüllə: Organization schema-da sameAs olur.
  telegramUrl: "https://t.me/miqyas_xeber",
  socialLinks: (process.env.SOCIAL_LINKS ?? "https://t.me/miqyas_xeber").split(",").map((s) => s.trim()).filter(Boolean),
  tagline: "Xəbərin özü, konteksti və fərqli baxışlar",
  homeTitle: "Miqyas — Son xəbərlər, kontekst və fərqli baxışlar",
  description:
    "Azərbaycanın 200-dən çox xəbər saytından son xəbərlər bir yerdə: eyni hadisəni yazan bütün mənbələr, mövzu bölmələri, ən çox oxunanlar və fərdi xəbər lenti.",
  clocks: [
    { label: "Bakı", timeZone: "Asia/Baku" },
    { label: "İstanbul", timeZone: "Europe/Istanbul" },
    { label: "Moskva", timeZone: "Europe/Moscow" },
    { label: "London", timeZone: "Europe/London" },
    { label: "Nyu-York", timeZone: "America/New_York" },
    { label: "Pekin", timeZone: "Asia/Shanghai" },
  ],
} as const;
