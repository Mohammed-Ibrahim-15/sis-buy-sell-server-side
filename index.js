const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express()

// middleware
app.use(cors());
app.use(express.json())

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vekfpge.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('sisBuySell').collection('categoryOptions');
        const bookingsCollection = client.db('sisBuySell').collection('bookings');
        const usersCollection = client.db('sisBuySell').collection('users');

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
            // console.log(booking)
            const result = await bookingsCollection.insertOne(booking)
            res.send(result);
        })

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { userEmail: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result);

        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
                return res.send({ accessToken: token })
            }

            res.status(403).send({ accessToken: '' })
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