const { request } = require('modules/util');
const ID = require('modules/id');
const { locationTypeIDs, fileStateIDs } = require('modules/constants');
const fs = require('fs');

const loadPost = async (trx, { post }) => {
  // Convert hash id onto a numerical one
  const postID = ID.post.decode(post)[0];
  if (!postID) {
    return {
      status: 'not found',
      error: 'Post does not exist',
    };
  }

  // Load the post
  const [[result]] = await trx.execute(
    'SELECT p.postID, p.text, username, p.createdAt FROM post as p, user WHERE p.postID = ? AND user.userID = p.userID',
    [postID]
  );

  const [image] = await trx.query(
    'SELECT pf.fileID, pf.postID FROM postFile as pf WHERE pf.postID = ?',
    [postID]
  );

  // Convert numerical id to a hash id
  const data = {
    ...result,
    postID: ID.post.encode(Number(result.postID)),
    media: image.map(y => ID.file.encode(y.fileID)),
  };

  return { status: 'ok', post: data };
};

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await loadPost(trx, req.params);

  res.render('post', {
    post: status.post,
  });
});

module.exports = {
  get,
};
