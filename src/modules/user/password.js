const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Create a 32 bit sha256 hash from the password first to get around the 72 byte limit
// on the bcrypt algorithm, this is a popular approach used by Dropbox for example
const sha256 = password => {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('base64');
};

/**
 * Hash a password to be stored securely in the database
 * @param {string} password
 * @returns {string} The hashed password
 */
const hash = password => {
  // Return the bcrypt hash generated from the sha256 hash
  return bcrypt.hashSync(sha256(password), Number(process.env.SALT_ROUNDS));
};

/**
 * Validate a password with the hash stored in the database
 * @param {*} password
 * @param {*} hash The password hash stored in the database
 * @returns {boolean} Was the password valid or not
 */
const validate = (password, hash) => {
  // Return the validation result between the sha256 hash and the stored bcrypt hash
  return bcrypt.compareSync(sha256(password), hash);
};

/**
 * Simulate hashing a password with a random bcrypt hash
 * This pervents attackers from using timing attacts to see if an email is registered or not
 * @param {string} password
 */
const simulate = password => {
  const rounds =
    process.env.SALT_ROUNDS < 10
      ? `0${process.env.SALT_ROUNDS}`
      : process.env.SALT_ROUNDS;

  bcrypt.compareSync(
    sha256(password),
    `$2a$${rounds}$${crypto.randomBytes(26).toString('hex')}O`
  );
};

module.exports = {
  hash,
  validate,
  simulate,
};
