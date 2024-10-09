// "use strict";

// import { ICategory, IEntry, IUser, ISession } from "../interfaces";

// // autoIncrement.initialize(mongoose.connection);

// type SessionModel = Model<ISession>;

// export const SessionSchema: Schema = new mongoose.Schema<
//   ISession,
//   SessionModel
// >({
//   expires_at: { type: Date, required: true, select: true },
//   user_id: { type: String, required: true, select: true },
// });

// export const Session: SessionModel = mongoose.model<ISession, SessionModel>(
//   "session",
//   SessionSchema
// );
