const register = require('modules/user/register');
const login = require('modules/user/login');

module.exports = app => {
  app.post('/register', register);
  app.post('/login', login);
};
