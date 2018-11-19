const feed = require('modules/feed/feed');
const userFeed = require('modules/feed/userFeed');
const personalFeed = require('modules/feed/personalFeed');

module.exports = app => {
  app.post('/feed', feed);
  app.post('/userFeed', userFeed);
  app.post('/personalFeed', personalFeed);
};
