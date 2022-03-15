const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const app = express()
app.use(bodyParser.json());
app.use(cors());

const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jvd1e.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const daysCollection = client.db("jibonHisab").collection("Days");

  // add days
  app.post('/addDay', (req, res) => {
      const days = req.body;
      daysCollection.insertOne(days)
      .then(result => {
          res.send(result.insertCount > 0)
      })
  })

  // filter data with user email
  app.get('/days/:email', (req, res) => {
    daysCollection.find({}).filter({ email: req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

   // Load Single day Data by id
   app.get('/day/:id', (req, res) => {
    daysCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, documents) => {
      res.send(documents[0]);
    })
  })

  // Read a single filtered day by User

  app.get('/single-day/:email/:resizeDate', (req, res) => {
    daysCollection.find({}).filter({email: req.params.email, resizeDate: req.params.resizeDate})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

    // update product

    app.put('/update-day/:id', async(req, res) => {
      const id = req.params.id;
      const day = req.body;
      const filter = {_id: ObjectId(id)};
      const options = {upsert: true};
      const updateDoc = {
        $set: {
          hadith: day.hadith,
          ayat: day.ayat,
          vulKaj: day.vulKaj,
          valoKaj: day.valoKaj,
          attoSomalocona: day.attoSomalocona
        },
      };
      const result = await daysCollection.updateOne(filter, updateDoc, options)
      res.json(result);
    })
  
});
app.get('/', (req, res) => {
    res.send('working. please continue');
})

app.listen(process.env.PORT || port);