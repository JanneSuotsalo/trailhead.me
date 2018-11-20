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

  // Find all the reactions of a post
  const [list] = await trx.execute(
    `SELECT 
    postReact.postID,
    postReact.reactID,
    postReact.userID,
    user.displayName,
    user.userName
    FROM 
    postReact,
    user
    WHERE 
    postReact.postID = ? AND user.userID = postReact.userID
    ORDER BY postReact.createdAt DESC;`,
    [postID]
  );

  return { status: 'ok', list };
});
