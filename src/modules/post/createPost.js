const joi = require('joi');
const { request } = require('modules/util');
const ID = require('modules/id');

// prettier-ignore
const schema = joi.object({
  text: joi.string().min(1).max(1024).required(),
  files: joi.array().items(joi.string().min(4).max(128).alphanum()).min(1).max(8),
});

module.exports = request(async (trx, req, res) => {
  // Validate the incoming request with Joi
  const valid = joi.validate(req.body, schema);
  if (valid.error) {
    return { status: 'validation error', error: valid.error };
  }

  const post = {
    userID: req.session.userID,
    text: req.body.text,
  };

  // Create the new post
  await trx.execute(
    `INSERT INTO post (userID, text) VALUES (?, ?);`,
    Object.values(post)
  );

  // Get the new post ID
  const [[insert]] = await trx.query(
    `SELECT LAST_INSERT_ID() as id FROM post;`
  );

  // Add all uploaded files into the post
  for (const file of req.body.files) {
    const postFile = {
      postID: insert.id,
      fileID: ID.file.decode(file)[0],
    };

    // Add a file to the post
    await trx.execute(
      `INSERT INTO postFile (postID, fileID) VALUES (?, ?);`,
      Object.values(postFile)
    );
  }

  return { status: 'ok', postID: ID.post.encode(insert.id) };
});
