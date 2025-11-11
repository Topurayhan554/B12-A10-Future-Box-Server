const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccount = require("./pawmart-petshop-firebase.json");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// mongoDB

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster5656.l9idbez.mongodb.net/?appName=Cluster5656`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// authorization token
const verifyToken = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res
      .status(401)
      .send({ message: "unauthorized access. Token not found!" });
  }

  const token = authorization.split(" ")[1];
  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    res.status(401).send({
      message: "unauthorized access",
    });
  }
};

async function run() {
  try {
    await client.connect();

    const db = client.db("pawMart");
    const listingCollection = db.collection("listing");
    const petHeroesCollection = db.collection("petHeroes");
    const orderCollection = db.collection("orders");
    // all listing
    app.get("/listing", async (req, res) => {
      const result = await listingCollection.find().toArray();
      res.send(result);
    });

    // see details

    app.get("/see-details/:id", verifyToken, async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);

      const result = await listingCollection.findOne({ _id: objectId });

      res.send({
        success: true,
        result,
      });
    });

    // post method
    app.post("/listing", async (req, res) => {
      const data = req.body;
      console.log(data);

      const result = await listingCollection.insertOne(data);
      res.send({
        success: true,
        result,
      });
    });

    // orders
    app.post("/orders", verifyToken, async (req, res) => {
      const ordersData = req.body;
      const id = req.params.id;

      const result = await orderCollection.insertOne(ordersData);

      res.send({
        success: true,
        result,
      });
    });

    // my listing
    app.get("/my-listing", verifyToken, async (req, res) => {
      const email = req.query.email;
      const result = await listingCollection.find({ email: email }).toArray();
      res.send(result);
    });

    // my orders
    app.get("/my-orders", verifyToken, async (req, res) => {
      const email = req.query.email;
      const result = await orderCollection
        .find({ buyerEmail: email })
        .toArray();
      res.send(result);
    });

    // recent listing

    app.get("/recent-listing", async (req, res) => {
      const result = await listingCollection
        .find()
        .sort({ date: 1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // petHeroes
    app.get("/pet-heroes", async (req, res) => {
      const result = await petHeroesCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
