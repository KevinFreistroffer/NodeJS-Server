import {
  DeleteResult,
  Filter,
  InsertOneResult,
  ObjectId,
  OptionalId,
  UpdateResult,
  WithId,
  MongoServerError,
  MongoNetworkError,
} from "mongodb";
import { getClient, usersCollection } from "../db";

import { ISanitizedUser, IUser } from "../defs/interfaces";
import { UserProjection } from "../defs/models/user.model";

/**
 * Find one
 */
export async function findOne({
  query,
  sanitize,
}: {
  query: Filter<IUser>;
  sanitize: true;
}): Promise<WithId<ISanitizedUser>>;
export async function findOne({
  query,
  sanitize,
}: {
  query: Filter<IUser>;
  sanitize: false;
}): Promise<WithId<IUser>>;
export async function findOne({
  query,
  sanitize,
}: {
  query: Filter<IUser>;
  sanitize: boolean;
}): Promise<IUser | ISanitizedUser | null> {
  console.log("findOne query", query);
  const client = await getClient();
  try {
    await client.connect();
    console.log("client connected");
    return await usersCollection(client).findOne<IUser | ISanitizedUser>(
      query,
      {
        projection: sanitize ? UserProjection : undefined,
      }
    );
  } catch (error) {
    console.log("findOne error", error);
    throw error;
  } finally {
    console.log("closing client");
    await client.close();
  }
}

/**
 * Find all users
 */
export async function findAll(
  query: Filter<IUser>,
  sanitize: true
): Promise<WithId<ISanitizedUser>[]>;
export async function findAll(
  query: Filter<IUser>,
  sanitize: false
): Promise<WithId<IUser>[]>;
export async function findAll(
  query: Filter<IUser>,
  sanitize: boolean
): Promise<IUser[] | ISanitizedUser[] | null> {
  const client = await getClient();

  try {
    await client.connect();
    const doc = await usersCollection(client)
      .find(query, {
        projection: sanitize ? UserProjection : undefined,
      })
      .toArray();
    return doc;
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Find all users
 * @param id
 */
export const findAllUsers = async () => await findAll({}, true);

/**
 * Find one by ID
 * @param id
 */
export const findOneById = async (id: ObjectId) => {
  console.log("findOneById id", id);
  return await findOne({ query: { _id: id }, sanitize: true });
};

/**
 * Find one by email
 * @param email
 */
export const findOneByEmail = async (email: string) =>
  await findOne({ query: { email }, sanitize: true });

/**
 * Find one by username
 * @param username
 */
export const findOneByUsername = async (username: string) => {
  return await findOne({ query: { username }, sanitize: true });
};

/**
 * Find one by username or email
 * @param username
 * @param email
 */
export const findOneByUsernameOrEmail = async (
  username: string,
  email: string
) =>
  await findOne({
    query: {
      $or: [{ username }, { email }],
    },
    sanitize: true,
  });

/**
 * Insert one
 * @param document
 */
export async function insertOne(
  document: OptionalId<IUser>
): Promise<InsertOneResult<IUser>> {
  const client = await getClient();
  try {
    await client.connect();
    return await usersCollection(client).insertOne(document);
  } catch (error) {
    // TODO: what type of errors? Handle specific errors?\
    if (error instanceof MongoServerError) {
      if (error.code === 11000) {
        throw new Error(
          "Duplicate key error: A user with this unique field already exists."
        );
      }
      throw new Error(`Database error: ${error.message}`);
    } else if (error instanceof MongoNetworkError) {
      throw new Error("Network error: Unable to connect to the database.");
    } else {
      throw new Error(
        `Unexpected error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  } finally {
    client.close();
  }
}

/**
 * Update one
 * @param query
 * @param update
 */
export async function updateOne(
  query: Filter<IUser>,
  update: Record<string, any>
): Promise<UpdateResult<IUser>> {
  const client = await getClient();
  try {
    await client.connect();
    const doc = await usersCollection(client).updateOne(query, update);
    return doc;
  } catch (error) {
    // TODO: what type of errors? Handle specific errors?
    throw error;
  } finally {
    client.close();
  }
}

/**
 * Update many
 * @param query
 * @param update
 */
export async function updateMany(
  query: Filter<IUser>,
  update: Record<string, any>
): Promise<UpdateResult<IUser>> {
  const client = await getClient();
  try {
    await client.connect();
    const doc = await usersCollection(client).updateMany(query, update);
    return doc;
  } catch (error) {
    // TODO: what type of errors? Handle specific errors?
    console.log("ERROR", error);
    throw error;
  } finally {
    client.close();
  }
}

/**
 * Delete all documents
 */
export async function deleteMany(): Promise<DeleteResult> {
  const client = await getClient();
  try {
    await client.connect();
    return await usersCollection(client).deleteMany();
  } catch (error) {
    // TODO: what type of errors? Handle specific errors?
    throw error;
  } finally {
    client.close();
  }
}

/**
 * Find one and update
 * @param query
 * @param update
 * @param options
 */
export async function findOneAndUpdate(
  query: Filter<IUser>,
  update: Record<string, any>,
  options?: { returnDocument?: "before" | "after" }
): Promise<IUser | ISanitizedUser | null> {
  const client = await getClient();
  try {
    await client.connect();
    return await usersCollection(client).findOneAndUpdate(query, update, {
      returnDocument: options?.returnDocument ?? "after",
      projection: options?.returnDocument ? undefined : UserProjection,
    });
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}
