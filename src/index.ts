// // import express, { type Request, type Response, type NextFunction } from "express";
// // import cors from "cors";
// // import { MongoClient, ObjectId, type Collection } from "mongodb";
// // import dotenv from "dotenv";

// // dotenv.config();

// // const app = express();

// // app.use(express.json());
// // app.use(
// //   cors({
// //     origin: [
// //       "https://medicare-hub-client.vercel.app",
// //       "http://localhost:3000",
// //     ],
// //     credentials: true,
// //   })
// // );

// // const uri = process.env.MONGODB_URL;
// // if (!uri) {
// //   throw new Error("MONGODB_URL environment variable সেট করা নেই");
// // }

// // const client = new MongoClient(uri);

// // let allDataCollection: Collection;
// // let addDataColl: Collection;
// // let userColl: Collection;
// // let postComments: Collection;

// // // কানেকশন বারবার না হওয়ার জন্য promise ক্যাশ করা
// // let connectionPromise: Promise<void> | null = null;

// // async function ensureConnected(): Promise<void> {
// //   if (!connectionPromise) {
// //     connectionPromise = client
// //       .connect()
// //       .then(() => {
// //         const database = client.db("medicare_hub");
// //         allDataCollection = database.collection("allDatas");
// //         addDataColl = database.collection("addDataColl");
// //         userColl = database.collection("usercoll");
// //         postComments = database.collection("postComments");
// //         console.log("✅ MongoDB Connected");
// //       })
// //       .catch((err) => {
// //         connectionPromise = null; // fail হলে retry করার সুযোগ
// //         console.error("❌ MongoDB connection failed:", err);
// //         throw err;
// //       });
// //   }
// //   return connectionPromise;
// // }

// // // প্রতিটা request এর আগে DB কানেক্ট নিশ্চিত
// // app.use(async (_req: Request, res: Response, next: NextFunction) => {
// //   try {
// //     await ensureConnected();
// //     next();
// //   } catch {
// //     res.status(500).json({ error: "Database connection failed" });
// //   }
// // });

// // app.get("/", (_req: Request, res: Response) => {
// //   res.send("MediCare Hub Server Running 🚀");
// // });

// // // রেজিস্ট্রেশন
// // app.post("/register", async (req: Request, res: Response) => {
  
// //     const { email } = req.body; 
// //     console.log("email",email)


// //       const result= await userColl.findOne({ email });
// //    res.send(result) 
// // })



// // // সব ডাটা
// // app.get("/alldata", async (_req: Request, res: Response) => {
// //   try {
// //     const result = await allDataCollection.find().toArray();
// //     res.send(result);
// //   } catch {
// //     res.status(500).json({ error: "Failed to fetch data" });
// //   }
// // });

// // // লিমিটেড ডাটা (হোম পেজ)
// // app.get("/allLimitData", async (_req: Request, res: Response) => {
// //   try {
// //     const result = await allDataCollection.find().limit(8).toArray();
// //     res.send(result);
// //   } catch {
// //     res.status(500).json({ error: "Failed to fetch data" });
// //   }
// // });

// // // আইডি অনুযায়ী একটি ডাটা
// // app.get("/alldata/:id", async (req: Request, res: Response) => {
// //   try {
// //     const { id } = req.params;

// //     // ⚠️ বাগ ফিক্স: আগে req.params পুরোটাই পাঠানো হচ্ছিল, req.params.id নয়
// //     if (!ObjectId.isValid(id)) {
// //       return res.status(400).json({ error: "Invalid id format" });
// //     }

// //     const result = await allDataCollection.findOne({
// //       _id: new ObjectId(id),
// //     });

// //     if (!result) {
// //       return res.status(404).json({ error: "Item not found" });
// //     }

// //     res.json(result);
// //   } catch {
// //     res.status(500).json({ error: "Failed to fetch item" });
// //   }
// // });

// // // হেলথ পোস্ট যোগ
// // app.post("/addHealthPost", async (req: Request, res: Response) => {
// //   try {
// //     const result = await addDataColl.insertOne(req.body);
// //     res.status(201).send(result);
// //   } catch {
// //     res.status(500).json({ error: "Failed to add post" });
// //   }
// // });

