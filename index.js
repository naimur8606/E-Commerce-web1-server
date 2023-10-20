const express = require('express');
const cors = require("cors");
require('dotenv').config()

const port = process.env.PORT || 5000;

const app = express();


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kc6dmnx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allProducts = client.db("sobDokanderDB").collection("products");
    const categories = client.db("sobDokanderDB").collection("categories");

    app.get("/products", async (req, res) => {
      const cursor = allProducts.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await allProducts.insertOne(products);
      console.log(result)
      res.send(result)
    })

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const result = await allProducts.findOne(query);
      res.send(result)
    })

    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedProduct = req.body;

      const product = {
          $set: {
              name: updatedProduct.name,
              brand_name: updatedProduct.brand_name,
              category: updatedProduct.category,
              price: updatedProduct.price,
              rating: updatedProduct.rating,
              photo: updatedProduct.photo,
              description: updatedProduct.description
          }
      }

      const result = await allProducts.updateOne(filter, product, options);
      res.send(result);
  })

    app.get("/categories", async (req, res) => {
      const cursor = categories.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})