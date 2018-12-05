const { request } = require('modules/util');
const ID = require('modules/id');

module.exports = request(async (trx, req, res) => {
  // Get the collection ID
  const [[collection]] = await trx.execute(
    `
    SELECT
      collectionID
    FROM
      collection
    WHERE
      name = ?
    `,
    [req.body.collectionName]
  );

  // Decode post ID
  const postID = Number(ID.post.decode(req.body.postID));

  // Check if post is already in collection
  const [[post]] = await trx.execute(
    `
    SELECT
      COUNT(*) as "exists"
    FROM
      collectionPost
    WHERE
      postID = ? AND
      collectionID = ?
    `,
    [postID, collection.collectionID]
  );

  // Add a post to a collection
  if (!post.exists) {
    await trx.execute(
      `
        INSERT INTO collectionPost 
            (collectionID, postID) 
        VALUES 
            (?, ?)
        `,
      [collection.collectionID, postID]
    );
  }

  return { status: 'ok' };
});
