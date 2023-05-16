const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// mycode 

let mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));




// until here

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false })) // mycode
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});




// my code
const { Schema } = mongoose;


const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  log: [{
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, required: false }
  }]


}, { versionKey: false });

const User = mongoose.model('User', userSchema);



// username


app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }


  try {
    const user = new User({ username });
    const savedUser = await user.save();
    res.json({
      username: savedUser.username,
      _id: savedUser._id
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' })
  }

})


app.get('/api/users', async (req, res) => {

  try {
    const users = await User.find({});
    res.json(users.map((user) => ({
      username: user.username,
      _id: user._id
    })))
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }




})

// add exercises


app.post('/api/users/:_id/exercises', async (req, res) => {


  try {
    const { _id } = req.params;
    let { description, duration, date } = req.body;


    if (!_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    if (isNaN(duration)) {
      throw new Error('Duration must be a number');
    }

    let user = await User.findById(_id);

    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }


    const exercise = {
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date(),

    };



    user.log.push(exercise);
    user.count = user.log.length;
    user = await user.save();





    res.json({
      _id: _id,
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),



    });



  } catch (err) {
    console.log(err);

    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }





})







// logs



app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const userId = req.params._id;

  try {

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    let log = user.log;



    if (from) {
      log = log.filter((exercise) => new Date(exercise.date) > new Date(from));
    }

    if (to) {
      log = log.filter((exercise) => new Date(exercise.date) < new Date(to));
    }

    if (limit) {
      log = log.slice(0, limit);
    }

    res.json({
      _id: user._id,
      username: user.username,
      count: user.count,
      log: log.map((exercise) => {

        return {
          description: exercise.description,
          duration: exercise.duration,
          date: (new Date(exercise.date)).toDateString()
        }
      }),
    });


  }



  catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }


})



// until here



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})