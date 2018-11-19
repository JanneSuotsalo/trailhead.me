const { request } = require('modules/util');
const joi = require('joi');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  if (!req.session.isPopulated) {
    return {
      status: 'forbidden',
      error: 'Invalid session, please login again...',
    };
  }

  //Feed for posts by the loggged in user
  const [posts] = await trx.execute(
    'SELECT * FROM post, user WHERE post.userID = ? AND user.userID = post.userID ORDER BY post.createdAt DESC LIMIT ?, ?;',
    [req.session.userID, Number(req.body.page) * 10, 10]
  );

  return { status: 'ok', posts };
});
