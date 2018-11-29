const { request } = require('modules/util');
const joi = require('joi');
const ID = require('modules/id');

// prettier-ignore
const schema = joi.object({
  fileIDs: joi.array().items(joi.string().min(4).max(128).alphanum()).min(1).max(8),
  text: joi.string().min(1).max(255).required(),
    }).required();

module.exports = request(async (trx, req, res) => {
  //Select already existing profile picture
  const [profilePicture] = await trx.query(
    'SELECT fileID FROM userFile WHERE userID = ?',
    [req.session.userID]
  );

  const fileID = Number(ID.file.decode(req.body.fileIDs[0]));

  try {
    //If the user has a profile picture, update existing database record
    await trx.execute(
      'UPDATE userFile SET fileID = REPLACE(fileID, ?, ?) WHERE userID = ?;',
      [profilePicture[0].fileID, fileID, req.session.userID]
    );
  } catch (error) {
    //If the user doesn't have a profile picture, insert database record
    await trx.execute('INSERT INTO userFile (userID, fileID) VALUES (?, ?);', [
      req.session.userID,
      fileID,
    ]);
  }

  return { status: 'ok' };
});
