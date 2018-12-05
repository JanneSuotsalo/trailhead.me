const db = require('modules/db');
const { userTypeIDs } = require('modules/constants');

/**
 * Helper to allow running a function inside a transaction
 * @param {Function} action The function to run
 */
const transaction = async action =>
  new Promise(async () => {
    let connection = null;

    try {
      // Get a new connection to the database
      connection = await db.connection();

      // Start a transaction
      await connection.beginTransaction();

      // Run logic
      const status = await action(connection);

      // Commit changes to the DB
      await connection.commit();

      // Send result
      return status;
    } catch (e) {
      console.error(e);

      // Rollback transaction
      if (connection) await connection.rollback();
    } finally {
      // Release the DB connection back into the pool
      if (connection) connection.release();
    }
  });

/**
 * Helper to make error handling with Express routes easier
 * @param {Function} action The function for the Express route to run
 */
const request = action => (req, res, next) =>
  new Promise(async () => {
    let connection = null;

    try {
      // Get a new connection to the database
      connection = await db.connection();

      // Start a transaction
      await connection.beginTransaction();

      // Run logic
      const status = await action(connection, req, res, next);

      // Commit changes to the DB
      await connection.commit();

      // Send result, if not already sent
      if (!res.headersSent && status) return res.send(status);
    } catch (e) {
      console.error(e);

      // Rollback transaction
      if (connection) await connection.rollback();
      return res.sendStatus(500);
    } finally {
      // Release the DB connection back into the pool
      if (connection) connection.release();
    }
  });

/**
 * An Express helper to make sure the user is authenticated
 */
const authenticated = (req, res, next) => {
  if (req.session && req.session.userID) return next();

  if (req.method === 'GET') {
    return res.redirect(`/login?to=${req.url}`);
  } else {
    return res.send({
      status: 'forbidden',
      error: 'Invalid session, please login again...',
    });
  }
};

/**
 * An Express helper to make sure the user is an administrator
 */
const administrator = (req, res, next) => {
  if (
    req.session &&
    req.session.userID &&
    req.session.userTypeID === userTypeIDs.ADMIN
  ) {
    return next();
  }

  if (req.method === 'GET') {
    return res.redirect(`/`);
  } else {
    return res.send({
      status: 'forbidden',
      error: 'Invalid session, please login again...',
    });
  }
};

module.exports = {
  request,
  transaction,
  authenticated,
  administrator,
};
