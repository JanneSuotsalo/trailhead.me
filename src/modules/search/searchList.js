const joi = require('joi');
const { request } = require('modules/util');
const { locationTypeIDs } = require('modules/constants');
const ID = require('modules/id');

// prettier-ignore
const schema = joi.object({
  query: joi.string().max(256).required(),
});

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  const text = req.body.query.trim();
  if (text.replace(/[#@]/g, '').length < 1) return { status: 'ok', list: [] };
  const query = `%${text}%`;

  // Find users with username and display name
  const [userList] = await trx.query(
    `SELECT username, displayName, fileID FROM user LEFT JOIN userFile USING(userID) WHERE username LIKE ? OR displayName LIKE ? LIMIT 3;`,
    [query.replace(/@/g, ''), query.replace(/@/g, '')]
  );

  // Find locations with name and address
  const [locationList] = await trx.query(
    `SELECT locationID, locationTypeID, name, address FROM location WHERE name LIKE ? OR address LIKE ? LIMIT 3;`,
    [query, query]
  );

  // Find tags
  const [tagList] = await trx.query(
    `SELECT
      t.text,
      COUNT(pt.tagID) as amount
    FROM tag t
    LEFT JOIN postTag as pt USING(tagID)
    WHERE text LIKE ?
    GROUP BY pt.tagID
    ORDER BY amount
    LIMIT 6;`,
    [query.replace(/#/g, '')]
  );

  const getLocationIcon = type => {
    icon = 'map-marker';
    if (type === locationTypeIDs.PARK) icon = 'nature-people';
    if (type === locationTypeIDs.PEAK) icon = 'image-filter-hdr';
    if (type === locationTypeIDs.ATTRACTION) icon = 'star';
    if (type === locationTypeIDs.INFORMATION) icon = 'information';
    return icon;
  };

  // Combine results and order them
  const list = [
    ...userList.map(x => ({ ...x, type: 'user' })),
    ...locationList.map(x => ({
      ...x,
      locationID: ID.location.encode(x.locationID),
      type: 'location',
      icon: getLocationIcon(x.locationTypeID),
    })),
    ...tagList.map(x => ({ ...x, type: 'tag' })),
  ];

  return { status: 'ok', list };
});
