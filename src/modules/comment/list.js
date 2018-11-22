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
  const [result] = await trx.execute(
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

  // Convert numerical id to a hash id
  const list = result.map(x => ({
    ...x,
    commentID: ID.comment.encode(Number(x.commentID)),
  }));

  return { status: 'ok', list };
});
