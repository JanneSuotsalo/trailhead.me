const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {
  // Remove collection
  await trx.execute(
    `
    DELETE FROM 
        collection 
    WHERE
        userID = ? AND
        collectionID = ?
    `,
    [req.session.userID, req.body.collectionID]
  );

  return { status: 'ok' };
});
