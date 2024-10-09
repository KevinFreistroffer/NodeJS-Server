export interface IUserProjection {
  _id: 1;
  username: 1;
  email: 1;
  entries: 1;
  entryCategories: 1;
}

export class User {
  username: string;
  usernameNormalized: string;
  email: string;
  emailNormalized: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordTokenExpires: Date | null;
  entries: any[];
  entryCategories: any[];
  resetPasswordAttempts: { timestamp: string }[];
  isVerified: boolean = false;
  createdAt: Date;
  updatedAt: Date;
  hasAcknolwedgedHelperText: boolean;
  constructor({
    username,
    email,
    password,
    resetPasswordTokenExpires,
  }: {
    username: string;
    email: string;
    password: string;
    resetPasswordTokenExpires: Date | null;
  }) {
    this.username = username;
    this.usernameNormalized = username.toLowerCase();
    this.email = email;
    this.emailNormalized = email.toLowerCase();
    this.password = password;
    this.resetPasswordToken = "";
    this.resetPasswordTokenExpires = resetPasswordTokenExpires;
    this.entries = [];
    this.entryCategories = [];
    this.resetPasswordAttempts = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.hasAcknolwedgedHelperText = false;
  }
}

export const UserProjection = {
  _id: 1,
  username: 1,
  email: 1,
  entries: 1,
  entryCategories: 1,
  resetPasswordToken: 1,
  resetPasswordTokenExpires: 1,
  resetPasswordAttempts: 1,
  isVerified: 1,
  createdAt: 1,
  updatedAt: 1,
  hasAcknolwedgedHelperText: 1,
};
