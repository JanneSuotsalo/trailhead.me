const { request } = require('modules/util');
const joi = require('joi');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

const feed = async (trx, { userID, page }) => {
  //Feed for posts by users the logged in user has followed

  const [posts] = await trx.execute(
    'SELECT * FROM post, follower WHERE follower.followerID = ? AND follower.userID = post.userID ORDER BY post.createdAt DESC LIMIT ?, ?;',
    [userID, Number(page) * 10, 10]
  );

  return { status: 'ok', posts };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  return await userFeed(trx, { ...req.body, ...req.params });
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await feed(trx, { ...(req.session || {}), page: 0 });

  res.render('profile', {
    user: req.session ? req.session.user : null,
    posts: status.posts,
  });
  return;
});

module.exports = {
  post,
  get,
};
