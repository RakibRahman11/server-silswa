const express = require('express')
const app = express()
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000

const cors = require('cors')

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

    } finally {
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