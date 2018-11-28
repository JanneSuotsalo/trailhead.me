const search = require('modules/search');

module.exports = app => {
  app.post('/search', search);
};
