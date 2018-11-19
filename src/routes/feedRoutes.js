const feed = require('modules/feed/feed');
const userFeed = require('modules/feed/userFeed');
const personalFeed = require('modules/feed/personalFeed');

module.exports = app => {
  app.post('/feed', feed);
  app.post('/userFeed', userFeed);
  app.post('/personalFeed', personalFeed);

  app.get('/', async (req, res) => {
    const status = await feed.manual({ page: 0 });

    return res.render('index', {
      user: req.session.isPopulated ? req.session.user : null,
      posts: status.posts,
    });
  });
  app.get('/userFeed', (req, res) => res.render());
  app.get('/personalFeed', (req, res) => res.render());
};
