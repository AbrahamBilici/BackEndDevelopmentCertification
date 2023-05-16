var express = require('express');
var cors = require('cors');
require('dotenv').config()
const multer = require('multer'); // mycode

var app = express();

//my code
let mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



// until here

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// my code 
const { Schema } = mongoose;

const fileSchema = new Schema({
  name: String,
  type: String,
  size: Number
})

const File = mongoose.model("File", fileSchema);


app.post('/api/fileanalyse', upload.single('upfile'), async (req, res) => {
  try {
    const file = new File({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    });
    await file.save();
    res.json({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    })
  } catch (err) {
    console.log(err);
    res.status(500).send('Error uploading file.')
  }
})

// until here




const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
