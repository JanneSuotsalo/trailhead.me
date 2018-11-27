const https = require('https');
const path = require('path');
const fs = require('fs');

const { transaction } = require('modules/util');
const fileModule = require('modules/file');

const root = path.join(__dirname, '../../../storage');

const loadGeoFile = () =>
  transaction(async trx => {
    const [list] = await trx.query(`
    SELECT
      l.locationID,
      l.coordinates
    FROM location l
    WHERE
      NOT EXISTS (SELECT fileID FROM locationFile lf WHERE lf.locationID = l.locationID)
    LIMIT 1
`);
    list.forEach(x => {
      console.log('Loading GEO file for location', x.locationID);

      const filePath = path.join(root, '/temp', `geo-${x.locationID}`);
      const stream = fs.createWriteStream(filePath);

      stream.on('finish', async () => {
        const fileID = await fileModule.process(trx, {
          mimetype: 'image/png',
          path: filePath,
          filename: `geo-${x.locationID}`,
          originalname: `geo-${x.locationID}`,
        });

        await trx.execute(
          `INSERT INTO locationFile (locationID, fileID) VALUES (?, ?)`,
          [x.locationID, fileID]
        );

        console.log(
          'Loading GEO file for location',
          x.locationID,
          'successfull!'
        );
      });

      const url = `https://trailhead-geo.herokuapp.com/${x.coordinates.x}/${
        x.coordinates.y
      }/14`;

      https
        .get(
          url,
          {
            headers: {
              Authorization: `Bearer ${process.env.GEO_KEY}`,
            },
          },
          response => response.pipe(stream)
        )
        .on('error', err => {
          console.error('Failed to get GEO image for location', x.locationID);
        });
    });
  });

module.exports = () => {
  setTimeout(loadGeoFile, 20000);
};
