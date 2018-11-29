const joi = require('joi');
const { request } = require('modules/util');
const ID = require('modules/id');

// prettier-ignore
const schema = joi.object({
  text: joi.string().max(256).required()
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

  // Create a comment
  await trx.execute(
    `INSERT INTO comment (text, userID, postID) VALUES (?,?,?);`,
    [req.body.text, req.session.userID, postID]
  );

  return { status: 'ok' };
});
