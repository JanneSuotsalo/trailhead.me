const create = require('modules/comment/create');
const remove = require('modules/comment/remove');
const list = require('modules/comment/list');
const { authenticated } = require('modules/util');

module.exports = app => {
  app.post('/:username/:post/comment', authenticated, create);
  app.delete('/:username/:post/comment/:comment', authenticated, remove);

  app.post('/:username/:post/comment/list', list.post);
  app.get('/:username/:post/comment/list', list.get);
};
