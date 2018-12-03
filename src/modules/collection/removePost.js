const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {
  // Remove collection
  await trx.execute(
    `
    DELETE FROM 
        collectionPost
    WHERE
        collectionID = ? AND
        postID = ?
    `,
    [req.body.collectionID, req.body.postID]
  );

  return { status: 'ok' };
});
