const create = require('modules/comment/create');
const remove = require('modules/comment/remove');
const list = require('modules/comment/list');

module.exports = app => {
  app.post('/comment', create);
  app.post('/comment/list', list);
  app.delete('/comment', remove);
};
