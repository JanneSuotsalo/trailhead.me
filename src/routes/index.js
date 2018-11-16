const helloWorldRoutes = require('./helloWorldRoutes');
const userRoutes = require('./userRoutes');
const commentRoutes = require('./commentRoutes');
const feedRoutes = require('./feedRoutes');
const followersRoutes = require('./followersRoutes');

module.exports = [
  helloWorldRoutes,
  userRoutes,
  commentRoutes,
  followersRoutes,
  feedRoutes,
];
