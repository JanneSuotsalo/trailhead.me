const Hashids = require('hashids');
const post = new Hashids(process.env.POST_ID_KEY, 4);
const file = new Hashids(process.env.FILE_ID_KEY, 4);
const comment = new Hashids(process.env.COMMENT_ID_KEY, 4);

module.exports = {
  post,
  file,
  comment,
};
