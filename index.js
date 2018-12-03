const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const handlebars = require('express-handlebars');
const fs = require('fs');
const https = require('https');
const http = require('http');
const app = express();

const db = require('modules/db');
const locationFileTask = require('modules/location/locationFileTask');

require('dotenv').config();

let credentials = null;

try {
  credentials = {
    key: fs.readFileSync(__dirname + '/cert/private.key'),
    cert: fs.readFileSync(__dirname + '/cert/certificate.crt'),
    ca: fs.readFileSync(__dirname + '/cert/ca_bundle.crt'),
  };
} catch (e) {
  if (process.env.NODE_ENV !== 'development') {
    console.error('HTTPS credentials missing', e);
  }
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
      json: function(context) {
        return JSON.stringify(context);
      },
      // Used to transfer preloaded data to client in templates
      base64: function(context) {
        // Stringify object
        let output = JSON.stringify(context);
        // Encode unicode characters
        output = output.replace(
          /[\u007F-\uFFFF]/g,
          char => `\\u${('0000' + char.charCodeAt(0).toString(16)).substr(-4)}`
        );
        // Convert to base64
        output = Buffer.from(output).toString('base64');
        return output;
      },
    },
  })
);

// Set Handlebars view directory
app.set('views', __dirname + '/src/views');

// Set Handlebars as the default view engine
app.set('view engine', 'hbs');

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

    // Setup session management
    const sessionStore = new MySQLStore(
      {
        clearExpired: true,
        expiration: 365 * 24 * 60 * 60 * 1000, // 1 year
        schema: {
          tableName: 'session',
          columnNames: {
            session_id: 'sessionID',
            expires: 'expiresAt',
            data: 'data',
          },
        },
      },
      await db.connection()
    );

    app.use(
      session({
        key: 'sid',
        secret: process.env.COOKIE_KEY,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
      })
    );

    // Set session data to be used with the view engine
    app.use((req, res, next) => {
      res.locals.user = req.session && req.session.userID ? req.session : null;
      return next();
    });

    // Load & apply all routes
    const routes = require('routes');
    routes.forEach(route => {
      route(app);
    });

    // Start background tasks
    locationFileTask();

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
