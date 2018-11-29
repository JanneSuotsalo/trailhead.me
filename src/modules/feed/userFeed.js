const { request } = require('modules/util');
const joi = require('joi');
const ID = require('modules/id');
const { locationTypeIDs } = require('modules/constants');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

const userFeed = async (trx, { username, page }) => {
  /*const [result] = await trx.execute(
    'SELECT p.postID, p.text, username, p.createdAt FROM post as p, user WHERE user.username = ? AND p.userID = user.userID AND user.userID = p.userID ORDER BY p.createdAt DESC LIMIT ?, ?;',
    [username, Number(page) * 10, 10]
  );

  const [[profile]] = await trx.query(
    'SELECT user.displayName, userFile.fileID FROM user LEFT JOIN userFile ON user.username = ? AND userFile.userID = user.userID WHERE user.username = ?;',
    [username, username]
  );

  let posts = null;
  if (result && result.length) {
    const [image] = await trx.query(
      'SELECT pf.fileID, pf.postID FROM postFile as pf WHERE pf.postID IN (?)',
      [result.map(x => x.postID)]
    );

    // Convert numerical id to a hash id
    posts = result.map(x => ({
      ...x,
      postID: ID.post.encode(Number(x.postID)),
      media: image
        .filter(y => y.postID == x.postID)
        .map(y => ID.file.encode(y.fileID)),
    }));
  }
  */

  //Feed for anonymous users, ordered by date
  const [result] = await trx.execute(
    `SELECT
        p.postID,
        p.locationID,
        p.text,
        p.createdAt,
        JSON_OBJECT(
          'username', username,
          'displayName', displayName
        ) as user
      FROM post as p, user
      WHERE user.userID = p.userID AND
      user.username = ?
      ORDER BY createdAt
      DESC LIMIT ?, ?`,
    [username, Number(page) * 10, 10],
    'SELECT f.filename, f.path FROM file as f, postFile as pf WHERE pf.fileID = f.fileID;'
  );

  const [[profile]] = await trx.query(
    `SELECT 
        user.displayName, 
        userFile.fileID 
      FROM 
        user LEFT JOIN userFile 
      ON 
        user.username = ? AND 
        userFile.userID = user.userID 
      WHERE 
        user.username = ?;`,
    [username, username]
  );

  // Load post location
  const [locations] = await trx.query(
    `SELECT
        l.locationID,
        l.locationTypeID,
        l.name,
        l.address,
        lf.fileID
      FROM location l
      LEFT JOIN locationFile lf ON lf.locationID = l.locationID
      WHERE l.locationID IN (?)`,
    [result.map(x => x.locationID)]
  );

  const [image] = await trx.query(
    'SELECT pf.fileID, pf.postID FROM postFile as pf WHERE pf.postID IN (?)',
    [result.map(x => x.postID)]
  );

  // Convert numerical id to a hash id
  const posts = result.map(x => {
    const location = locations.find(y => x.locationID === y.locationID);
    const media = image
      .filter(y => y.postID == x.postID)
      .map(y => ID.file.encode(y.fileID));

    // Set the location icon
    let icon = 'map-marker';
    if (location) {
      if (location.locationTypeID === locationTypeIDs.PARK)
        icon = 'nature-people';
      if (location.locationTypeID === locationTypeIDs.PEAK)
        icon = 'image-filter-hdr';
      if (location.locationTypeID === locationTypeIDs.ATTRACTION) icon = 'star';
      if (location.locationTypeID === locationTypeIDs.INFORMATION)
        icon = 'information';
    }

    return {
      ...x,
      postID: ID.post.encode(Number(x.postID)),
      media,
      user: JSON.parse(x.user),
      location: location
        ? {
            ...location,
            icon,
            fileID: location.fileID ? ID.file.encode(location.fileID) : null,
          }
        : null,
    };
  });

  return { status: 'ok', posts, profile };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  return await userFeed(trx, { ...req.body, ...req.params });
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await userFeed(trx, { ...req.params, page: 0 });

  if (status.profile.fileID == null) {
    status.profile.fileID = Number(6);
  }

  if (req.session.username == req.params.username) {
    res.render('profile', {
      user: req.session.isPopulated ? req.session.user : null,
      posts: status.posts,
      username: req.params.username,
      fullName: status.profile.displayName,
      profilePicture: ID.file.encode(status.profile.fileID),
    });
  } else {
    res.render('user', {
      user: req.session.isPopulated ? req.session.user : null,
      posts: status.posts,
      username: req.params.username,
      fullName: status.profile.displayName,
      profilePicture: ID.file.encode(status.profile.fileID),
    });
  }
});

module.exports = {
  post,
  get,
};
