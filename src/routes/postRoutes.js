module.exports = app => {
  app.get('/post', (req, res) => {
    console.log('post get');
    res.render('editPost');
  });
};
