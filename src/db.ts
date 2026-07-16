import { MongoClient, ServerApiVersion, type Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URL;
if (!uri) {
  throw new Error("MONGODB_URL is missing in environment variables");
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

export async function connectDB() {
  try {
    await client.connect();
    const database = client.db("medicare_hub");

    allDataCollection = database.collection("allDatas");
    addDataColl = database.collection("addDataColl");
    userColl = database.collection("usercoll");
    postComments = database.collection("postComments");

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    throw error;
  }
}