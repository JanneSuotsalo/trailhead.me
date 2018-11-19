const feed = require('modules/feed/feed');
const userFeed = require('modules/feed/userFeed');

module.exports = app => {
  app.post('/feed', feed);
  app.post('/userFeed', userFeed);
};
