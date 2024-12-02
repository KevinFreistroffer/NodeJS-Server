import { ObjectId } from "mongodb";
import { IReminder, UserRole } from "../interfaces";

export class User {
  username: string;
  usernameNormalized: string;
  email: string;
  emailNormalized: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordTokenExpires: Date | null;
  journals: any[];
  journalCategories: any[];
  resetPasswordAttempts: { timestamp: string }[];
  isVerified: boolean = false;
  createdAt: Date;
  updatedAt: Date;
  hasAcknowledgedHelperText: boolean;
  avatar?: {
    _id: ObjectId;
    data: string;
    contentType: string;
  };
  reminders: IReminder[];
  role: UserRole;
  disabled: boolean;
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
    this.journals = [];
    this.journalCategories = [];
    this.resetPasswordAttempts = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.hasAcknowledgedHelperText = false;
    this.reminders = [];
    this.role = UserRole.MEMBER;
    this.disabled = false;
  }
}

export const UserProjection = {
  _id: 1,
  username: 1,
  name: 1,
  bio: 1,
  company: 1,
  location: 1,
  website: 1,
  email: 1,
  journals: 1,
  journalCategories: 1,
  resetPasswordToken: 1,
  resetPasswordTokenExpires: 1,
  resetPasswordAttempts: 1,
  isVerified: 1,
  createdAt: 1,
  updatedAt: 1,
  hasAcknowledgedHelperText: 1,
  avatar: 1,
  avatarId: 1,
  reminders: 1,
  role: 1,
  disabled: 1,
};
