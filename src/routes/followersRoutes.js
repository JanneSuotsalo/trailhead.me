const follow = require('modules/followers/follow');
const unfollow = require('modules/followers/unfollow');

module.exports = app => {
  app.post('/:username/follow', follow);
  app.delete('/:username/follow', unfollow);
};
