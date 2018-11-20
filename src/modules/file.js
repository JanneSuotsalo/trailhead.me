const fs = require('fs');
const path = require('path');
const { request } = require('modules/util');
const { fileTypeIDs, fileStateIDs } = require('modules/constants');
const ID = require('modules/id');

const imageMimeTypes = ['image/jpeg', 'image/png'];
const videoMimeTypes = ['video/webm', 'video/mp4'];

const supportedMimeTypes = [...imageMimeTypes, ...videoMimeTypes];

const filter = (req, file, callback) => {
  if (supportedMimeTypes.includes(file.mimetype)) {
    console.log(file.mimetype);
    return callback(null, true);
  } else {
    console.error('Unsupported mime type:', file.mimetype);
  }
  return callback(null, false);
};

const stream = file => {
  const url = path.join(__dirname, '../../storage', file);
  const exists = fs.existsSync(url);
  if (!exists) return false;
  return fs.createReadStream(url);
};

const serve = request(async (trx, req, res) => {
  // Turn hash id into a numerical one
  const fileID = ID.file.decode(req.params.file)[0];
  if (!fileID) {
    return {
      status: 'not found',
      error: 'File not found',
    };
  }

  // Load the file, if exists
  const [[file]] = await trx.execute(
    `SELECT fileID, fileTypeID, fileStateID, filename, mimeType, path, updatedAt, createdAt
    FROM file WHERE fileID = ? AND fileStateID IN (?, ?)`,
    [fileID, fileStateIDs.TEMPORARY, fileStateIDs.PUBLIC]
  );

  if (!file) {
    return {
      status: 'not found',
      error: 'File not found',
    };
  }

  // Create a read stream
  const output = stream(
    (file.fileStateID === fileStateIDs.TEMPORARY ? 'temp/' : 'public/') +
      file.path
  );

  // Stream file to client
  res.setHeader('Content-Type', file.mimeType);
  output.pipe(res);
});

const recieve = request(async (trx, req, res) => {
  const list = req.files;

  if (!(list && list.length > 0)) {
    return {
      status: 'empty',
      error: 'File list was empty',
    };
  }

  const fileIDs = [];

  // Save info about each file into DB
  for (const file of list) {
    let fileTypeID = null;
    if (imageMimeTypes.includes(file.mimetype)) fileTypeID = fileTypeIDs.IMAGE;
    if (videoMimeTypes.includes(file.mimetype)) fileTypeID = fileTypeIDs.VIDEO;

    await trx.execute(
      `INSERT INTO file (fileTypeID, fileStateID, filename, mimeType, path) VALUES (?, ?, ?, ?, ?);`,
      [
        fileTypeID,
        fileStateIDs.TEMPORARY,
        file.originalname,
        file.mimetype,
        file.filename,
      ]
    );

    const [[insert]] = await trx.query(
      `SELECT LAST_INSERT_ID() as id FROM file;`
    );

    fileIDs.push(ID.file.encode(insert.id));
  }

  return { status: 'ok', fileIDs };
});

module.exports = {
  serve,
  recieve,
  filter,
};

/*
  `fileID` INT AUTO_INCREMENT,
  `fileTypeID` TINYINT NOT NULL,
  `fileStateID` TINYINT NOT NULL,
  `filename` VARCHAR(256) NULL,
  `path` TEXT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
*/
