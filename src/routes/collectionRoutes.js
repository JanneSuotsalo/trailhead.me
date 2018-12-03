const create = require('modules/collection/createCollection');
const removeCollection = require('modules/collection/removeCollection');
const add = require('modules/collection/addPost');
const removePost = require('modules/collection/removePost');
const { authenticated } = require('modules/util');

module.exports = app => {
  app.post('/:username/collection/:collection', authenticated, add);
  app.delete('/:username/collection/:collection', authenticated, removePost);

  app.post('/:username/collection', authenticated, create);
  app.delete('/:username/collection', authenticated, removeCollection);

  //app.get('/:username/collection/:collection', app.render('collection'));
};
