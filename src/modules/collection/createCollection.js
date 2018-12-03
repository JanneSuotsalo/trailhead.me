const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {
  // Add a collection
  await trx.execute(
    `
    INSERT INTO collection 
        (userID, name, description) 
    VALUES 
        (?, ?, ?)
    `,
    [req.session.userID, req.body.collectionName, req.body.description]
  );

  return { status: 'ok' };
});
