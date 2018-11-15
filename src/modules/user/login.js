const joi = require('joi');
const pw = require('./password');
const { request } = require('modules/util');

// prettier-ignore
const schema = joi.object({
  email: joi.string().email().max(256).required(),
  password: joi.string().min(6).max(1024).required(),
});

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  // Find the user that is trying to log in
  const [[user]] = await trx.execute(
    `SELECT userID, email, username, password FROM user WHERE email = ?`,
    [req.body.email]
  );

  // No user found
  if (!user) {
    pw.simulate(req.body.password);
    return { status: 'invalid credentials', error: 'Invalid credentials' };
  }

  // Check if user entered the correct password
  if (!pw.validate(req.body.password, user.password)) {
    return { status: 'invalid credentials', error: 'Invalid credentials' };
  }

  // Set the session
  req.session = user;

  return { status: 'ok' };
});
