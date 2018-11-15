const mysql = require('mysql2/promise');

let connection = null;

const connect = async () => {
  // Connect to the database
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
};

module.exports = {
  get connection() {
    return connection;
  },
  connect,
};
