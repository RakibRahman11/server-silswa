const express = require('express')
const app = express()
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000

const cors = require('cors')

const stripe = require("stripe")(process.env.STRIPE_SECRET);


app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xpttu.mongodb.net/${process.env.DB_USER}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("silswa_portal");
        const counselingCollection = database.collection("counseling");
        const refundCollection = database.collection("refund");
        const coursesCollection = database.collection("courses");
        const checkoutCollection = database.collection("checkout");
        const paymentCollection = database.collection("payment");

        // POST counseling appointment
        app.post('/counseling', async (req, res) => {
            const appointmentInfo = req.body
            const result = await counselingCollection.insertOne(appointmentInfo)
            res.json(result)
        })

        // POST refund request
        app.post('/refund', async (req, res) => {
            const refundInfo = req.body
            const result = await refundCollection.insertOne(refundInfo)
            res.json(result)
        })

        // POST refund request
        app.post('/checkout', async (req, res) => {
            const checkoutInfo = req.body
            const result = await checkoutCollection.insertOne(checkoutInfo)
            res.json(result)
        })

        // GET courses collection
        app.get('/courses', async (req, res) => {
            const cursor = coursesCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post("/create-payment-intent", async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ["card"]
            });
            res.json({ clientSecret: paymentIntent.client_secret });

        })
        app.put('/payment/:id', async (req, res) => {
            const id = req.params.id
            const payment = req.body
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    payment: payment
                }
            };
            const result = await paymentCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        app.get('/payment/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await paymentCollection.findOne(query)
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello silswa!')
})

app.listen(port, () => {
    console.log(`working port ${port}`)
})