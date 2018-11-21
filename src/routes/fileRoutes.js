const multer = require('multer');
const { serve, recieve, filter } = require('modules/file');
const upload = multer({
  dest: __dirname + '../../../storage/temp',
  fileFilter: filter,
});

module.exports = app => {
  app.get('/file/:file', serve);
  app.get('/file/:file/:size', serve); // Serve with predefined image sizes
  app.get('/file/:file/:width/:height', serve); // Serve with custom thumbnail size
  app.post('/file', upload.array('list', 8), recieve);
};
