import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @IsUrl({ require_tld: false })
  APP_URL: string;

  @IsString()
  DB_HOST: string;

  @IsInt()
  DB_PORT: number = 5432;

  @IsString()
  DB_USER: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsInt()
  @Min(1)
  SESSION_TTL_DAYS: number = 30;

  @IsString()
  @MinLength(32)
  MAGIC_LINK_SECRET: string;

  @IsString()
  @MinLength(32)
  INTERNAL_API_TOKEN: string;

  @IsInt()
  @Min(1)
  MAGIC_LINK_TTL_MINUTES: number = 15;

  @IsString()
  @IsOptional()
  ADMIN_EMAILS?: string;

  @IsString()
  @IsOptional()
  SMTP_HOST?: string;

  @IsInt()
  @IsOptional()
  SMTP_PORT?: number;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  SMTP_SECURE: boolean = false;

  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  @IsString()
  @IsOptional()
  SMTP_PASSWORD?: string;

  @IsString()
  MAIL_FROM: string;

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;

  @IsString()
  @IsOptional()
  GEMINI_MODEL?: string;

  @IsInt()
  @Min(0)
  SUMMARY_DAILY_LIMIT: number = 300;

  @Transform(({ value }) => value !== false && value !== 'false')
  @IsBoolean()
  INGESTION_ENABLED: boolean = true;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${details}`);
  }
  return validated;
}
