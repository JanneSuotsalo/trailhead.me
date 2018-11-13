const { text } = require('modules/helloWorld');

module.exports = app => {
  app.get('/', (req, res) => {
    res.send(text);
  });
};
