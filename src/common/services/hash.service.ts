import { Injectable } from '@nestjs/common';

import { promisify } from 'util';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

import * as generator from 'generate-password';

const randomBytesAsync = promisify(randomBytes);
const scryptAsync = promisify(scrypt);

@Injectable()
export class HashService {
  async generateSalt() {
    return randomBytesAsync(16);
  }

  async hashPassword(password: string, salt: Buffer) {
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return buf.toString('hex');
  }

  async comparePasswords(password: string, hashPassword: string, salt: Buffer) {
    const hashedPasswordBuf = Buffer.from(hashPassword, 'hex');
    const suppliedPasswordBuf = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  }

  async createRefreshTokenHash(token: string) {
    const buf = (await scryptAsync(token, '10', 64)) as Buffer;

    return buf.toString('hex');
  }

  generatePassword() {
    return generator.generate({
      length: 12,
      numbers: true,
      symbols: true,
      strict: true,
    });
  }
}
