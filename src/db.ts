import { Collection, Document, MongoClient, ServerApiVersion } from "mongodb";
import { IErrorLog, ISession, IUser } from "./defs/interfaces";
import dotenv from "dotenv";

dotenv.config();

export const getDBURI = () => {
  return (
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
  console.log("getClient() uri", uri);
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
  return db.collection<IUser>("users");
  //www.mongodb.com/resources/products/compatibilities/using-typescript-with-mongodb-tutorial
  // await db.command({
  //   collMod: "process.env.GAMES_COLLECTION_NAME",
  //   validator: {
  //     $jsonSchema: {
  //       bsonType: "object",
  //       required: ["name", "price", "category"],
  //       additionalProperties: false,
  //       properties: {
  //         _id: {},
  //         name: {
  //           bsonType: "string",
  //           description: "'name' is required and is a string",
  //         },
  //         price: {
  //           bsonType: "number",
  //           description: "'price' is required and is a number",
  //         },
  //         category: {
  //           bsonType: "string",
  //           description: "'category' is required and is a string",
  //         },
  //       },
  //     },
  //   },
  // });
};

export const sessionsCollection = (client: MongoClient) =>
  client
    .db(process.env.DATABASE_NAME)
    .collection<ISession>("sessions") as Collection<ISession>;

export const errorLogsCollection = (client: MongoClient) =>
  client.db(process.env.DATABASE_NAME).collection<IErrorLog>("error-logs");
// .collection<IErrorLog>("error-logs") as Collection<IErrorLog>;
