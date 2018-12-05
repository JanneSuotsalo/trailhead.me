const { request } = require('modules/util');
const joi = require('joi');
const ID = require('modules/id');
const { feed } = require('modules/feed/feed');
const { locationTypeIDs } = require('modules/constants');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

const userFeed = async (trx, { username, page, userID }) => {
  const feedData = await feed(trx, { page, userID, filter: { username } });
  if (feedData.status !== 'ok') return feedData;

  // Load profile data
  const [[profileData]] = await trx.query(
    `SELECT
      u.userID,
      u.displayName, 
      u.username,
      u.bio,
      uf.fileID
      ${userID ? `,'following', f.followerID` : ''}
    FROM user u
    LEFT JOIN userFile uf ON uf.userID = u.userID
    ${
      userID
        ? 'LEFT JOIN follower f ON f.followerID = ? AND f.userID = u.userID'
        : ''
    }
    WHERE u.username = ?;`,
    [...(userID ? [userID] : []), username]
  );

  if (!profileData) return { status: 'not found', error: 'User was not found' };

  // Get the users collections
  const [collections] = await trx.query(
    `
    SELECT
      collectionID,
      name
    FROM
      collection
    WHERE
      userID = ?;
    `,
    [userID]
  );

  // Get the number of followers and the number of people the user is following
  let [[following]] = await trx.query(
    `SELECT COUNT (*) as "count"
    FROM follower f
    WHERE f.followerID = ?;`,
    [profileData.userID]
  );

  let [[followers]] = await trx.query(
    `SELECT COUNT (*) as "count"
    FROM follower f
    WHERE f.userID = ?;`,
    [profileData.userID]
  );

  profileData.follow = {
    status: !!Number(profileData.following),
    following: following.count,
    followers: followers.count,
  };

  profileData.profilePicture = ID.file.encode(profileData.fileID);

  profileData.collections = collections;

  profile = profileData;

  return { ...feedData, profile };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  return await userFeed(trx, {
    ...req.body,
    ...req.params,
    userID: req.session.userID,
  });
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await userFeed(trx, {
    ...req.params,
    page: 0,
    userID: req.session.userID,
  });

  res.render('profile', {
    posts: status.posts,
    profile: status.profile,
  });
});

module.exports = {
  post,
  get,
};
