const follow = require('modules/followers/follow');
const unfollow = require('modules/followers/unfollow');
const { authenticated } = require('modules/util');

module.exports = app => {
  app.post('/:username/follow', authenticated, follow);
  app.delete('/:username/follow', authenticated, unfollow);
};
