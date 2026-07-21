// import express, { type Request, type Response } from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { MongoClient, ServerApiVersion, ObjectId, type Collection } from "mongodb";

// dotenv.config();

// const app = express();
// const PORT = Number(process.env.PORT) || 5000;

// app.use(express.json());
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "https://medicare-hub-client.vercel.app"],
//     credentials: true,
//   })
// );

// const uri = process.env.MONGODB_URL;
// if (!uri) {
//   throw new Error("MONGODB_URL is not defined");
// }

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// let allDataCollection: Collection;
// let addDataColl: Collection;
// let userColl: Collection;
// let postComments: Collection;

// app.get("/", (_req: Request, res: Response) => {
//   res.send("MediCare Hub Server Running");
// });

// app.get("/test", (_req: Request, res: Response) => {
//   res.json({ message: "Test Route Working" });
// });

// app.get("/alldata", async (_req: Request, res: Response) => {
//   try {
//     const result = await allDataCollection.find().toArray();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch data" });
//   }
// });

// app.get("/alldata/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     if (!ObjectId.isValid(id)) {
//       res.status(400).json({ message: "Invalid ID" });
//       return;
//     }

//     const result = await allDataCollection.findOne({ _id: new ObjectId(id) });
//     if (!result) {
//       res.status(404).json({ message: "Doctor not found" });
//       return;
//     }

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.get("/allLimitData", async (_req: Request, res: Response) => {
//   try {
//     const result = await allDataCollection.find().limit(8).toArray();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch data" });
//   }
// });

// app.post("/register", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       res.status(400).json({ message: "Email required" });
//       return;
//     }

//     const user = await userColl.findOne({ email });
//     res.json(user || { message: "User not found" });
//   } catch (error) {
//     res.status(500).json({ message: "Registration failed" });
//   }
// });

// app.post("/addHealthPost", async (req: Request, res: Response) => {
//   try {
//     const data = req.body;
//     const addResult = await addDataColl.insertOne(data);
//     const allDataResult = await allDataCollection.insertOne(data);

//     res.status(201).json({
//       addDataColl: addResult,
//       allDataCollection: allDataResult,
//       message: "Health post added successfully",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to add post" });
//   }
// });

// app.get("/myhealth-posts", async (req: Request, res: Response): Promise<void> => {
//   try {
//     const email = typeof req.query.email === "string" ? req.query.email : undefined;
//     if (!email) {
//       res.status(400).json({ message: "Email required" });
//       return;
//     }

//     const result = await addDataColl.find({ email }).toArray();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch posts" });
//   }
// });

// app.post("/postscoments", async (req: Request, res: Response) => {
//   try {
//     const result = await postComments.insertOne(req.body);
//     res.status(201).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to add comment" });
//   }
// });

// app.get("/comments", async (_req: Request, res: Response) => {
//   try {
//     const result = await postComments.find().toArray();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch comments" });
//   }
// });

// app.get("/showcomments/:doctorId", async (req: Request, res: Response) => {
//   try {
//     const result = await postComments
//       .find({ doctorId: req.params.doctorId })
//       .toArray();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch comments" });
//   }
// });

// app.delete("/deleteDoctor/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     if (!ObjectId.isValid(id)) {
//       res.status(400).json({ message: "Invalid ID" });
//       return;
//     }

//     const result = await allDataCollection.deleteOne({ _id: new ObjectId(id) });
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// app.delete("/deleteComment/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     if (!ObjectId.isValid(id)) {
//       res.status(400).json({ message: "Invalid ID" });
//       return;
//     }

//     const result = await postComments.deleteOne({ _id: new ObjectId(id) });
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(500).json({ message: "Delete failed" });
//   }
// });

// async function run() {
//   await client.connect();

//   const database = client.db("medicare_hub");
//   allDataCollection = database.collection("allDatas");
//   addDataColl = database.collection("addDataColl");
//   userColl = database.collection("usercoll");
//   postComments = database.collection("postComments");

//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// run().catch((error) => {
//   console.error("Server start failed:", error);
//   process.exit(1);
// });

// export default app;

import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId, type Collection } from "mongodb";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://medicare-hub-client.vercel.app"],
    credentials: true,
  })
);

const uri = process.env.MONGODB_URL;
if (!uri) {
  throw new Error("MONGODB_URL is not defined");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let allDataCollection: Collection;
let addDataColl: Collection;
let userColl: Collection;
let postComments: Collection;

let connectPromise: Promise<void> | null = null;

function connectDB(): Promise<void> {
  if (!connectPromise) {
    connectPromise = client.connect().then(() => {
      const database = client.db("medicare_hub");
      allDataCollection = database.collection("allDatas");
      addDataColl = database.collection("addDataColl");
      userColl = database.collection("usercoll");
      postComments = database.collection("postComments");
    });
  }
  return connectPromise;
}

app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.get("/", (_req: Request, res: Response) => {
  res.send("MediCare Hub Server Running");
});

app.get("/test", (_req: Request, res: Response) => {
  res.json({ message: "Test Route Working" });
});

app.get("/alldata", async (_req: Request, res: Response) => {
  try {
    const result = await allDataCollection.find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data" });
  }
});

app.get("/alldata/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    const result = await allDataCollection.findOne({ _id: new ObjectId(id) });
    if (!result) {
      res.status(404).json({ message: "Doctor not found" });
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/allLimitData", async (_req: Request, res: Response) => {
  try {
    const result = await allDataCollection.find().limit(8).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data" });
  }
});

app.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email required" });
      return;
    }

    const user = await userColl.findOne({ email });
    res.json(user || { message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/addHealthPost", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const addResult = await addDataColl.insertOne(data);
    const allDataResult = await allDataCollection.insertOne(data);

    res.status(201).json({
      addDataColl: addResult,
      allDataCollection: allDataResult,
      message: "Health post added successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add post" });
  }
});

app.get("/myhealth-posts", async (req: Request, res: Response): Promise<void> => {
  try {
    const email = typeof req.query.email === "string" ? req.query.email : undefined;
    if (!email) {
      res.status(400).json({ message: "Email required" });
      return;
    }

    const result = await addDataColl.find({ email }).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

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
    const result = await postComments
      .find({ doctorId: req.params.doctorId })
      .toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

app.delete("/deleteDoctor/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    const result = await allDataCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

app.delete("/deleteComment/:id", async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    const result = await postComments.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

if (process.env.VERCEL !== "1") {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server start failed:", error);
      process.exit(1);
    });
}

export default app;