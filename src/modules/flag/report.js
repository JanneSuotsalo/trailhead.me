const joi = require('joi');
const { request } = require('modules/util');
const ID = require('modules/id');
const { flagStateIDs } = require('modules/constants');

// prettier-ignore
const schema = joi.object({
    text: joi.string().max(256).required(),
    reasonTypeID: joi.number().integer().min(1).required(),
  });

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  // Convert hash id onto a numerical one
  const postID = ID.post.decode(req.params.post)[0];
  if (!postID) {
    return {
      status: 'not found',
      error: 'Post does not exist',
    };
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
    [postID]
  );

  // Check if the post exists
  if (!post) {
    return {
      status: 'forbidden',
      error: 'Post does not exist',
    };
  }

  // Check if the user has already flagged the post
  const [[flag]] = await trx.execute(
    'SELECT COUNT(*) as "exists" FROM flag WHERE userID = ? AND postID = ?;',
    [req.session.userID, postID]
  );

  if (flag.exists) {
    return {
      status: 'forbidden',
      error: 'You have already flagged the post...',
    };
  }

  // Create a flag
  await trx.execute(
    'INSERT INTO flag (userID, postID, reasonTypeID, reasonStateID, text) VALUES (?,?,?,?,?);',
    [
      req.session.userID,
      postID,
      req.body.reasonTypeID,
      flagStateIDs.PENDING,
      req.body.text,
    ]
  );

  return { status: 'ok' };
});
