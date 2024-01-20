const app = require('./app');
const initDatabase = require('./db/init.db');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);


});