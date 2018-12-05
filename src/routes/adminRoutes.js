const adminFeed = require('modules/feed/adminFeed');
const { administrator } = require('modules/util');

module.exports = app => {
  app.post('/admin', administrator, adminFeed.post);
  app.get('/admin', administrator, adminFeed.get);
};
