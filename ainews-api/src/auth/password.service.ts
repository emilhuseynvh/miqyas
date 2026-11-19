import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, type ScryptOptions, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const PARAMS: ScryptOptions = { N: 16384, r: 8, p: 1 };

const derive = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, KEY_LENGTH, PARAMS, (err, key) => (err ? reject(err) : resolve(key))),
  );

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await derive(password, salt);
    return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
  }

  async verify(password: string, stored: string | null | undefined): Promise<boolean> {
    const [scheme, saltB64, keyB64] = stored?.split('$') ?? [];
    if (scheme !== 'scrypt' || !saltB64 || !keyB64) return false;
    const expected = Buffer.from(keyB64, 'base64');
    const actual = await derive(password, Buffer.from(saltB64, 'base64'));
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}
