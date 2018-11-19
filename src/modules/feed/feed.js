const { request } = require('modules/util');
const joi = require('joi');

// prettier-ignore
const schema = joi.object({
  page: joi.number().integer().min(0).required()
});

module.exports = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  //Feed for anonymous users, ordered by date
  const [posts] = await trx.execute(
    'SELECT * FROM `post` ORDER BY `createdAt` DESC LIMIT ?, ?',
    [Number(req.body.page) * 10, 10]
  );

  return { status: 'ok', posts };
});
