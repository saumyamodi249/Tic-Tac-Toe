import { describe, it, expect } from 'vitest';
import {
  USERNAME_REGEX,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  validateUsername,
  validateEmail,
  validatePassword,
  getPasswordCriteria,
} from '../lib/validation';
import { authService } from '../services/auth';

describe('Account Creation Validation & Regex Suite', () => {
  describe('Scholar Username Validation (/^[a-zA-Z0-9]+$/)', () => {
    it('accepts valid alphanumeric usernames', () => {
      const validNames = ['ria', 'Tactician42', 'Player1', 'A', '123456', 'GrandMaster'];
      for (const name of validNames) {
        expect(USERNAME_REGEX.test(name)).toBe(true);
        expect(validateUsername(name).isValid).toBe(true);
      }
    });

    it('rejects usernames with spaces', () => {
      expect(USERNAME_REGEX.test('ria smith')).toBe(false);
      expect(validateUsername('ria smith').isValid).toBe(false);
      expect(validateUsername('ria smith').error).toContain('only letters and numbers');
    });

    it('rejects usernames with special characters or symbols', () => {
      const invalidNames = ['ria_42', 'ria-smith', 'ria@master', 'tactician!', 'user.name'];
      for (const name of invalidNames) {
        expect(USERNAME_REGEX.test(name)).toBe(false);
        expect(validateUsername(name).isValid).toBe(false);
      }
    });

    it('rejects empty or whitespace usernames', () => {
      expect(validateUsername('').isValid).toBe(false);
      expect(validateUsername('   ').isValid).toBe(false);
    });
  });

  describe('Scholar Email Validation (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/)', () => {
    it('accepts valid email addresses', () => {
      const validEmails = [
        'saumya34@gmail.edu',
        'scholar@academy.edu',
        'player.one@domain.com',
        'tome_master+tag@sub.domain.org',
      ];
      for (const email of validEmails) {
        expect(EMAIL_REGEX.test(email)).toBe(true);
        expect(validateEmail(email).isValid).toBe(true);
      }
    });

    it('rejects invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'missingdomain@',
        'missingdot@domain',
        'space in@email.com',
        'email@with space.com',
      ];
      for (const email of invalidEmails) {
        expect(EMAIL_REGEX.test(email)).toBe(false);
        expect(validateEmail(email).isValid).toBe(false);
      }
    });

    it('rejects empty email', () => {
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail('   ').isValid).toBe(false);
    });
  });

  describe('Secret Cipher (Password) Validation (Strong Complexity)', () => {
    it('accepts strong passwords with min 8 chars, upper, lower, number, and special character', () => {
      const validPasswords = ['Secret@123', 'P@ssword1', 'Ria123!45', 'Tome#2026', 'A1b2c3d4!'];
      for (const pw of validPasswords) {
        expect(PASSWORD_REGEX.test(pw)).toBe(true);
        expect(validatePassword(pw).isValid).toBe(true);
        expect(getPasswordCriteria(pw).isValid).toBe(true);
      }
    });

    it('rejects passwords shorter than 8 characters', () => {
      const short = 'Sec@12';
      expect(PASSWORD_REGEX.test(short)).toBe(false);
      const res = validatePassword(short);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('at least 8 characters');
    });

    it('rejects passwords missing uppercase letters', () => {
      const noUpper = 'secret@123';
      expect(PASSWORD_REGEX.test(noUpper)).toBe(false);
      const res = validatePassword(noUpper);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('uppercase letter');
    });

    it('rejects passwords missing lowercase letters', () => {
      const noLower = 'SECRET@123';
      expect(PASSWORD_REGEX.test(noLower)).toBe(false);
      const res = validatePassword(noLower);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('lowercase letter');
    });

    it('rejects passwords missing numbers', () => {
      const noNum = 'Secret@pass';
      expect(PASSWORD_REGEX.test(noNum)).toBe(false);
      const res = validatePassword(noNum);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('number');
    });

    it('rejects passwords missing special characters', () => {
      const noSpecial = 'SecretPass123';
      expect(PASSWORD_REGEX.test(noSpecial)).toBe(false);
      const res = validatePassword(noSpecial);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('special character');
    });

    it('breaks down criteria correctly in getPasswordCriteria', () => {
      const criteria = getPasswordCriteria('Ab1!');
      expect(criteria.minLength).toBe(false); // only 4 chars
      expect(criteria.hasUpper).toBe(true);
      expect(criteria.hasLower).toBe(true);
      expect(criteria.hasNumber).toBe(true);
      expect(criteria.hasSpecial).toBe(true);
      expect(criteria.isValid).toBe(false);

      const validCriteria = getPasswordCriteria('Secret@2026');
      expect(validCriteria.minLength).toBe(true);
      expect(validCriteria.hasUpper).toBe(true);
      expect(validCriteria.hasLower).toBe(true);
      expect(validCriteria.hasNumber).toBe(true);
      expect(validCriteria.hasSpecial).toBe(true);
      expect(validCriteria.isValid).toBe(true);
    });
  });

  describe('authService.signUp regex enforcement', () => {
    it('rejects signup with non-alphanumeric username', async () => {
      const res = await authService.signUp('test@test.edu', 'Secret@123', 'ria 42');
      expect(res.user).toBeNull();
      expect(res.error).toContain('only letters and numbers');
    });

    it('rejects signup with invalid email', async () => {
      const res = await authService.signUp('invalidemail', 'Secret@123', 'ria');
      expect(res.user).toBeNull();
      expect(res.error).toContain('valid email');
    });

    it('rejects signup with weak password', async () => {
      const res = await authService.signUp('scholar@test.edu', '123456', 'ria');
      expect(res.user).toBeNull();
      expect(res.error).toContain('Secret cipher');
    });
  });
});
