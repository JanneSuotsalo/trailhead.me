const { request } = require('modules/util');
const ID = require('modules/id');
const { userTypeIDs } = require('modules/constants');

module.exports = request(async (trx, req, res) => {
  // Convert hash id onto a numerical one
  const postID = ID.post.decode(req.params.post)[0];
  if (!postID) {
    return {
      status: 'not found',
      error: 'Post does not exist',
    };
  }

  const commentID = ID.comment.decode(req.params.comment)[0];
  if (!commentID) {
    return {
      status: 'not found',
      error: 'Comment does not exist',
    };
  }

  // Find the comment that the user is trying to edit
  const [[comment]] = await trx.execute(
    `SELECT userID, commentID FROM comment WHERE commentID = ? and postID = ?`,
    [commentID, postID]
  );

  // Check if the comment exists
  if (!comment) {
    return {
      status: 'forbidden',
      error: 'Comment does not exist',
    };
  }

  // Is the comment user's comment
  if (
    comment.userID !== req.session.userID &&
    req.session.userTypeID !== userTypeIDs.ADMIN
  ) {
    return {
      status: 'forbidden',
      error: 'No right to remove comment',
    };
  }

  // Deletes comment
  await trx.execute(`DELETE FROM comment WHERE commentID = ?;`, [commentID]);

  return { status: 'ok' };
});
