const mysql = require('mysql2/promise');

let db = null;

/**
 * Connect to the database
 */
const connect = async () => {
  // Connect to the database
  db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });
};

module.exports = {
  // Grab a connection from the DB
  // NOTICE: This connection has to be returned to the pool!
  connection: async () => {
    return await db.getConnection();
  },
  get pool() {
    return db.connection;
  },
  connect,
};
