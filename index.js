require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const urlparser = require('url')
const dns = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) return console.log(err)
  console.log('Connected to MongoDB', 'Status:' + mongoose.connection.readyState)
});

const schema = new mongoose.Schema({url: String})
const Url = mongoose.model('Url', schema)

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl/', function(req, res) {
  console.log(req.body)
  const  bodyurl = req.body.url;

  const dnsCheck = dns.lookup(urlparser.parse(bodyurl).hostname, 
  (error, address) => {
    if(!address){
      res.json({ error: "Invalid URl" })
    }else {
      const url = new Url({ url: bodyurl })
      url.save()
      .then((doc) => {
        res.json({
          original_url: doc.url,
          short_url: doc._id
        })
      })
      .catch(err => {
        console.log(err)
      })
    console.log('dns', error)
    console.log('address', address)
    }
  })
  console.log('dnsCheck', dnsCheck)
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id
  Url.findById(id, (err, data) => {
    if(!data){
      res.json({error: 'Invalid URL'})
    }else {
      res.redirect(data.url)
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
