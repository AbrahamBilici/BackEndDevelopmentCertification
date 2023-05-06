require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser'); // my code
const urlParser = require('url');  // my code
const dns = require('dns');   // my code


const { url } = require('inspector');



let mongoose = require('mongoose');  // my code
mongoose.connect(process.env.MONGO_URI);  // my code
const { MongoClient } = require('mongodb'); // my code
const client = new MongoClient(process.env.MONGO_URI); //my code
const db = client.db("url_shortner"); // my code
const urls = db.collection("urls_collection"); // my code




// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true })); // mycode


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});


// my code 

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  const dnsLookUp = dns.lookup(urlParser.parse(url).hostname, async (error, address) => {

    if (!address) {
      res.json({ error: "invalid url" })
    } else {

      const urlCount = await urls.countDocuments({});

      const urlDocument = {
        url,
        short_url: urlCount
      };
      const result = await urls.insertOne(urlDocument);
      res.json({ original_url: url, short_url: urlCount })

    }
  })

});


app.get("/api/shorturl/:short_url", async (req, res) => {
  const shortUrl = req.params.short_url;
  const urlDocument = await urls.findOne({ short_url: +shortUrl });
  res.redirect(urlDocument.url)
})