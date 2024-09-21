export interface IJournal extends Document {
  title: string;
  entry: string;
  category: string;
  date: string;
  selected: boolean;
}
export interface ICategory extends Document {
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
  resetPasswordExpires?: Date;
  verified?: boolean; // Todo should make this required and setup the email verification
  // jwtToken: string; // TODO: I don't think this is needed. The token would get generated and sent to the client. Client sends the token, server parses it, and compares it to the found users
  // password and
  journals: IJournal[];
  journalCategories: ICategory[];
}

export interface ISanitizedUser
  extends Omit<
    IUser,
    "password" | "usernameNormalized" | "emailNormalized"

    // | "resetPasswordToken"
    // | "resetPasswordExpires"
    // | "jwtToken"
  > {}

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
