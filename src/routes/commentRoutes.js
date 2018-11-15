const create = require('modules/comment/create');
const remove = require('modules/comment/remove');

module.exports = app => {
  app.post('/comment', create);
  app.delete('/comment', remove);
};
