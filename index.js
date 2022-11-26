const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
require('dotenv').config();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vekfpge.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('sisBuySell').collection('categoryOptions');
        const bookingsCollection = client.db('sisBuySell').collection('bookings');

        app.get('/categories', async (req, res) => {
            let query = {};
            if (req.query.category) {
                query = {
                    category: req.query.category
                }
            }
            const options = await categoriesCollection.find(query).toArray()
            res.send(options)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body
            console.log(booking)
            const result = await bookingsCollection.insertOne(booking)
            res.send(result);
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings)
        })



    }
    finally {

    }
}

run().catch(error => console.error(error))






app.get('/', (req, res) => {
    res.send('SIS Buy-Sell API Running')
})

app.listen(port, () => {
    console.log(`SIS Buy-Sell Server Running on port ${port}`)
})