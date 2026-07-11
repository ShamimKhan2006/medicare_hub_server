import express from "express";
import cors from "cors";
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URL;
if (!uri) {
  throw new Error("MONGODB_URI environment variable এ সেট করা নেই");
}

const client = new MongoClient(uri);
let allDataCollection: any;

export async function connectToMongoDB() {
  try {
    await client.connect();
    const database = client.db("medicare_hub");
    allDataCollection = database.collection("allDatas");
    console.log("✅ MongoDB Connected!!!!!!!!!!!!!!!");
    return { client, database, allDataCollection };
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // কানেকশন না হলে সার্ভার বন্ধ করে দিন
  }
}

export async function disconnectFromMongoDB() {
  await client.close();
}

app.get("/", (req, res) => {
  res.send("MediCare Hub Server Running 🚀");
});


app.get("/alldata",async(req,res)=>{

  const result=await allDataCollection.find().toArray()
  res.send(result)
})

app.get("/alldata/:id",async(req,res)=>{
   const {id}=req.params
   const result=await allDataCollection.find({})
})
const PORT = process.env.PORT || 5000;

// আগে DB কানেক্ট করুন, তারপর সার্ভার চালু করুন
connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});