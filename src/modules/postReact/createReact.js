const joi = require('joi');
const { request } = require('modules/util');
const emoji = require('./emoji');

// prettier-ignore
const schema = joi.object({
  postID: joi.number().integer().min(1).required(),
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
    `SELECT postID FROM post WHERE postID = ?`,
    [req.body.postID]
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
    [req.session.userID, req.body.postID]
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
    [emoji.value[req.body.emoji], req.session.userID, req.body.postID]
  );

  return { status: 'ok' };
});
