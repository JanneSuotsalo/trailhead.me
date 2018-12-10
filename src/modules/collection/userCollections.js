const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {
  // Get the users collections
  const [collections] = await trx.query(
    `
        SELECT
          collectionID,
          name
        FROM
          collection
        WHERE
          userID = ?;
        `,
    [req.params.userID]
  );
  console.log(req.params.userID);

  return { status: 'ok', collections };
});
