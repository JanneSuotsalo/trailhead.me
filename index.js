const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const app = express();

const db = require('modules/db');

require('dotenv').config();

app.use(bodyParser.json());

// TODO: Should be replaced with a Redis session storage in the future when time is on our side
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY],
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  })
);

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
