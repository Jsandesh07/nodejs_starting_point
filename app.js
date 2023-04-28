const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json;charset=UTF-8');
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const auth = require('./routes/auth');
app.use(constants.BASE_URI, auth);

app.all('*', (req, res, next) => {
  if (res.headersSent == false) {
    res.status(404).json({
      message: 'PAGE NOT FOUND',
    });
  } else {
    res.end();
  }
});

module.exports = app;
