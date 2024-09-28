export interface IUserProjection {
  _id: 1;
  username: 1;
  email: 1;
  journals: 1;
  journalCategories: 1;
}

export class User {
  username: string;
  usernameNormalized: string;
  email: string;
  emailNormalized: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpires?: Date;
  journals: any[];
  journalCategories: any[];
  resetAttempts: { timestamp: string }[];
  isVerified: boolean = false;
  constructor({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }) {
    this.username = username;
    this.usernameNormalized = username.toLowerCase();
    this.email = email;
    this.emailNormalized = email.toLowerCase();
    this.password = password;
    this.resetPasswordToken = "";
    this.resetPasswordExpires = undefined;
    this.journals = [];
    this.journalCategories = [];
    this.resetAttempts = [];
  }
}

export const UserProjection = {
  _id: 1,
  username: 1,
  email: 1,
  journals: 1,
  journalCategories: 1,
  resetPasswordToken: 1,
  resetPasswordExpires: 1,
  resetAttempts: 1,
  isVerified: 1,
};