// // // ইউজারের নিজের পোস্ট
// // app.get("/myhealth-posts", async (req: Request, res: Response) => {
// //   try {
// //     const email = req.query.email;
// //     if (!email || typeof email !== "string") {
// //       return res.status(400).json({ error: "email query required" });
// //     }
// //     const result = await addDataColl.find({ email }).toArray();
// //     res.send(result);
// //   } catch {
// //     res.status(500).json({ error: "Failed to fetch posts" });
// //   }
// // });

// // // কমেন্ট পোস্ট
// // app.post("/postscoments", async (req: Request, res: Response) => {
// //   try {
// //     const result = await postComments.insertOne(req.body);
// //     res.status(201).send(result);
// //   } catch {
// //     res.status(500).json({ error: "Failed to post comment" });
// //   }
// // });

// // // সব কমেন্ট
// // app.get("/comments", async (_req: Request, res: Response) => {
// //   try {
// //     const result = await postComments.find().toArray();
// //     res.send(result);
// //   } catch {
// //     res.status(500).json({ error: "Failed to fetch comments" });
// //   }
// // });

// // // ডাক্তার অনুযায়ী কমেন্ট
// // app.get("/showcomments/:doctorId", async (req: Request, res: Response) => {
// //   try {
// //     const { doctorId } = req.params;
// //     const result = await postComments.find({ doctorId }).toArray();
// //     res.send(result);
// //   } catch {
// //     res.status(500).json({ error: "Failed to fetch comments" });
// //   }
// // });

// // // 404 handler — অজানা রুটের জন্য
// // app.use((_req: Request, res: Response) => {
// //   res.status(404).json({ error: "Route not found" });
// // });

// // // শুধু লোকাল ডেভ-এ listen করবে (Vercel-এ করবে না)
// // if (process.env.NODE_ENV !== "production") {
// //   const PORT = process.env.PORT || 5000;
// //   app.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// //   });
// // }

// // export default app;

// import express, { type Request, type Response, type NextFunction } from "express";
// import cors from "cors";
// import { MongoClient, ObjectId, type Collection } from "mongodb";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(
//   cors({
//     origin: [
//       "https://medicare-hub-client.vercel.app",
//       "http://localhost:3000",
//     ],
//     credentials: true,
//   })
// );

// const uri = process.env.MONGODB_URL;
  
// const client = new MongoClient(uri, {
//   serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
// });


// let allDataCollection: Collection;
// let addDataColl: Collection;
// let userColl: Collection;
// let postComments: Collection;

// // কানেকশন বারবার না হওয়ার জন্য promise ক্যাশ করা
// let connectionPromise: Promise<void> | null = null;

// async function run(): Promise<void> {
//       try{ 
//         const database = client.db("medicare_hub");
//         allDataCollection = database.collection("allDatas");
//         addDataColl = database.collection("addDataColl");
//         userColl = database.collection("usercoll");
//         postComments = database.collection("postComments");
//         console.log("✅ MongoDB Connected");
//       })
//       .catch((err) => {
//         connectionPromise = null; // fail হলে retry করার সুযোগ
//         console.error("❌ MongoDB connection failed:", err);
//         throw err;
//       });
//   }
//   return connectionPromise;
// }

// // প্রতিটা request এর আগে DB কানেক্ট নিশ্চিত
// app.use(async (_req: Request, res: Response, next: NextFunction) => {
//   try {
    
//     next();
//   } catch {
//     res.status(500).json({ error: "Database connection failed" });
//   }
// });

// app.get("/", (_req: Request, res: Response) => {
//   res.send("MediCare Hub Server Running 🚀");
// });

// // রেজিস্ট্রেশন
// app.post("/register", async (req: Request, res: Response) => {
  
//     const { email } = req.body; 
//     console.log("email",email)


//       const result= await userColl.findOne({ email });
//    res.send(result) 
// })



// // সব ডাটা
// app.get("/alldata", async (_req: Request, res: Response) => {
//   try {
//     const result = await allDataCollection.find().toArray();
//     res.send(result);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

// // লিমিটেড ডাটা (হোম পেজ)
// app.get("/allLimitData", async (_req: Request, res: Response) => {
//   try {
//     const result = await allDataCollection.find().limit(8).toArray();
//     res.send(result);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

