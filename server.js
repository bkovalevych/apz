const express = require('express');
const cors = require('cors');
const path = require('path');


const bodyParser = require('body-parser');
const dotenv = require('dotenv'); // .env - это файл, в котором можно хранить скрыиые переменные (ключ апи)
dotenv.config();
const app = express();
const mongoose = require('mongoose');
const port = process.env.PORT || 5000;
const assert = require('assert');
const fs = require('fs');
const https = require('https');
const host = '127.0.0.1';
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))



const rand = () => {
  return Math.floor(Math.random() * 40);
};


myPort.on('error', (err) => {
  console.error(err);
})


mongoose
  .connect(
    process.env.mongoURI, // mongodb://localhost:27017/имя_бд
    {useNewUrlParser: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

let Users = require('./routes/Users'); // создаешь js файл Users.js в папке routes (routes тоже создать)
let move_media = require('./routes/move_media');
let move_base = require('./routes/move_base');
const followers = require('./routes/followers');
const admin = require('./routes/admin');
const groupsM = require('./routes/groups');



app.use(express.static('public'))
app.use('/admin', admin);
app.use('/moderator', move_base);
app.use('/users', Users);
app.use('/move', move_media);
app.use('/followers', followers);
app.use('/groups', groupsM);

app.get('/get', (req, res) => {

    let dt = `83 ${rand()} ${rand()} 10\n`;
    myPort.write(dt, (err) => {
      if (err) return console.log('Error on write: ', err.message);
      console.log('message written')
    });
    res.send("ok");
});

app.listen( port, function() {
  console.log('Server is running on port: ' + port)
});
