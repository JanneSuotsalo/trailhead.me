const flag = require('modules/flag/report');

module.exports = app => {
  app.post('/:post/flag', flag);
};
