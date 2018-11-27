const http = require('http');
const path = require('path');
const fs = require('fs');

const { transaction } = require('modules/util');
const fileModule = require('modules/file');

const root = path.join(__dirname, '../../../storage');

let lastTime = null;

/**
 * Helper to download a file in a promise
 * @param {object} location
 */
const downloadFilePromise = (location, filePath) =>
  new Promise((resolve, reject) => {
    const { x, y } = location.coordinates;
    const stream = fs.createWriteStream(filePath);

    stream.on('finish', resolve);
    stream.on('error', reject);

    const url = `http://geo.trailhead.me/${x}/${y}/14`;

    const options = {
      headers: {
        Authorization: `Bearer ${process.env.GEO_KEY}`,
      },
    };

    http
      .get(url, options, response => response.pipe(stream))
      .on('error', reject);
  });

/**
 * Loop to get background images for locations from geo.trailhead.me.
 * Getting one background image might take over 30 seconds, so it must be done in the background.
 *
 * Code for the background image generator running in Heroku can be found here:
 * https://github.com/Munkkeli/trailhead-geo
 */
const loadGeoFile = () =>
  transaction(async trx => {
    lastTime = Date.now();

    const [list] = await trx.query(`
      SELECT
        l.locationID,
        l.coordinates
      FROM location l
      WHERE
        NOT EXISTS (SELECT fileID FROM locationFile lf WHERE lf.locationID = l.locationID)
      LIMIT 4
    `);

    for (const location of list) {
      console.log('Loading GEO file for location', location.locationID);

      const fileName = `geo-${location.locationID}`;
      const filePath = path.join(root, '/temp', fileName);

      await downloadFilePromise(location, filePath);

      const fileID = await fileModule.process(trx, {
        mimetype: 'image/png',
        path: filePath,
        filename: fileName,
        originalname: fileName,
      });

      await trx.execute(
        `INSERT INTO locationFile (locationID, fileID) VALUES (?, ?)`,
        [location.locationID, fileID]
      );

      console.log(
        'Loading GEO file for location',
        location.locationID,
        'successfull!'
      );
    }

    lastTime = null;
  });

module.exports = () => {
  setInterval(() => {
    // If the last operation has finished, or more than 5 minutes has passed
    if (!lastTime || Date.now() - lastTime > 60000 * 5) loadGeoFile();
  }, 20000);
};
