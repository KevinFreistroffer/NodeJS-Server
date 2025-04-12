import { Document, ObjectId, WithId } from "mongodb";
import { GridFSBucketReadStream } from "mongodb";

export enum UserRole {
  ADMIN = "admin",
  MEMBER = "member",
}

export interface IJournal extends Document {
  title: string;
  // journal: string;
  entry: string;
  selected: boolean;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  sentimentScore: number;
}
export interface ICategory {
  _id: ObjectId;
  category: string;
  selected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReminder {
  _id: ObjectId;
  customFrequency: number;
  customUnit: string;
  date: string;
  description: string;
  endDate: string;
  ends: string;
  occurrences: number;
  recurrenceType: string;
  recurring: boolean;
  repeatOn: string[];
  time: string;
  title: string;
}

export interface IAvatar {
  _id: ObjectId;
  data: string;
  contentType: string;
}

export interface IUser {
  _id: ObjectId;
  username: string;
  name?: string;
  bio?: string;
  sex?: "male" | "female" | "non-binary";
  company?: string;
  location?: string;
  website?: string;
  email: string;
  password: string;
  role: UserRole;
  resetPasswordToken: string;
  resetPasswordTokenExpires: Date | null;
  resetPasswordAttempts: [];
  isVerified: boolean;
  journals: IJournal[];
  journalCategories: ICategory[];
  createdAt: Date;
  updatedAt: Date;
  hasAcknowledgedHelperText: boolean;
  avatar?: IAvatar;
  reminders: IReminder[];
  disabled: boolean;
}

export interface IUserCreate {
  username: string;
  name?: string;
  bio?: string;
  sex?: "male" | "female" | "non-binary";
  company?: string;
  location?: string;
  website?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  resetPasswordToken: string;
  resetPasswordTokenExpires: Date | null;
  resetPasswordAttempts: [];
  isVerified: boolean;
  journals: IJournal[];
  journalCategories: ICategory[];
  createdAt: Date;
  updatedAt: Date;
  hasAcknowledgedHelperText: boolean;
  avatar?: {
    data: string;
    contentType: string;
  };
  reminders: IReminder[];
  disabled: boolean;
}

export interface IUserDoc extends WithId<IUser> { }

export interface ISanitizedUser
  extends Omit<
    IUserDoc,
    "password"
  > { }

export interface ISession {
  _id: string;
  expires_at: Date;
  user_id: string;
}

export interface IErrorLog {
  date: Date;
  dateMs: number;
  url: string;
  message: string;
  stackTraceLimit?: string;
  cause?: string;
  code?: string;
  stack?: string;
}
