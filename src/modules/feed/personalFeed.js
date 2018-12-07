const { request } = require('modules/util');
const joi = require('joi');
const { feed } = require('./feed');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

const personalFeed = async (trx, { userID, page }) => {
  const feedData = await feed(trx, {
    page,
    userID,
    filter: { personal: true },
  });
  if (feedData.status !== 'ok') return feedData;

  return { ...feedData };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  return await personalFeed(trx, { ...req.body, ...req.params });
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await personalFeed(trx, {
    ...req.params,
    page: 0,
    userID: req.session.userID,
  });

  res.render('index', {
    posts: status.posts,
  });
  return;
});

module.exports = {
  post,
  get,
};
