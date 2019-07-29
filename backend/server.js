const express = require('express');
const mongoose = require('mongoose');
const bodyPaser = require('body-parser');
const passport = require('passport');


const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Body parser middleware
app.use(bodyPaser.urlencoded({ extended: false }))
app.use(bodyPaser.json());


// DB Config

const db = require('./config/keys').mongoURI;

// Connect to MongoDB

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(`Couldn't conntect to mongo db: ${err}`));


// Passport middleware
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport) 


// Use routes

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
 