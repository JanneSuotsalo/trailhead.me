const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {
  // Find the userID of the user, that the other user is trying to follow
  const [[user]] = await trx.execute(
    `SELECT userID FROM user WHERE username = ?`,
    [req.params.username]
  );

  // Check if the user exists that the follower tries to follow
  if (!user) {
    return {
      status: 'forbidden',
      error: 'User does not exist',
    };
  }

  // Check that the user is not already following the other user
  const [[follower]] = await trx.execute(
    'SELECT COUNT(*) as "exists" FROM follower WHERE followerID = ? AND userID = ?;',
    [req.session.userID, user.userID]
  );

  if (follower.exists) {
    // Remove follower status
    await trx.execute(
      `DELETE FROM follower WHERE followerID = ? AND userID = ?;`,
      [req.session.userID, user.userID]
    );
  } else {
    // Start following
    await trx.execute(
      `INSERT INTO follower (followerID, userID) VALUES (?,?);`,
      [req.session.userID, user.userID]
    );
  }

  return { status: 'ok' };
});
