const create = require('modules/comment/create');
const remove = require('modules/comment/remove');
const list = require('modules/comment/list');

module.exports = app => {
  app.post('/:username/:post/comment', create);
  app.post('/:username/:post/comment/list', list.post);
  app.delete('/:username/:post/comment/:comment', remove);

  app.get('/:username/:post/comment/list', list.get);
};
