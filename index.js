const express = require('express');
const app = express();
const port = 3000;

// Load & apply all routes
const routes = require('routes');
routes.forEach(route => {
  route(app);
});

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
