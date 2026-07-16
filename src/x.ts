// import { MongoClient } from "mongodb";
// import express, { type Request, type Response } from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { ObjectId } from "mongodb";

// const uri = process.env.NEW_MONGODB_URL;
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });
// dotenv.config();

// const app = express();
// const PORT = Number(process.env.PORT) || 5000;

// // Middleware
// app.use(express.json());

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "https://medicare-hub-client.vercel.app"],
//     credentials: true,
//   }),
// );

// export async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log("You successfully connected to MongoDB!");
//     return client;
//   } catch (err) {
//     console.dir(err);
//   }
// }

// // Call this only when your application terminates
// export async function disconnectFromMongoDB() {
//   //   await client.close();
// }
