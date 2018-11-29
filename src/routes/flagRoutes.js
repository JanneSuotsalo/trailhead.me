const flag = require('modules/flag/postReport');
const { authenticated } = require('modules/util');

module.exports = app => {
  app.post('/:username/:post/flag', authenticated, flag.post);

  app.get('/:username/:post/flag', authenticated, flag.get);
};
