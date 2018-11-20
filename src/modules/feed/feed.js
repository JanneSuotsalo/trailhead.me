const { request } = require('modules/util');
const joi = require('joi');
const ID = require('modules/id');

// prettier-ignore
const schema = joi.object({
  page: joi.number().integer().min(0).required()
});

const feed = async (trx, { page }) => {
  //Feed for anonymous users, ordered by date
  const [result] = await trx.execute(
    'SELECT p.postID, p.text, username, p.createdAt FROM post as p, user WHERE user.userID = p.userID ORDER BY createdAt DESC LIMIT ?, ?',
    [Number(page) * 10, 10]
  );

  // Convert numerical id to a hash id
  const posts = result.map(x => ({
    ...x,
    postID: ID.post.encode(Number(x.postID)),
  }));

  return { status: 'ok', posts };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  return await feed(trx, req.body);
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await feed(trx, { page: 0 });

  res.render('index', {
    user: req.session.isPopulated ? req.session.user : null,
    posts: status.posts,
  });
});

module.exports = {
  post,
  get,
};
