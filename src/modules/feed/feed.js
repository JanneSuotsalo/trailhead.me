const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {

    //Feed for anonymous users, ordered by date
    await trx.execute(
        'SELECT * FROM `post` ORDER BY `createdAt` DESC',
        (err, results) => {
            res.send(results);
        }
    );

    return { status: 'ok' };
});