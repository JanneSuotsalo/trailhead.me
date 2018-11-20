const joi = require('joi');
const { request } = require('modules/util');
const emoji = require('./emoji');

// prettier-ignore
const schema = joi.object({
  emoji: joi.string().allow(emoji.list).required()
});

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  // Check if user is logged in
  if (!req.session.isPopulated) {
    return {
      status: 'forbidden',
      error: 'Invalid session, please login again...',
    };
  }

  // Find the post
  const [[post]] = await trx.execute(
    `SELECT postID FROM post,user WHERE postID = ? AND user.userID = post.userID AND user.username = ?`,
    [req.params.postID, req.params.username]
  );

  // Check if the post exists
  if (!post) {
    return {
      status: 'forbidden',
      error: "Post doesn't exist",
    };
  }

  // Check if the user has already reacted to the post
  const [[react]] = await trx.execute(
    'SELECT COUNT(*) as "exists" FROM postReact WHERE userID = ? AND postID = ?;',
    [req.session.userID, req.params.postID]
  );

  if (react.exists) {
    return {
      status: 'forbidden',
      error: 'Already reacted to post...',
    };
  }

  // Create reaction
  await trx.execute(
    `INSERT INTO postReact (reactID, userID, postID) VALUES (?,?,?);`,
    [emoji.value[req.body.emoji], req.session.userID, req.params.postID]
  );

  return { status: 'ok' };
});
