const react = require('modules/postReact/createReact');
//const removeReact = require('modules/postReact/removeReact');

module.exports = app => {
  app.post('/:username/:postID/react', react);
  //app.delete('/:username/:postID/react', removeReact);
};
