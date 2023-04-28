const app = require('./app');
const dotenv = require('dotenv').config();

server = app.listen(process.env.HTTP_PORT || 8000, () => {
  console.log('Server is running on PORT ', process.env.HTTP_PORT || 8000);
});

// Handling Error.
process.on('uncaughtException', (err) => {
  console.log('e', err);
  console.log(`ERROR : ${err.message}`);
});

process.on('unhandledRejection', (err) => {
  console.log('er');
  console.log(`ERROR : ${err.message}`);
});
