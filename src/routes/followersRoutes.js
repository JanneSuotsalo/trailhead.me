const follow = require('modules/followers/follow');

module.exports = app => {
  app.post('/followers', follow);
};
