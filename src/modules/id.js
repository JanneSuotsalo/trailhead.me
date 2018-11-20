const Hashids = require('hashids');
const post = new Hashids(process.env.POST_ID_KEY, 4);

module.exports = {
  post,
};
