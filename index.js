const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const handlebars = require('express-handlebars');
const fs = require('fs');
const https = require('https');
const http = require('http');
const app = express();

const db = require('modules/db');

require('dotenv').config();

let credentials = null;

try {
  credentials = {
    key: fs.readFileSync(__dirname + '/cert/private.key'),
    cert: fs.readFileSync(__dirname + '/cert/certificate.crt'),
    ca: fs.readFileSync(__dirname + '/cert/ca_bundle.crt'),
  };
} catch (e) {
  console.error('HTTPS credentials missing', e);
}

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

// Redirect all HTTP requests to HTTPS
if (process.env.NODE_ENV !== 'development') {
  app.use((req, res, next) => {
    if (req.secure) return next();
    return res.redirect(`https://${req.headers.host}${req.url}`);
  });
}

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

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
    if (process.env.NODE_ENV === 'development') {
      httpServer.listen(process.env.PORT, () =>
        console.log(
          `Trailhead HTTP development server running on port ${
            process.env.PORT
          }`
        )
      );
    } else {
      httpServer.listen(80);
      httpsServer.listen(443, () =>
        console.log(`Trailhead HTTPS production server running`)
      );
    }
  } catch (e) {
    throw ('Unable to start server', e);
  }
};

init();
