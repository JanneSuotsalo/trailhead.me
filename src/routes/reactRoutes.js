const react = require('modules/postReact/createReact');

module.exports = app => {
  app.post('/postReact', react);
};
