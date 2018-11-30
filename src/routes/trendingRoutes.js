const trending = require('modules/trending');

module.exports = app => {
  app.post('/trending', trending);
};
