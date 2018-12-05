const { request } = require('modules/util');
const joi = require('joi');
const ID = require('modules/id');
const { feed } = require('./feed');
const { flagStateIDs } = require('modules/constants');

// prettier-ignore
const schema = joi.object({
    page: joi.number().integer().min(0).required()
  });

const userFeed = async (trx, { page, userID }) => {
  const feedData = await feed(trx, { page, userID, filter: { admin: true } });
  if (feedData.status !== 'ok') return feedData;

  // If admin feed is requested, load all flags
  const [flagList] = await trx.query(
    `SELECT
        f.flagID,
        f.postID,
        f.reasonTypeID,
        f.text,
        f.createdAt,
        JSON_OBJECT(
          'username', u.username
        ) as user
      FROM flag f, user u
      WHERE
        f.postID IN (?) AND
        f.reasonStateID = ? AND
        u.userID = f.userID
      `,
    [feedData.posts.map(x => ID.post.decode(x.postID)[0]), flagStateIDs.PENDING]
  );

  feedData.posts = feedData.posts.map(x => ({
    ...x,
    flags: flagList
      .filter(y => y.postID === ID.post.decode(x.postID)[0])
      .map(y => ({
        ...y,
        postID: undefined,
        flagID: ID.flag.encode(y.flagID),
        user: JSON.parse(y.user),
      })),
  }));

  return { ...feedData };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  return await userFeed(trx, {
    ...req.body,
    ...req.params,
    userID: req.session.userID,
  });
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  const status = await userFeed(trx, {
    ...req.params,
    page: 0,
    userID: req.session.userID,
  });

  res.render('admin', {
    posts: status.posts,
    search: {
      header: 'Reports',
      text: '<b>Admin</b> view for responding to <b>reports</b>',
    },
  });
});

module.exports = {
  post,
  get,
};
