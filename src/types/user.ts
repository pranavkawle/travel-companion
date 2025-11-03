export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface User {
  id: string;
  firstName: string;
  languages: string[]; // ISO 639-1 codes
  accountStatus: AccountStatus;
  mobileVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  // Extended profile information (no sensitive data like mobile/email)
}

export interface CreateUserInput {
  firstName: string;
  languages: string[];
  mobileNumber: string; // Stored in Auth0, not in database
}

export interface UpdateUserInput {
  firstName?: string;
  languages?: string[];
}
