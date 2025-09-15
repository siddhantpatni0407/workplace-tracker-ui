// src/utils/validation.ts
import { FormValidationRule } from '../models';

/**
 * Validation utility functions
 */
export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate file size
   */
  static isValidFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Validate file type
   */
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type) || allowedTypes.includes('*');
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }

  /**
   * Validate required field
   */
  static isRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /**
   * Get password strength score (0-4)
   */
  static getPasswordStrength(password: string): number {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)) score++;
    
    return Math.min(score, 4);
  }

  /**
   * Get password strength label
   */
  static getPasswordStrengthLabel(score: number): string {
    switch (score) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Medium';
      case 4:
        return 'Strong';
      default:
        return 'Very Weak';
    }
  }

  /**
   * Validate using validation rules
   */
  static validateWithRules(value: any, rules: FormValidationRule[]): string | null {
    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!this.isRequired(value)) return rule.message;
          break;
        case 'email':
          if (value && !this.isValidEmail(value)) return rule.message;
          break;
        case 'minLength':
          if (typeof value === 'string' && value.length < rule.value) return rule.message;
          break;
        case 'maxLength':
          if (typeof value === 'string' && value.length > rule.value) return rule.message;
          break;
        case 'min':
          if (typeof value === 'number' && value < rule.value) return rule.message;
          break;
        case 'max':
          if (typeof value === 'number' && value > rule.value) return rule.message;
          break;
        case 'pattern':
          if (typeof value === 'string' && !new RegExp(rule.value).test(value)) return rule.message;
          break;
        default:
          break;
      }
    }
    return null;
  }
}