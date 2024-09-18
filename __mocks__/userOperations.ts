import { ObjectId } from "mongodb";
import { ISanitizedUser } from "../src/defs/interfaces";

export const findOne = jest.fn();
export const findAll = jest.fn();
export const findAllUsers = jest.fn<Promise<ISanitizedUser[]>, []>();
export const findOneById = jest.fn();
export const findOneByEmail = jest.fn();
export const findOneByUsername = jest.fn();
export const findOneByUsernameOrEmail = jest.fn();
export const insertOne = jest.fn();
export const updateOne = jest.fn();
export const deleteMany = jest.fn();

// You can provide default implementations if needed
findOne.mockResolvedValue(null);
findAll.mockResolvedValue([]);
findAllUsers.mockResolvedValue([]);
findOneById.mockResolvedValue(null);
findOneByEmail.mockResolvedValue(null);
findOneByUsername.mockResolvedValue(null);
findOneByUsernameOrEmail.mockResolvedValue(null);
insertOne.mockResolvedValue({ insertedId: new ObjectId() });
updateOne.mockResolvedValue({
  matchedCount: 0,
  modifiedCount: 0,
  upsertedCount: 0,
});
deleteMany.mockResolvedValue({ deletedCount: 0 });
