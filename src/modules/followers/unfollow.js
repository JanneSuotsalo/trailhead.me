const { request } = require('modules/util');

module.exports = request(async (trx, req, res) => {
  // Find the userID of the user, that the other user is trying to unfollow
  const [[user]] = await trx.execute(
    `SELECT userID FROM user WHERE username = ?`,
    [req.params.username]
  );

  // Check if the user exists that the follower tries to unfollow
  if (!user) {
    return {
      status: 'forbidden',
      error: 'User does not exist',
    };
  }

  // Check that the user is not trying to unfollow itself
  if (user.userID === req.session.userID) {
    return {
      status: 'forbidden',
      error: 'Can not unfollow itself...',
    };
  }

  // Check if the user is already following the other user
  const [[follower]] = await trx.execute(
    'SELECT COUNT(*) as "exists" FROM follower WHERE followerID = ? AND userID = ?;',
    [req.session.userID, user.userID]
  );

  if (!follower.exists) {
    return {
      status: 'forbidden',
      error: 'Not following the user...',
    };
  }

  // Unfollow
  await trx.execute(
    `DELETE FROM follower WHERE followerID = ? AND userID = ?;`,
    [req.session.userID, user.userID]
  );

  return { status: 'ok' };
});
