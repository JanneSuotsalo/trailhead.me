const react = require('modules/postReact/createReact');
const removeReact = require('modules/postReact/removeReact');
const reactList = require('modules/postReact/reactList');
const { authenticated } = require('modules/util');

module.exports = app => {
  app.post('/:username/:post/react', authenticated, react);
  app.delete('/:username/:post/react', authenticated, removeReact);

  app.post('/:username/:post/react/list', reactList);
};
