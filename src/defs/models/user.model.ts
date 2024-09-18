// "use strict";

// import { ICategory, IJournal, IUser } from "../interfaces";

// // autoIncrement.initialize(mongoose.connection);

// type JournalModel = Model<IJournal>;
// type CategoryModel = Model<ICategory>;
// type UserModel = Model<IUser>;

// export const JournalSchema: Schema = new mongoose.Schema<
//   IJournal,
//   JournalModel
// >({
//   title: { type: String, required: true },
//   entry: { type: String, required: true },
//   category: { type: String, required: true },
//   date: String,
//   selected: Boolean,
// });

// export const CategorySchema: Schema = new mongoose.Schema<
//   ICategory,
//   CategoryModel
// >({
//   category: String,
//   selected: Boolean,
// });

// export const UserSchema: Schema = new mongoose.Schema<IUser, UserModel>({
//   username: { type: String, required: true, select: true },
//   usernameNormalized: { type: String, required: true, select: false },
//   email: { type: String, required: true, select: true },
//   emailNormalized: { type: String, required: true, select: false },
//   password: { type: String, required: true, select: false },
//   resetPasswordToken: { type: String, select: true },
//   resetPasswordExpires: { type: Date, select: true, required: false },
//   jwtToken: { type: String, select: true },
//   journals: { type: [JournalSchema], select: true },
//   journalCategories: { type: [CategorySchema], select: true },
// });

// export const User: UserModel = mongoose.model<IUser, UserModel>(
//   "user",
//   UserSchema
// );

export interface IUserProjection {
  _id: 1;
  username: 1;
  email: 1;
  journals: 1;
  journalCategories: 1;
}

export const UserProjection = {
  _id: 1,
  username: 1,
  email: 1,
  journals: 1,
  journalCategories: 1,
};
