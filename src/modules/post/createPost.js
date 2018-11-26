const joi = require('joi');
const { request } = require('modules/util');
const ID = require('modules/id');
const { locationTypeIDs, fileStateIDs } = require('modules/constants');
const fs = require('fs');

// prettier-ignore
const schema = joi.object({
  fileIDs: joi.array().items(joi.string().min(4).max(128).alphanum()).min(1).max(8),
  text: joi.string().min(1).max(1024).required(),
  location: joi.object({
    locationTypeID: joi.number().integer().valid(Object.values(locationTypeIDs)),
    uuid: joi.string().max(128).required(),
    name: joi.string().max(64).required(),
    address: joi.string().max(64).required(),
    coordinates: joi.object({
      lat: joi.string().max(32).required(),
      lon: joi.string().max(32).required(),
    }).required(),
  }),
});

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  // Check if this location exists in the database
  // TODO: The location should be calculated in the back-end, we should not trust front end
  const [[location]] = await trx.execute(
    `SELECT locationID FROM location WHERE uuid = ?`,
    [req.body.location.uuid]
  );

  let locationID = null;
  if (location && location.locationID) {
    locationID = location.locationID;
  } else {
    const locationData = {
      locationTypeID: req.body.location.locationTypeID,
      uuid: req.body.location.uuid,
      name: req.body.location.name,
      address: req.body.location.address,
      lat: req.body.location.coordinates.lat,
      lon: req.body.location.coordinates.lon,
    };

    // Create a new location
    await trx.query(
      `INSERT INTO location (locationTypeID, uuid, name, address, coordinates) VALUES (?, ?, ?, ?, POINT(?,?));`,
      Object.values(locationData)
    );

    // Get the new location ID
    const [[locationInsert]] = await trx.query(
      `SELECT LAST_INSERT_ID() as id FROM location;`
    );

    locationID = locationInsert.id;
  }

  const post = {
    userID: req.session.userID,
    locationID,
    text: req.body.text,
  };

  // Create the new post
  await trx.execute(
    `INSERT INTO post (userID, locationID, text) VALUES (?, ?, ?);`,
    Object.values(post)
  );

  // Get the new post ID
  const [[insert]] = await trx.query(
    `SELECT LAST_INSERT_ID() as id FROM post;`
  );

  // Add all uploaded files into the post
  for (const file of req.body.fileIDs) {
    const postFile = {
      postID: insert.id,
      fileID: ID.file.decode(file)[0],
    };

    // Add a file to the post
    await trx.execute(
      `INSERT INTO postFile (postID, fileID) VALUES (?, ?);`,
      Object.values(postFile)
    );

    // Set file as public
    await trx.execute(`UPDATE file SET fileStateID = ? WHERE fileID = ?;`, [
      fileStateIDs.PUBLIC,
      postFile.fileID,
    ]);
  }

  return { status: 'ok', postID: ID.post.encode(insert.id) };
});
