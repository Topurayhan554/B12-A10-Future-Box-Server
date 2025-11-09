const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// mongoDB

// pawMart
// yQtgIzCXxqj9yY9o

const uri =
  "mongodb+srv://pawMart:yQtgIzCXxqj9yY9o@cluster5656.l9idbez.mongodb.net/?appName=Cluster5656";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("pawMart");
    const listingCollection = db.collection("listing");
    const petHeroesCollection = db.collection("petHeroes");

    // all listing
    app.get("/listing", async (req, res) => {
      const result = await listingCollection.find().toArray();
      res.send(result);
    });

    // recent listing

    app.get("/recent-listing", async (req, res) => {
      const result = await listingCollection
        .find()
        .sort({ date: "desc" })
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
