const { request } = require('modules/util');
const { locationTypeIDs } = require('modules/constants');
const ID = require('modules/id');

module.exports = request(async (trx, req, res) => {
  // Find trending tags
  const [tagList] = await trx.query(`
    SELECT
      t.text,
      COUNT(pt.tagID) as amount
    FROM tag t
    LEFT JOIN postTag pt ON pt.tagID = t.tagID AND (pt.createdAt BETWEEN date_sub(now(), INTERVAL 1 WEEK) and now())
    GROUP BY pt.tagID
    ORDER BY amount DESC
    LIMIT 4;
  `);

  // Find trending locations
  const [locationList] = await trx.query(`
    SELECT
      l.locationID,
      l.locationTypeID,
      l.name,
      l.address,
      COUNT(p.postID) as amount
    FROM location l
    LEFT JOIN post p ON p.locationID = l.locationID AND (p.createdAt BETWEEN date_sub(now(), INTERVAL 1 WEEK) and now())
    GROUP BY l.locationID
    ORDER BY amount DESC
    LIMIT 4;
  `);

  // Combine results and order them
  const list = [
    ...locationList.map(x => ({
      ...x,
      locationID: ID.location.encode(x.locationID),
      type: 'location',
    })),
    ...tagList.map(x => ({ ...x, type: 'tag' })),
  ];

  return { status: 'ok', list };
});
