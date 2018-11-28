const { request } = require('modules/util');
const joi = require('joi');
const ID = require('modules/id');
const { locationTypeIDs } = require('modules/constants');

// prettier-ignore
const schema = joi.object({
  page: joi.number().integer().min(0).required()
});

const feed = async (trx, { page }) => {
  //Feed for anonymous users, ordered by date
  const [result] = await trx.execute(
    'SELECT p.postID, p.locationID, p.text, username, p.createdAt FROM post as p, user WHERE user.userID = p.userID ORDER BY createdAt DESC LIMIT ?, ?',
    [Number(page) * 10, 10],
    'SELECT f.filename, f.path FROM file as f, postFile as pf WHERE pf.fileID = f.fileID;'
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
      location: location
        ? {
            ...location,
            icon,
            fileID: location.fileID ? ID.file.encode(location.fileID) : null,
          }
        : null,
    };
  });

  return { status: 'ok', posts };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  return await feed(trx, req.body);
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await feed(trx, { page: 0 });

  res.render('index', {
    posts: status.posts,
  });
});

module.exports = {
  post,
  get,
};
