const { request } = require('modules/util');
const ID = require('modules/id');
const { locationTypeIDs, fileStateIDs } = require('modules/constants');
const fs = require('fs');
const emoji = require('modules/postReact/emoji');

const loadPost = async (trx, { post, userID }) => {
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
      p.postID,
      p.locationID,
      p.text,
      p.createdAt,
      JSON_OBJECT(
        'username', u.username,
        'displayName', u.displayName
        ${userID ? `,'following', f.followerID` : ''}
      ) as user
    FROM post p
    JOIN user u ON u.userID = p.userID
    ${
      userID
        ? 'LEFT JOIN follower f ON f.followerID = ? AND f.userID = p.userID'
        : ''
    }
    WHERE postID = ?`,
    [...(userID ? [userID] : []), postID]
  );

  if (!result) {
    return {
      status: 'not found',
      error: 'Post does not exist',
    };
  }

  // Load post reacts
  const [reacts] = await trx.execute(
    `SELECT
      reactID,
      COUNT(reactID) as amount
    FROM postReact
    WHERE postID = ?
    GROUP BY reactID
    ORDER BY amount
    LIMIT 5`,
    [postID]
  );

  // Load user react
  let userReact = null;
  if (userID && userID) {
    const [[react]] = await trx.execute(
      `SELECT reactID
      FROM postReact
      WHERE postID = ? AND userID = ?`,
      [postID, userID]
    );
    if (react) userReact = emoji.key[react.reactID];
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

  const user = JSON.parse(result.user);

  // Combine into one post object
  const data = {
    ...result,
    postID: ID.post.encode(Number(result.postID)), // Convert numerical id to a hash id
    user: {
      ...user,
      image: ID.file.encode(user.image),
      following: !!Number(user.following),
    },
    media: media.map(x => ID.file.encode(x.fileID)),
    reacts: reacts.map(x => ({ text: emoji.key[x.reactID], amount: x.amount })),
    location: {
      ...location,
      icon,
      fileID: location.fileID ? ID.file.encode(location.fileID) : null,
    },
    userReact,
  };

  return { status: 'ok', post: data };
};

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await loadPost(trx, { ...req.params, ...(req.session || {}) });

  res.render('post', {
    post: status.post,
  });
});

module.exports = {
  get,
};
