import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

import {
  connectDB,
  allDataCollection,
  addDataColl,
  userColl,
  postComments,
} from "./db";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://medicare-hub-client.vercel.app",
    ],
    credentials: true,
  })
);

// ====================== ROUTES ======================

app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 MediCare Hub Server Running");
});

app.get("/test", (_req: Request, res: Response) => {
  res.json({ message: "Test Route Working ✅" });
});

// All Data
app.get("/alldata", async (_req: Request, res: Response) => {
  try {
    if (!allDataCollection) {
      return res.status(500).json({ message: "Collection not initialized" });
    }
    const result = await allDataCollection.find().toArray();
    console.log(`✅ Fetched ${result.length} documents`);
    res.json(result);
  } catch (error) {
    console.error("ALldata Error:", error);
    res.status(500).json({
      message: "Failed to fetch data",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Single Doctor
app.get("/alldata/:id", async (req: Request, res: Response) => {
  try {
    let id = req.params.id;
    if (Array.isArray(id)) id = id[0];

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const result = await allDataCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Single Doctor Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Limited Data
app.get("/allLimitData", async (_req: Request, res: Response) => {
  try {
    const result = await allDataCollection.find().limit(8).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data" });
  }
});

// Register
app.post("/register", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await userColl.findOne({ email });
    res.json(user || { message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Registration Failed" });
  }
});

// Add Health Post
app.post("/addHealthPost", async (req: Request, res: Response) => {
  try {
    const result = await addDataColl.insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to add post" });
  }
});

// My Health Posts
app.get("/myhealth-posts", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ message: "Email required" });

    const result = await addDataColl.find({ email }).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// Comments
app.post("/postscoments", async (req: Request, res: Response) => {
  try {
    const result = await postComments.insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

app.get("/comments", async (_req: Request, res: Response) => {
  try {
    const result = await postComments.find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

app.get("/showcomments/:doctorId", async (req: Request, res: Response) => {
  try {
    const result = await postComments.find({ doctorId: req.params.doctorId }).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Delete Routes
app.delete("/deleteDoctor/:id", async (req: Request, res: Response) => {
  try {
    const result = await addDataColl.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

app.delete("/deleteComment/:id", async (req: Request, res: Response) => {
  try {
    const result = await postComments.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
async function startServer() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ MongoDB Connected & Server Ready");

    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error("❌ Server Start Failed:", error);
    process.exit(1);
  }
}

startServer();

export default app;