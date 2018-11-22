const { request } = require('modules/util');
const joi = require('joi');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

const userFeed = async (trx, { username, page }) => {
  const [posts] = await trx.execute(
    'SELECT * FROM post, user WHERE user.username = ? AND post.userID = user.userID AND user.userID = post.userID ORDER BY post.createdAt DESC LIMIT ?, ?;',
    [username, Number(page) * 10, 10]
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
  console.log('userfeed get');

  const status = await userFeed(trx, { ...req.params, page: 0 });

  res.render('profile', {
    user: req.session.isPopulated ? req.session.user : null,
    posts: status.posts,
  });
  return;
});

module.exports = {
  post,
  get,
};
