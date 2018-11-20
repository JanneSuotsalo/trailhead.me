const { request } = require('modules/util');
const ID = require('modules/id');

module.exports = request(async (trx, req, res) => {
  // Check if user is logged in
  if (!req.session.isPopulated) {
    return {
      status: 'forbidden',
      error: 'Invalid session, please login again...',
    };
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
    `SELECT postID FROM post,user WHERE postID = ? AND user.userID = post.userID AND user.username = ?`,
    [postID, req.params.username]
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
    'SELECT userID FROM postReact WHERE userID = ? AND postID = ?;',
    [req.session.userID, postID]
  );

  if (!react) {
    return {
      status: 'forbidden',
      error: 'No reaction found...',
    };
  }

  // Delete reaction
  await trx.execute(`DELETE FROM postReact WHERE userID = ? AND postID = ?;`, [
    req.session.userID,
    postID,
  ]);

  return { status: 'ok' };
});
