/**
 * Privacy helper functions for Travel Companion AU
 * 
 * CRITICAL: Mobile numbers MUST NEVER be exposed in any client-facing API
 * Mobile numbers are stored in Auth0 user_metadata only
 */

/**
 * Sanitizes user data to remove any sensitive information
 * This ensures mobile numbers and emails are never accidentally exposed
 */
export function sanitizeUserData<T extends Record<string, any>>(
  user: T
): Omit<T, 'mobile' | 'mobileNumber' | 'email' | 'phone'> {
  const { mobile, mobileNumber, email, phone, ...sanitized } = user;
  return sanitized;
}

/**
 * Formats a mobile number for display (masked)
 * Example: +61412345678 -> +61***45678
 * NOTE: This should only be used for the user viewing their OWN number
 */
export function maskMobileNumber(mobileNumber: string): string {
  if (!mobileNumber || mobileNumber.length < 8) {
    return '***';
  }

  // E.164 numbers have no spaces; country code is typically first 3 characters (e.g., +61)
  const countryCode = mobileNumber.substring(0, 3);
  const lastDigits = mobileNumber.slice(-5);
  return `${countryCode}***${lastDigits}`;
}

/**
 * Validates that a data structure does not contain sensitive fields
 * Throws an error if sensitive data is detected
 */
export function assertNoSensitiveData(data: any): void {
  const sensitiveFields = ['mobile', 'mobileNumber', 'email', 'phone', 'password'];
  
  function checkObject(obj: any, path = ''): void {
    if (obj === null || obj === undefined) return;
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => checkObject(item, `${path}[${index}]`));
      return;
    }
    
    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          throw new Error(
            `SECURITY VIOLATION: Sensitive field "${key}" detected at path "${currentPath}". ` +
            'Mobile numbers and emails must never be exposed in client-facing APIs.'
          );
        }
        
        checkObject(value, currentPath);
      }
    }
  }
  
  checkObject(data);
}

/**
 * Prepares user data for search results
 * Only includes: firstName, languages, accountStatus, mobileVerified
 */
export function prepareSearchResultUser(user: {
  id: string;
  firstName: string;
  languages: any;
  accountStatus: string;
  mobileVerified: boolean;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    languages: user.languages,
    mobileVerified: user.mobileVerified,
  };
}

/**
 * Validates E.164 mobile number format
 * E.164: +[country code][subscriber number]
 * Example: +61412345678, +14155551234
 */
export function isValidE164MobileNumber(mobileNumber: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(mobileNumber);
}

/**
 * Redacts sensitive information from error messages
 */
export function redactSensitiveFromError(error: Error): Error {
  const sensitivePatterns = [
    /\+\d{1,15}/g, // Phone numbers
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Emails
    /password[:=]\s*[\w\S]+/gi, // Passwords
  ];
  
  let message = error.message;
  sensitivePatterns.forEach(pattern => {
    message = message.replace(pattern, '[REDACTED]');
  });
  
  return new Error(message);
}
