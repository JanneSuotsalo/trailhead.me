const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {
  //Feed for anonymous users, ordered by date
  const [posts] = await trx.execute(
    'SELECT * FROM `post` ORDER BY `createdAt` DESC',
    []
  );

  return { status: 'ok', posts };
});
