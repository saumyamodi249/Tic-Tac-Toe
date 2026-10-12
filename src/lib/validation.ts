/**
 * Account Creation Validation Utilities & Regular Expressions
 */

/**
 * Username Regex: Only alphanumeric characters (letters and numbers, no spaces or special symbols).
 * User requirement: /^[a-zA-Z0-9]+$/
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;

/**
 * Email Regex: Standard email format checking valid local part, @ symbol, domain, and TLD.
 * User requirement: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password Regex:
 * - At least 8 characters long
 * - Contains at least one lowercase letter (a-z)
 * - Contains at least one uppercase letter (A-Z)
 * - Contains at least one digit (0-9)
 * - Contains at least one special character (!@#$%^&* etc.)
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]).{8,}$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

/**
 * Validates scholar username against USERNAME_REGEX
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim().length === 0) {
    return {
      isValid: false,
      error: 'Scholar username is required.',
    };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      isValid: false,
      error: 'Scholar username must contain only letters and numbers (no spaces or special characters).',
    };
  }

  return { isValid: true };
}

/**
 * Validates scholar email against EMAIL_REGEX
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: 'Scholar email address is required.',
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., scholar@academy.edu).',
    };
  }

  return { isValid: true };
}

/**
 * Breaks down password criteria for real-time UI feedback
 */
export function getPasswordCriteria(password: string): PasswordCriteria {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial && PASSWORD_REGEX.test(password),
  };
}

/**
 * Validates secret cipher (password) against PASSWORD_REGEX with informative error messages
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: 'Secret cipher (password) is required.',
    };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Secret cipher must be at least 8 characters in length.',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Secret cipher must contain at least one lowercase letter (a-z).',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Secret cipher must contain at least one uppercase letter (A-Z).',
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'Secret cipher must contain at least one number (0-9).',
    };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    return {
      isValid: false,
      error: 'Secret cipher must contain at least one special character (e.g. !@#$%^&*).',
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: 'Secret cipher does not meet the complexity requirements.',
    };
  }

  return { isValid: true };
}
