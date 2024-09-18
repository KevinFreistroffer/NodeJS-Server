import { Filter, InsertOneResult, ObjectId, OptionalId } from "mongodb";
import { getClient, errorLogsCollection } from "../db";
import { IErrorLog } from "../defs/interfaces";

export async function findOne({
  query,
}: {
  query: Filter<IErrorLog>;
}): Promise<IErrorLog | null> {
  const client = await getClient();

  try {
    await client.connect();
    return await errorLogsCollection(client).findOne<IErrorLog>(query);
  } catch (error) {
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Insert one
 * @param document
 */
export async function insertOne(
  document: OptionalId<IErrorLog>
): Promise<InsertOneResult<IErrorLog>> {
  const client = await getClient();
  try {
    await client.connect();
    return await errorLogsCollection(client).insertOne(document);
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}

/**
 * Find one by ID
 * @param id
 */
export const findOneById = async (id: ObjectId) =>
  await findOne({ query: { _id: id } });
