const { request } = require('modules/util');
const joi = require('joi');

// prettier-ignore
const schema = joi.object({
  collectionName: joi.string().min(1).max(255).allow(''),
  description: joi.string().min(1).max(255).allow(''),
}).required();

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  // Add a collection
  await trx.execute(
    `
    INSERT INTO collection 
        (userID, name, description) 
    VALUES 
        (?, ?, ?)
    `,
    [req.session.userID, req.body.collectionName, req.body.description]
  );

  return { status: 'ok' };
});
