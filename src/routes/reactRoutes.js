const react = require('modules/postReact/createReact');
const removeReact = require('modules/postReact/removeReact');
const reactList = require('modules/postReact/reactList');

module.exports = app => {
  app.post('/:username/:post/react', react);
  app.post('/:username/:post/react/list', reactList);
  app.delete('/:username/:post/react', removeReact);
};
