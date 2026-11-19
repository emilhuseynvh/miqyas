import { registerAs } from '@nestjs/config';

const list = (value?: string) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

export const appConfig = registerAs('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  url: process.env.APP_URL as string,
  adminEmails: list(process.env.ADMIN_EMAILS),
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME as string,
}));

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET as string,
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS ?? 30),
  magicLinkSecret: process.env.MAGIC_LINK_SECRET as string,
  magicLinkTtlMinutes: Number(process.env.MAGIC_LINK_TTL_MINUTES ?? 15),
}));

export const mailConfig = registerAs('mail', () => ({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  from: process.env.MAIL_FROM as string,
}));

export const ingestionConfig = registerAs('ingestion', () => ({
  enabled: process.env.INGESTION_ENABLED !== 'false',
}));
