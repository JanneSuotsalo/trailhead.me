const joi = require('joi');
const { request } = require('modules/util');
const ID = require('modules/id');
const { flagStateIDs } = require('modules/constants');

// prettier-ignore
const schema = joi.object({
    text: joi.string().max(256).required(),
    reasonTypeID: joi.number().integer().min(1).required(),
  });

const postReport = async (trx, { text, reasonTypeID, post, userID }) => {
  // Convert hash id onto a numerical one
  const postID = ID.post.decode(post)[0];
  if (!postID) {
    return {
      status: 'not found',
      error: 'Post does not exist',
    };
  }

  // Find the post
  const [[postExists]] = await trx.execute(
    `SELECT postID FROM post WHERE postID = ?`,
    [postID]
  );

  // Check if the post exists
  if (!postExists) {
    return {
      status: 'forbidden',
      error: 'Post does not exist',
    };
  }

  // Check if the text is empty
  console.log(text.trim().length);
  if (text.trim().length <= 0) {
    return {
      status: 'not allowed',
      error: 'text can not be empty',
    };
  }

  // Check if the user has already flagged the post
  const [[flag]] = await trx.execute(
    'SELECT COUNT(*) as "exists" FROM flag WHERE userID = ? AND postID = ?;',
    [userID, postID]
  );

  if (flag.exists) {
    return {
      status: 'forbidden',
      error: 'You have already flagged the post',
    };
  }

  // Create a flag
  await trx.execute(
    'INSERT INTO flag (userID, postID, reasonTypeID, reasonStateID, text) VALUES (?,?,?,?,?);',
    [userID, postID, reasonTypeID, flagStateIDs.PENDING, text]
  );

  return { status: 'ok' };
};

// Express POST middleware
const post = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }
  return await postReport(trx, {
    ...req.params,
    ...(req.session || {}),
    ...req.body,
  });
});

// Express GET middleware
const get = request(async (trx, req, res) => {
  res.render('flag', {});
});

module.exports = {
  post,
  get,
};
