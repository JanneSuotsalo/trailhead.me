const joi = require('joi');
const pw = require('./password');
const { request } = require('modules/util');

// prettier-ignore
const schema = joi.object({
  email: joi.string().email().max(256).required(),
  username: joi.string().alphanum().min(2).max(32).required(),
  password: joi.string().min(6).max(1024).required(), // TODO: Add validation for secure password
});

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  const user = {
    email: req.body.email,
    username: req.body.username,
    password: pw.hash(req.body.password),
  };

  const [[available]] = await trx.execute(
    `SELECT (SELECT COUNT(*) FROM user WHERE email = ?) as email, (SELECT COUNT(*) FROM user WHERE username = ?) as username;`,
    [user.email, user.username]
  );

  if (!available) {
    return {
      status: 'something broke',
      error: 'Something went wrong, please try again...',
    };
  }

  // Check if username is already in use
  if (available.username) {
    return {
      status: 'availability error',
      error: 'Username is already in use',
    };
  }

  // Check if email is already in use
  if (available.email) {
    // TODO: Send email letting registered user know someone tried to register with this email
    return { status: 'ok' };
  }

  // Create the new user
  await trx.execute(
    `INSERT INTO user (email, username, password) VALUES (?, ?, ?);`,
    [user.email, user.username, user.password]
  );

  asdsad;

  return { status: 'ok' };
});