// // আইডি অনুযায়ী একটি ডাটা
// app.get("/alldata/:id", async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     // ⚠️ বাগ ফিক্স: আগে req.params পুরোটাই পাঠানো হচ্ছিল, req.params.id নয়
//     if (!ObjectId.isValid(id)) {
//       return res.status(400).json({ error: "Invalid id format" });
//     }

//     const result = await allDataCollection.findOne({
//       _id: new ObjectId(id),
//     });

//     if (!result) {
//       return res.status(404).json({ error: "Item not found" });
//     }

//     res.json(result);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch item" });
//   }
// });

// // হেলথ পোস্ট যোগ
// app.post("/addHealthPost", async (req: Request, res: Response) => {
//   try {
//     const result = await addDataColl.insertOne(req.body);
//     res.status(201).send(result);
//   } catch {
//     res.status(500).json({ error: "Failed to add post" });
//   }
// });

// // ইউজারের নিজের পোস্ট
// app.get("/myhealth-posts", async (req: Request, res: Response) => {
//   try {
//     const email = req.query.email;
//     if (!email || typeof email !== "string") {
//       return res.status(400).json({ error: "email query required" });
//     }
//     const result = await addDataColl.find({ email }).toArray();
//     res.send(result);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch posts" });
//   }
// });

// // কমেন্ট পোস্ট
// app.post("/postscoments", async (req: Request, res: Response) => {
//   try {
//     const result = await postComments.insertOne(req.body);
//     res.status(201).send(result);
//   } catch {
//     res.status(500).json({ error: "Failed to post comment" });
//   }
// });

// // সব কমেন্ট
// app.get("/comments", async (_req: Request, res: Response) => {
//   try {
//     const result = await postComments.find().toArray();
//     res.send(result);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch comments" });
//   }
// });

// // ডাক্তার অনুযায়ী কমেন্ট
// app.get("/showcomments/:doctorId", async (req: Request, res: Response) => {
//   try {
//     const { doctorId } = req.params;
//     const result = await postComments.find({ doctorId }).toArray();
//     res.send(result);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch comments" });
//   }
// });

// // 404 handler — অজানা রুটের জন্য
// app.use((_req: Request, res: Response) => {
//   res.status(404).json({ error: "Route not found" });
// });

// // শুধু লোকাল ডেভ-এ listen করবে (Vercel-এ করবে না)

//  app.listen(port, () => console.log(`Server running on port ${port}`));
//     console.log("Connected to MongoDB!!!");
//   } finally {}
// }
// run().catch(console.dir);


   











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

// Home
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 MediCare Hub Server Running");
});

// All Data
app.get("/alldata", async (_req: Request, res: Response) => {
  try {
    const result = await allDataCollection.find().toArray();
    res.json(result);
  } catch (error) {
  console.error("ALldata Error:", error);

  res.status(500).json({
    message: "Failed to fetch data",
    error: error instanceof Error ? error.message : String(error),
  });
}
});

// Single Data
app.get("/alldata/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const result = await allDataCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
});


app.get("/allLimitData", async (_req: Request, res: Response) => {
  try {
    const result = await allDataCollection.find().limit(8).toArray();
    res.send(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});











// Register
app.post("/register", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await userColl.findOne({ email });

    res.json(user);
  } catch {
    res.status(500).json({ message: "Registration Failed" });
  }
});

// Add Health Post
app.post("/addHealthPost", async (req: Request, res: Response) => {
  try {
    const result = await addDataColl.insertOne(req.body);
    res.status(201).json(result);
  } catch {
    res.status(500).json({ message: "Failed to add post" });
  }
});

// My Health Posts
app.get("/myhealth-posts", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;

    const result = await addDataColl.find({ email }).toArray();

    res.json(result);
  } catch {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// Add Comment
app.post("/postscoments", async (req: Request, res: Response) => {
  try {
    const result = await postComments.insertOne(req.body);

    res.status(201).json(result);
  } catch {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// All Comments
app.get("/comments", async (_req: Request, res: Response) => {
  try {
    const result = await postComments.find().toArray();

    res.json(result);
  } catch {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Doctor Comments
app.get("/showcomments/:doctorId", async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.params;

    const result = await postComments.find({ doctorId }).toArray();

    res.json(result);
  } catch {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// Connect DB and Start Local Server
async function start() {
  try {
    await connectDB();

    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error("Database Connection Error:", error);
  }
}

start();

export default app;