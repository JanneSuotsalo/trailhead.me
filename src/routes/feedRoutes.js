const feed = require('modules/feed/feed');

module.exports = app => {
  app.get('/feed', feed);
};