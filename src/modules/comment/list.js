const { request } = require('modules/util');
const ID = require('modules/id');

const commentList = async (trx, { post }) => {
  // Convert hash id onto a numerical one
  const postID = ID.post.decode(post)[0];
  if (!postID) {
    return {
      status: 'not found',
      error: 'Post does not exist',
    };
  }

  // Find the post
  const [[posts]] = await trx.execute(
    `SELECT postID FROM post WHERE postID = ?`,
    [postID]
  );

  // Check if the post exists
  if (!posts) {
    return {
      status: 'forbidden',
      error: 'Post does not exist',
    };
  }

  // Find all the comments of a post
  const [result] = await trx.execute(
    `SELECT 
    comment.commentID,
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

  // Convert comment's numerical id to a hash id
  const list = result.map(x => ({
    ...x,
    commentID: ID.comment.encode(Number(x.commentID)),
    postID: ID.post.encode(Number(x.postID)),
  }));

  return { status: 'ok', list };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  return await commentList(trx, req.params);
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await commentList(trx, req.params);

  res.render('comments', {
    list: status.list,
  });
});

module.exports = {
  post,
  get,
};
