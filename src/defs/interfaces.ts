import { Document, ObjectId, WithId } from "mongodb";

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

export interface IUser {
  username: string;
  usernameNormalized: string;
  email: string;
  emailNormalized: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordTokenExpires: Date | null;
  resetPasswordAttempts: [];
  isVerified: boolean; // Todo should make this required and setup the email verification
  // jwtToken: string; // TODO: I don't think this is needed. The token would get generated and sent to the client. Client sends the token, server parses it, and compares it to the found users
  // password and
  journals: IJournal[];
  journalCategories: ICategory[];
  createdAt: Date;
  updatedAt: Date;
  hasAcknowledgedHelperText: boolean;
  avatar?: string;
  avatarId?: string;
  reminders: IReminder[];
}

export interface IUserDoc extends WithId<IUser> {}

export interface ISanitizedUser
  extends Omit<
    IUserDoc,
    "password" | "usernameNormalized" | "emailNormalized"

    // | "resetPasswordToken"
    // | "resetPasswordTokenExpires"
    // | "jwtToken"
  > {}

// export interface ISanitizedUserDoc
//   extends Omit<
//     IUserDoc,
//     "password" | "usernameNormalized" | "emailNormalized"

//     // | "resetPasswordToken"
//     // | "resetPasswordTokenExpires"
//     // | "jwtToken"
//   > {}

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
