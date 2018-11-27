const { request } = require('modules/util');
const joi = require('joi');
const ID = require('modules/id');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

const userFeed = async (trx, { username, page }) => {
  const [result] = await trx.execute(
    'SELECT p.postID, p.text, username, p.createdAt FROM post as p, user WHERE user.username = ? AND p.userID = user.userID AND user.userID = p.userID ORDER BY p.createdAt DESC LIMIT ?, ?;',
    [username, Number(page) * 10, 10]
  );

  const [[profile]] = await trx.query(
    'SELECT user.displayName, userFile.fileID FROM user LEFT JOIN userFile ON user.username = ? AND userFile.userID = user.userID;',
    [username]
  );

  const [image] = await trx.query(
    'SELECT pf.fileID, pf.postID FROM postFile as pf WHERE pf.postID IN (?)',
    [result.map(x => x.postID)]
  );

  // Convert numerical id to a hash id
  const posts = result.map(x => ({
    ...x,
    postID: ID.post.encode(Number(x.postID)),
    media: image
      .filter(y => y.postID == x.postID)
      .map(y => ID.file.encode(y.fileID)),
  }));

  return { status: 'ok', posts, profile };
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
  const status = await userFeed(trx, { ...req.params, page: 0 });

  res.render('profile', {
    user: req.session.isPopulated ? req.session.user : null,
    posts: status.posts,
    username: req.params.username,
    fullName: status.profile.displayName,
    profilePicture: ID.file.encode(status.profile.fileID),
  });
  return;
});

module.exports = {
  post,
  get,
};
