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
  journals: any[];
  journalCategories: any[];
  resetAttempts: { timestamp: string }[];
  lastResetAttempt: string;

  constructor(username: string, email: string, password: string) {
    this.username = username;
    this.usernameNormalized = username.toLowerCase();
    this.email = email;
    this.emailNormalized = email.toLowerCase();
    this.password = password;
    this.resetPasswordToken = "";
    this.journals = [];
    this.journalCategories = [];
    this.resetAttempts = [];
    this.lastResetAttempt = "";
  }
}

export const UserProjection = {
  _id: 1,
  username: 1,
  email: 1,
  journals: 1,
  journalCategories: 1,
};
