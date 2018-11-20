const { request } = require('modules/util');
const joi = require('joi');
const ID = require('modules/id');

// prettier-ignore
const schema = joi.object({
  page: joi.number().integer().min(0).required()
});

module.exports = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  //Feed for anonymous users, ordered by date
  const [result] = await trx.execute(
    'SELECT p.postID, p.text, username, p.createdAt FROM post as p, user WHERE user.userID = p.userID ORDER BY createdAt DESC LIMIT ?, ?',
    [Number(req.body.page) * 10, 10]
  );

  // Convert numerical id to a hash id
  const posts = result.map(x => ({
    ...x,
    postID: ID.post.encode(Number(x.postID)),
  }));

  return { status: 'ok', posts };
});
