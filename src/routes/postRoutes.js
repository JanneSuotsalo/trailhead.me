const createPost = require('modules/post/createPost');
const { authenticated } = require('modules/util');

module.exports = app => {
  app.get('/post', authenticated, (req, res) =>
    res.render('editPost', { mapKey: process.env.MAP_KEY })
  );
  app.post('/post', authenticated, createPost);
};
