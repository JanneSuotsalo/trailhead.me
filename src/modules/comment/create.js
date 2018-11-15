const joi = require('joi');
const { request } = require('modules/util');

// prettier-ignore
const schema = joi.object({
  postID: joi.number().integer().min(1).required(),
  text: joi.string().max(256).required()
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

  // Create a comment
  await trx.execute(
    `INSERT INTO comment (text, userID, postID) VALUES (?,?,?);`,
    [req.body.text, req.session.userID, req.body.postID]
  );

  return { status: 'ok' };
});
