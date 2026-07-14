// import express from "express";
// import cors from "cors";
// import { MongoClient } from 'mongodb';
// import dotenv from "dotenv";
// import { ObjectId } from "mongodb";
// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// const uri = process.env.MONGODB_URL;
// if (!uri) {
//   throw new Error("MONGODB_URI environment variable এ সেট করা নেই");
// }

// const client = new MongoClient(uri);
// let allDataCollection: any;
// let addDataColl: any;
// let userColl:any
// let postComments:any
// export async function connectToMongoDB() {
//   try {
//     await client.connect();
//     const database = client.db("medicare_hub");
//     allDataCollection = database.collection("allDatas");
//     addDataColl = database.collection("addDataColl");
//     userColl=database.collection("usercoll")
//     postComments=database.collection("postComments")

//     console.log("✅ MongoDB Connected!!!!!!!!!!!!!!!");
//     return { client, database, allDataCollection };
//   } catch (err) {
//     console.error("❌ MongoDB connection failed:", err);
//     process.exit(1); // কানেকশন না হলে সার্ভার বন্ধ করে দিন
//   }
// }

// export async function disconnectFromMongoDB() {
//   // await client.close();
// }

// app.get("/", (req, res) => {
//   res.send("MediCare Hub Server Running 🚀");
// });


// app.post("/register",async(req,res)=>{
//   const data=req.body
//   const result=await userColl.insertOne(data)
//   res.send(result)
// })

// app.get("/alldata",async(req,res)=>{

//   const result=await allDataCollection.find().toArray()
//   res.send(result)
// })

// app.get("/allLimitData/",async (req,res)=>{
//   const result=await allDataCollection.find().limit(8).toArray()
//   res.send(result)
// })
// app.get("/alldata/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("ID:", id);

//     const result = await allDataCollection.findOne({
//       _id: new ObjectId(id),
//     });

//     console.log("RESULT:", result);

//     res.json(result);
//   } catch (error) {


//   }
// });

// app.post("/addHealthPost",async(req,res)=>{

//   const data=req.body
//   const result=await addDataColl.insertOne(data)
//   res.send(result)
          
// })

// app.get("/myhealth-posts",async(req,res)=>{
//   const email=req.query.email

//   const result=await addDataColl.find({email}).toArray()
//   res.send(result)
// })


// app.post('/postscoments',async (req,res)=>{
//   const query=req.body 

//   const result=await postComments.insertOne(query)
//   res.send(result)
// })

//  app.get("/comments",async(req,res)=>{
//   const result=await postComments.find().toArray()
//   res.send(result)
//  })
//  app.get("/showcomments/:doctorId",async(req,res)=>{
//   const {doctorId} = req.params 
//   console.log("doctorId",doctorId)
//   const result=await postComments.find({ doctorId}).toArray()
//   res.send(result)
//  })

// // const PORT = process.env.PORT || 5000;

// // // আগে DB কানেক্ট করুন, তারপর সার্ভার চালু করুন
// // connectToMongoDB().then(() => {
// //   app.listen(PORT, () => {
// //     console.log(`Server running on http://localhost:${PORT}`);
// //   });
// // });

// const PORT = process.env.PORT || 5000;
// connectToMongoDB(); 

// export default app; 






import express from "express";

import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
 const cors = require('cors');
app.use(cors({
  origin: 'https://medicare-hub-client.vercel.app',
  credentials: true,
}));

const uri = process.env.MONGODB_URL;
if (!uri) {
  throw new Error("MONGODB_URL environment variable এ সেট করা নেই");
}

const client = new MongoClient(uri);

let allDataCollection: any;
let addDataColl: any;
let userColl: any;
let postComments: any;

// connection promise cache করে রাখা হচ্ছে যাতে বারবার connect না হয়
let connectionPromise: Promise<void> | null = null;

async function ensureConnected() {
  if (!connectionPromise) {
    connectionPromise = client.connect().then(() => {
      const database = client.db("medicare_hub");
      allDataCollection = database.collection("allDatas");
      addDataColl = database.collection("addDataColl");
      userColl = database.collection("usercoll");
      postComments = database.collection("postComments");
      console.log("✅ MongoDB Connected!!!!!!!!!!!!!!!");
    }).catch((err) => {
      connectionPromise = null; // fail হলে retry করার সুযোগ রাখা
      console.error("❌ MongoDB connection failed:", err);
      throw err;
    });
  }
  return connectionPromise;
}

// প্রতিটা request এর আগে connection নিশ্চিত করা হচ্ছে
app.use(async (req, res, next) => {
  try {
    await ensureConnected();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.send("MediCare Hub Server Running 🚀");
});

app.post("/register", async (req, res) => {
  try {
    const data = req.body;
    const result = await userColl.insertOne(data);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to register" });
  }
});

app.get("/alldata", async (req, res) => {
  try {
    const result = await allDataCollection.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/allLimitData", async (req, res) => {
  try {
    const result = await allDataCollection.find().limit(8).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/alldata/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await allDataCollection.findOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

app.post("/addHealthPost", async (req, res) => {
  try {
    const data = req.body;
    const result = await addDataColl.insertOne(data);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to add post" });
  }
});

app.get("/myhealth-posts", async (req, res) => {
  try {
    const email = req.query.email;
    const result = await addDataColl.find({ email }).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.post("/postscoments", async (req, res) => {
  try {
    const query = req.body;
    const result = await postComments.insertOne(query);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to post comment" });
  }
});

app.get("/comments", async (req, res) => {
  try {
    const result = await postComments.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.get("/showcomments/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await postComments.find({ doctorId }).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  connectToMongoDB2(); // নিচে explain করা
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

async function connectToMongoDB2() {
  await ensureConnected();
}

export default app;