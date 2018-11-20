module.exports = app => {
  app.get('/post', (req, res) => res.render('editPost'));
};
