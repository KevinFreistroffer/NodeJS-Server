import { Document, ObjectId, WithId } from "mongodb";

export interface IJournal extends Document {
  title: string;
  entry: string;
  category: string;
  date: string;
  selected: boolean;
  favorite: boolean;
}
export interface ICategory {
  _id: ObjectId;
  category: string;
  selected: boolean;
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
