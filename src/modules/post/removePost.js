const { request } = require('modules/util');
const ID = require('modules/id');
const { userTypeIDs } = require('modules/constants');

module.exports = request(async (trx, req, res) => {
  // Convert post's hash id onto a numerical one
  const postID = ID.post.decode(req.params.post)[0];
  if (!postID) {
    return {
      status: 'not found',
      error: 'Post does not exist',
    };
  }

  // Find the post that the user is trying to edit
  const [[post]] = await trx.execute(
    `SELECT userID, postID FROM post WHERE postID = ?`,
    [postID]
  );

  // Check if the post exists
  if (!post) {
    return {
      status: 'forbidden',
      error: 'Post does not exist',
    };
  }

  // Is the post user's post
  if (
    !(
      post.userID !== req.session.userID ||
      req.session.userTypeID !== userTypeIDs.ADMIN
    )
  ) {
    return {
      status: 'forbidden',
      error: 'No right to remove post',
    };
  }

  // Deletes post
  await trx.execute(`DELETE FROM post WHERE postID = ?;`, [postID]);

  return { status: 'ok' };
});
