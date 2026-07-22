import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

import {
  connectDB,
  closeDB,
  allDataCollection,
  addDataColl,
  userColl,
  postComments,
  isConnected,
} from "./db";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "https://medicare-hub-client.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB connection failed in middleware:", error);
    res.status(503).json({ message: "Database not connected" });
  }
});

const log = (method: string, path: string, status?: number) => {
  const ts = new Date().toISOString();
  if (status) {
    console.log(`[${ts}] ${method} ${path} -> ${status}`);
  } else {
    console.log(`[${ts}] ${method} ${path}`);
  }
};

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: isConnected ? "healthy" : "degraded",
    db: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "MediCare Hub Server Running" });
});

app.get("/test", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Test Route Working" });
});

app.get("/alldata", async (_req: Request, res: Response) => {
  log("GET", "/alldata");
  try {
    if (!isConnected || !allDataCollection) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const result = await allDataCollection.find().toArray();
    log("GET", "/alldata", 200);
    res.status(200).json(result);
  } catch (error) {
    console.error("ALldata Error:", error);
    log("GET", "/alldata", 500);
    res.status(500).json({
      message: "Failed to fetch data",
      ...(NODE_ENV === "development" && {
        error: error instanceof Error ? error.message : String(error),
      }),
    });
  }
});

app.get("/alldata/:id", async (req: Request, res: Response) => {
  log("GET", `/alldata/${req.params.id}`);
  try {
    let id = req.params.id;
    if (Array.isArray(id)) id = id[0];

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (!isConnected || !allDataCollection) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const result = await allDataCollection.findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Single Doctor Error:", error);
    log("GET", `/alldata/${req.params.id}`, 500);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/allLimitData", async (_req: Request, res: Response) => {
  log("GET", "/allLimitData");
  try {
    if (!isConnected || !allDataCollection) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const result = await allDataCollection.find().limit(8).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("allLimitData Error:", error);
    log("GET", "/allLimitData", 500);
    res.status(500).json({ message: "Failed to fetch data" });
  }
});

app.post("/register", async (req: Request, res: Response) => {
  log("POST", "/register");
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!isConnected || !userColl) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const user = await userColl.findOne({ email: email.trim().toLowerCase() });
    res.status(200).json(user || { message: "User not found" });
  } catch (error) {
    console.error("Register Error:", error);
    log("POST", "/register", 500);
    res.status(500).json({ message: "Registration Failed" });
  }
});

app.post("/addHealthPost", async (req: Request, res: Response) => {
  log("POST", "/addHealthPost");
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is required" });
    }

    if (!isConnected || !addDataColl || !allDataCollection) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const data = req.body;

    const addResult = await addDataColl.insertOne(data);
    const allDataResult = await allDataCollection.insertOne(data);

    res.status(201).json({
      addDataColl: addResult,
      allDataCollection: allDataResult,
      message: "Health post added successfully",
    });
  } catch (error) {
    console.error("Add Health Post Error:", error);
    log("POST", "/addHealthPost", 500);
    res.status(500).json({ message: "Failed to add post" });
  }
});

app.get("/myhealth-posts", async (req: Request, res: Response) => {
  log("GET", "/myhealth-posts");
  try {
    const email = req.query.email as string | undefined;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    if (!isConnected || !addDataColl) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const result = await addDataColl.find({ email }).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("My Health Posts Error:", error);
    log("GET", "/myhealth-posts", 500);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

app.post("/postscoments", async (req: Request, res: Response) => {
  log("POST", "/postscoments");
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is required" });
    }

    if (!isConnected || !postComments) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const result = await postComments.insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Posts Comments Error:", error);
    log("POST", "/postscoments", 500);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

app.get("/comments", async (_req: Request, res: Response) => {
  log("GET", "/comments");
  try {
    if (!isConnected || !postComments) {
      return res.status(503).json({ message: "Database not connected" });
    }
    const result = await postComments.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Comments Error:", error);
    log("GET", "/comments", 500);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

app.get("/showcomments/:doctorId", async (req: Request, res: Response) => {
  log("GET", `/showcomments/${req.params.doctorId}`);
  try {
    let doctorId = req.params.doctorId;
    if (Array.isArray(doctorId)) doctorId = doctorId[0];

    if (!doctorId || !ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    if (!isConnected || !postComments) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const result = await postComments.find({ doctorId }).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Show Comments Error:", error);
    log("GET", `/showcomments/${req.params.doctorId}`, 500);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

app.delete("/deleteDoctor/:id", async (req: Request, res: Response) => {
  log("DELETE", `/deleteDoctor/${req.params.id}`);
  try {
    let id = req.params.id;
    if (Array.isArray(id)) id = id[0];

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (!isConnected || !allDataCollection) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const result = await allDataCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Delete Doctor Error:", error);
    log("DELETE", `/deleteDoctor/${req.params.id}`, 500);
    res.status(500).json({ message: "Delete failed" });
  }
});

// ✅ নতুন যোগ করা হয়েছে — addDataColl থেকে delete করার জন্য
app.delete("/deleteMyHealthPost/:id", async (req: Request, res: Response) => {
  log("DELETE", `/deleteMyHealthPost/${req.params.id}`);
  try {
    let id = req.params.id;
    if (Array.isArray(id)) id = id[0];

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (!isConnected || !addDataColl) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const result = await addDataColl.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Delete MyHealthPost Error:", error);
    log("DELETE", `/deleteMyHealthPost/${req.params.id}`, 500);
    res.status(500).json({ message: "Delete failed" });
  }
});

app.delete("/deleteComment/:id", async (req: Request, res: Response) => {
  log("DELETE", `/deleteComment/${req.params.id}`);
  try {
    let id = req.params.id;
    if (Array.isArray(id)) id = id[0];

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    if (!isConnected || !postComments) {
      return res.status(503).json({ message: "Database not connected" });
    }

    const result = await postComments.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Comment not found this" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Delete Comment Error:", error);
    log("DELETE", `/deleteComment/${req.params.id}`, 500);
    res.status(500).json({ message: "Delete failed" });
  }
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

const gracefulShutdown = async () => {
  console.log("\nGraceful shutdown initiated...");
  await closeDB();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

async function startServer() {
  if (process.env.VERCEL !== "1") {
    try {
      console.log(`Environment: ${NODE_ENV}`);
      console.log("Connecting to MongoDB...");
      await connectDB();
      console.log("MongoDB Connected & Server Ready");
    } catch (error) {
      console.error("Server Start Failed:", error);
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;