const { request } = require('modules/util');
const joi = require('joi');
const { feed } = require('modules/feed/feed');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

// Get collections for profile
const collectionFeed = async (trx, { userID, page, collection }) => {
  const [[collectionData]] = await trx.query(
    `
    SELECT
      c.collectionID,
      c.name,
      c.description
    FROM
      collection c
    WHERE
      c.name = ?
    `,
    [collection]
  );

  const feedData = await feed(trx, {
    page,
    userID,
    filter: { collection: collectionData.collectionID },
  });
  if (feedData.status !== 'ok') return feedData;

  return { ...feedData, collectionData };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  return await collectionFeed(trx, {
    ...req.body,
    ...req.params,
    userID: req.session.userID,
  });
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await collectionFeed(trx, {
    ...req.params,
    page: 0,
    userID: req.session.userID,
  });

  res.render('index', {
    posts: status.posts,
    search: {
      header: status.collectionData.name,
      text: status.collectionData.description,
    },
  });
});

module.exports = {
  post,
  get,
};
