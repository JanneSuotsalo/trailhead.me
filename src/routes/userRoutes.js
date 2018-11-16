const register = require('modules/user/register');
const login = require('modules/user/login');

module.exports = app => {
  app.post('/register', register);
  app.post('/login', login);

  app.get('/login', (req, res) => res.render('login'));
  app.get('/register', (req, res) => res.render('register'));
};
