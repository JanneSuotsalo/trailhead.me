const userRoutes = require('./userRoutes');
const commentRoutes = require('./commentRoutes');
const feedRoutes = require('./feedRoutes');
const followersRoutes = require('./followersRoutes');
const reactRoutes = require('./reactRoutes');
const postRoutes = require('./postRoutes');
const fileRoutes = require('./fileRoutes');
const flagRoutes = require('./flagRoutes');
const searchRoutes = require('./searchRoutes');
const trendingRoutes = require('./trendingRoutes');
const collectionRoutes = require('./collectionRoutes');

module.exports = [
  userRoutes,
  commentRoutes,
  followersRoutes,
  reactRoutes,
  searchRoutes,
  trendingRoutes,
  fileRoutes,
  flagRoutes,
  postRoutes,
  feedRoutes,
  collectionRoutes,
];
