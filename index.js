const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const app = express();

const db = require('modules/db');

require('dotenv').config();

app.use(bodyParser.json());

// Initialize the server
const init = async () => {
  try {
    // Connect to the database
    await db.connect();

    // Load & apply all routes
    const routes = require('routes');
    routes.forEach(route => {
      route(app);
    });

    // Start the server
    app.listen(process.env.PORT, () =>
      console.log(`Example app listening on port ${process.env.PORT}!`)
    );
  } catch (e) {
    throw ('Unable to start server', e);
  }
};

init();
