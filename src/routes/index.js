const userRoutes = require('./userRoutes');
const commentRoutes = require('./commentRoutes');
const feedRoutes = require('./feedRoutes');
const followersRoutes = require('./followersRoutes');
const reactRoutes = require('./reactRoutes');
const postRoutes = require('./postRoutes');
const fileRoutes = require('./fileRoutes');
const flagRoutes = require('./flagRoutes');

module.exports = [
  userRoutes,
  commentRoutes,
  followersRoutes,
  reactRoutes,
  fileRoutes,
  flagRoutes,
  postRoutes,
  feedRoutes,
];
