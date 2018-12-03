const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {
  // Add a post to a collection
  await trx.execute(
    `
    INSERT INTO collectionPost 
        (collectionID, postID) 
    VALUES 
        (?, ?)
    `,
    [req.body.collectionID, req.body.postID]
  );

  return { status: 'ok' };
});
