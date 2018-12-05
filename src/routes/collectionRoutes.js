const createCollection = require('modules/collection/createCollection');
const removeCollection = require('modules/collection/removeCollection');
const addPost = require('modules/collection/addPost');
const removePost = require('modules/collection/removePost');
const collection = require('modules/collection/collectionFeed');
const userCollections = require('modules/collection/userCollections');
const { authenticated } = require('modules/util');

module.exports = app => {
  app.post('/:username/collection/:collection', authenticated, addPost);
  app.delete('/:username/collection/:collection', authenticated, removePost);

  app.post('/collection', authenticated, createCollection);
  app.delete('/collection', authenticated, removeCollection);

  app.get('/:username/collection/:collection', collection.get);
  app.get('/collection', userCollections);
};
