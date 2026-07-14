import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { MongoClient, ObjectId, type Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://medicare-hub-client.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

const uri = process.env.MONGODB_URL;
if (!uri) {
  throw new Error("MONGODB_URL environment variable সেট করা নেই");
}

const client = new MongoClient(uri);

let allDataCollection: Collection;
let addDataColl: Collection;
let userColl: Collection;
let postComments: Collection;

// কানেকশন বারবার না হওয়ার জন্য promise ক্যাশ করা
let connectionPromise: Promise<void> | null = null;

async function ensureConnected(): Promise<void> {
  if (!connectionPromise) {
    connectionPromise = client
      .connect()
      .then(() => {
        const database = client.db("medicare_hub");
        allDataCollection = database.collection("allDatas");
        addDataColl = database.collection("addDataColl");
        userColl = database.collection("usercoll");
        postComments = database.collection("postComments");
        console.log("✅ MongoDB Connected");
      })
      .catch((err) => {
        connectionPromise = null; // fail হলে retry করার সুযোগ
        console.error("❌ MongoDB connection failed:", err);
        throw err;
      });
  }
  return connectionPromise;
}

// প্রতিটা request এর আগে DB কানেক্ট নিশ্চিত
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureConnected();
    next();
  } catch {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/", (_req: Request, res: Response) => {
  res.send("MediCare Hub Server Running 🚀");
});

// রেজিস্ট্রেশন
app.post("/register", async (req: Request, res: Response) => {
  try {
    const result = await userColl.insertOne(req.body);
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to register" });
  }
});

// সব ডাটা
app.get("/alldata", async (_req: Request, res: Response) => {
  try {
    const result = await allDataCollection.find().toArray();
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// লিমিটেড ডাটা (হোম পেজ)
app.get("/allLimitData", async (_req: Request, res: Response) => {
  try {
    const result = await allDataCollection.find().limit(8).toArray();
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// আইডি অনুযায়ী একটি ডাটা
app.get("/alldata/:id", async (req: Request, res: Response) => {
  try {
    const result = await allDataCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// হেলথ পোস্ট যোগ
app.post("/addHealthPost", async (req: Request, res: Response) => {
  try {
    const result = await addDataColl.insertOne(req.body);
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to add post" });
  }
});

// ইউজারের নিজের পোস্ট
app.get("/myhealth-posts", async (req: Request, res: Response) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ error: "email query required" });
    }
    const result = await addDataColl.find({ email }).toArray();
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// কমেন্ট পোস্ট
app.post("/postscoments", async (req: Request, res: Response) => {
  try {
    const result = await postComments.insertOne(req.body);
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to post comment" });
  }
});

// সব কমেন্ট
app.get("/comments", async (_req: Request, res: Response) => {
  try {
    const result = await postComments.find().toArray();
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ডাক্তার অনুযায়ী কমেন্ট
app.get("/showcomments/:doctorId", async (req: Request, res: Response) => {
  try {
    const result = await postComments
      .find({ doctorId: req.params.doctorId })
      .toArray();
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// শুধু লোকাল ডেভ-এ listen করবে (Vercel-এ করবে না)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;