const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();

app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qq0tl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("stay-fit");
        const programsCollection = database.collection('programs');
        const usersCollection = database.collection('users');
        const bookingCollection = database.collection('booking');
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await usersCollection.findOne(query);
            let isAdmin = false;
            if (result?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //get all products
        app.get('/programs', async (req, res) => {
            const programs = await programsCollection.find({});
            const result = await programs.toArray();
            res.json(result);
        })
        //get single programs
        app.get('/programs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await programsCollection.findOne(query);
            res.json(result);
        })
        //get all orders
        app.get('/myBooking/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const cursor = await bookingCollection.find(query).toArray();
            res.json(cursor);
        })
        app.get('/myBooking', async (req, res) => {
            const result = await bookingCollection.find({}).toArray();
            res.json(result)
        })
        app.post('/addPrograms', async (req, res) => {
            const result = await programsCollection.insertOne(req.body)
            res.json(result);
        })
        //user information during booking confirm 
        app.post('/programBook', async (req, res) => {
            const result = await bookingCollection.insertOne(req.body);
            res.json(result);
        })

        app.put('/addUsers', async (req, res) => {
            const email = req.body.email;;
            const displayName = req.body.displayName;
            const filter = { email, displayName };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    email,
                    displayName
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        app.put('/addUsers/admin', async (req, res) => {
            const email = req.body.email;
            const filter = { email };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
        //status change to confirm
        app.put('/confirm/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: 'confirm'
                }
            }
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        app.delete('myBooking/:email', async (req, res) => {
            console.log(req.params.email);
        })
        app.delete('/bookingDelete/:id', async (req, res) => {
            const id = req.params.id;
            const result = await bookingCollection.deleteOne({ _id: ObjectId(id) });
            res.json(result);
        })
        app.delete('/manageAllPrograms/:id', async (req, res) => {
            const id = req.params.id;
            const result = await programsCollection.deleteOne({ _id: ObjectId(id) });
            res.json(result);
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('hello world sdlfjs');
});
app.listen(port, () => {
    console.log(port, 'port is running');
})