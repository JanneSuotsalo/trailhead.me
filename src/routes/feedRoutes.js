const feed = require('modules/feed/feed');
const userFeed = require('modules/feed/userFeed');
const personalFeed = require('modules/feed/personalFeed');

module.exports = app => {
  app.post('/', feed.post);
  app.post('/feed', personalFeed.post);
  app.post('/:username', userFeed.post);

  app.get('/', feed.get);
  app.get('/feed', personalFeed.get);
  app.get('/:username', userFeed.get);
};
