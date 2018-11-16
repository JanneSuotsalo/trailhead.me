const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const handlebars = require('express-handlebars');
const app = express();

const db = require('modules/db');

require('dotenv').config();

app.use(bodyParser.json());

// Register and configure the Handlebars template engine
app.engine(
  'hbs',
  handlebars({
    extname: '.hbs',
    defaultLayout: 'layout',
    layoutsDir: 'src/views',
    partialsDir: 'src/views/partials',
    helpers: {
      // Helper to allow layout "sections" in handlebars
      // NOTE: We have to use "function" here, otherwise the binding of "this" will be wrong!
      section: function(name, options) {
        if (!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      },
    },
  })
);

// Set Handlebars view directory
app.set('views', __dirname + '/src/views');

// Set Handlebars as the default view engine
app.set('view engine', 'hbs');

// TODO: Should be replaced with a Redis session storage in the future when time is on our side
app.use(
  cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY],
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  })
);

// Serve static files from "./dist"
app.use('/static', express.static('dist'));

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
