const createPost = require('modules/post/createPost');
const loadPost = require('modules/post/loadPost');
const { authenticated } = require('modules/util');

module.exports = app => {
  app.get('/post', authenticated, (req, res) =>
    res.render('editPost', { mapKey: process.env.MAP_KEY })
  );
  app.post('/post', authenticated, createPost);

  app.get('/:username/:post', loadPost.get);
};
