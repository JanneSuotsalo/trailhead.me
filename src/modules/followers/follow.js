const joi = require('joi');
const { request } = require('modules/util');

// prettier-ignore
const schema = joi.object({
  userID: joi.number().integer().min(1).required(),
});

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  // Check if user is logged in
  if (!req.session.isPopulated) {
    return {
      status: 'forbidden',
      error: 'Invalid session, please login again...',
    };
  }

  // Find the user that the user is trying to follow
  const [[user]] = await trx.execute(
    `SELECT userID FROM user WHERE userID = ?`,
    [req.body.userID]
  );

  // Check if the user exists that the follower tries to follow
  if (!user) {
    return {
      status: 'availability error',
      error: "User doesn't exist",
    };
  }

  // Check that the user is not already following the other user

  // Start following
  await trx.execute(`INSERT INTO follower (followerID, userID) VALUES (?,?);`, [
    req.session.userID,
    req.body.userID,
  ]);

  return { status: 'ok' };
});
