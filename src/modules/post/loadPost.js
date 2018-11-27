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
    `SELECT
      postID,
      locationID,
      text,
      post.createdAt,
      JSON_OBJECT(
        'username', username,
        'displayName', displayName
      ) as user
    FROM post, user
    WHERE postID = ? AND user.userID = post.userID`,
    [postID]
  );

  if (!result) {
    return {
      status: 'not found',
      error: 'Post does not exist',
    };
  }

  // Load post location
  const [[location]] = await trx.execute(
    `SELECT
      l.locationID,
      l.locationTypeID,
      l.name,
      l.address,
      lf.fileID
    FROM location l
    LEFT JOIN locationFile lf ON lf.locationID = l.locationID
    WHERE l.locationID = ?`,
    [result.locationID]
  );

  // Load all post media
  const [media] = await trx.query(
    'SELECT fileID FROM postFile WHERE postID = ?',
    [postID]
  );

  // Set the location icon
  let icon = 'map-marker';
  if (location.locationTypeID === locationTypeIDs.PARK) icon = 'nature-people';
  if (location.locationTypeID === locationTypeIDs.PEAK)
    icon = 'image-filter-hdr';
  if (location.locationTypeID === locationTypeIDs.ATTRACTION) icon = 'star';
  if (location.locationTypeID === locationTypeIDs.INFORMATION)
    icon = 'information';

  // Combine into one post object
  const data = {
    ...result,
    postID: ID.post.encode(Number(result.postID)), // Convert numerical id to a hash id
    user: JSON.parse(result.user),
    media: media.map(x => ID.file.encode(x.fileID)),
    location: {
      ...location,
      icon,
      fileID: location.fileID ? ID.file.encode(location.fileID) : null,
    },
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
