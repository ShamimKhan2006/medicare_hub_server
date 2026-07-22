import { MongoClient, ServerApiVersion, type Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URL;

if (!uri) {
  throw new Error("MONGODB_URL environment variable is missing!");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export let allDataCollection: Collection;
export let addDataColl: Collection;
export let userColl: Collection;
export let postComments: Collection;
export let isConnected = false;

let connectionPromise: Promise<void> | null = null;

async function establishConnection(): Promise<void> {
  await client.connect();
  const database = client.db("medicare_hub");

  allDataCollection = database.collection("allDatas");
  addDataColl = database.collection("addDataColl");
  userColl = database.collection("usercoll");
  postComments = database.collection("postComments");

  isConnected = true;
  console.log("MongoDB connected successfully to 'medicare_hub'");
}

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  if (!connectionPromise) {
    connectionPromise = establishConnection().catch((error) => {
      console.error("MongoDB connection failed:", error);
      isConnected = false;
      connectionPromise = null;
      throw error;
    });
  }

  return connectionPromise;
}

export async function closeDB() {
  try {
    isConnected = false;
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}