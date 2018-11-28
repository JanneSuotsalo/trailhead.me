const Hashids = require('hashids');

const hash = process.env.HASH_KEY;
const post = new Hashids(`${hash}-post`, 4);
const file = new Hashids(`${hash}-file`, 4);
const comment = new Hashids(`${hash}-comment`, 4);
const location = new Hashids(`${hash}-location`, 4);

module.exports = {
  post,
  file,
  comment,
  location,
};
