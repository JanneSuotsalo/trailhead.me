const joi = require('joi');
const { request } = require('modules/util');
const ID = require('modules/id');

module.exports = request(async (trx, req, res) => {
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
    [postID]
  );

  return { status: 'ok', list };
});
