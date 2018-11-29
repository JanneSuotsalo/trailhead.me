const register = require('modules/user/register');
const login = require('modules/user/login');
const edit = require('modules/user/edit');

module.exports = app => {
  app.post('/register', register);
  app.post('/login', login);
  app.post('/editUser', edit);
  app.post('/logout', (req, res) => {
    if (req.session) req.session.destroy();
    return res.send({ status: 'ok' });
  });

  app.get('/login', (req, res) => res.render('login'));
  app.get('/register', (req, res) => res.render('register'));
  app.get('/editUser', (req, res) => res.render('editUser'));
  app.get('/logout', (req, res) => {
    if (req.session) req.session.destroy();
    return res.redirect('/');
  });
};
