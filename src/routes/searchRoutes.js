const searchList = require('modules/search/searchList');
const searchPosts = require('modules/search/searchPosts');

module.exports = app => {
  app.get('/search/:query', searchPosts.get);
  app.post('/search/:query', searchPosts.post);
  app.post('/search/:filter/:query', searchPosts.post);
  app.get('/search/:filter/:query', searchPosts.get);

  app.post('/search', searchList);
};
