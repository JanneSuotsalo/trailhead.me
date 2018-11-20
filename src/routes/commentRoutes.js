const create = require('modules/comment/create');
const remove = require('modules/comment/remove');
const list = require('modules/comment/list');

module.exports = app => {
  app.post('/:post/comment', create);
  app.post('/:post/comment/list', list);
  app.delete('/:post/comment', remove);
};
