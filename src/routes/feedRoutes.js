const feed = require('modules/feed/feed');
const userFeed = require('modules/feed/userFeed');
const personalFeed = require('modules/feed/personalFeed');

module.exports = app => {
  app.post('/feed', feed.post);
  app.post('/:username', userFeed.post);
  app.post('/personalFeed', personalFeed);

  app.get('/', feed.get);
  app.get('/:username', userFeed.get);
  app.get('/personalFeed', (req, res) => res.render());
};
