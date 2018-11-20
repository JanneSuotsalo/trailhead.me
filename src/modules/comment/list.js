const joi = require('joi');
const { request } = require('modules/util');

// prettier-ignore
const schema = joi.object({
  postID: joi.number().integer().min(1).required()
});

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
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
      error: 'Post does not exist',
    };
  }

  // Find all the comments of a post
  const [list] = await trx.execute(
    `SELECT 
    comment.commentID,
    comment.userID,
    comment.postID,
    comment.text,
    comment.updatedAt,
    comment.createdAt,
    user.displayName,
    user.userName
    FROM 
    comment,
    user
    WHERE 
    comment.postID = ? AND user.userID = comment.userID
    ORDER BY comment.createdAt DESC;`,
    [req.body.postID]
  );

  return { status: 'ok', list };
});
