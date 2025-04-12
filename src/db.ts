import { Collection, Document, MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { IErrorLog, ISession, IUser, IUserCreate } from "./defs/interfaces";
import dotenv from "dotenv";

dotenv.config();

export const getDBURI = () => {
  return (
    process.env.DATABASE_URI ||
    "mongodb+srv://" +
    encodeURIComponent(process.env.DATABASE_USERNAME || "") +
    ":" +
    encodeURIComponent(process.env.DATABASE_PASSWORD || "") +
    "@cluster0.7xxwju7.mongodb.net/" +
    encodeURIComponent(process.env.DATABASE_NAME || "") +
    "?retryWrites=true&w=majority&appName=Cluster0"
  );
};

export const getClient = () => {
  const uri = getDBURI();

  const client: MongoClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  return client;
};

export const usersCollection = (client: MongoClient) => {
  const db = client.db(process.env.DATABASE_NAME);

  return db.collection<IUser>("users", {
    //www.mongodb.com/resources/products/compatibilities/using-typescript-with-mongodb-tutorial
  }) as Collection<IUser> & {
    insertOne(doc: IUserCreate): Promise<{ acknowledged: boolean; insertedId: ObjectId }>;
  };
};

export const sessionsCollection = (client: MongoClient) =>
  client
    .db(process.env.DATABASE_NAME)
    .collection<ISession>("sessions") as Collection<ISession>;

export const errorLogsCollection = (client: MongoClient) =>
  client.db(process.env.DATABASE_NAME).collection<IErrorLog>("error-logs");
// .collection<IErrorLog>("error-logs") as Collection<IErrorLog>;
