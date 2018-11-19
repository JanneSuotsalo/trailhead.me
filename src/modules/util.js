const db = require('modules/db');

/**
 * Helper to make error handling with Express routes easier
 * @param {Function} action The function for the Express route to run
 */
const request = action => {
  const bind = (req, res, next) =>
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
        if (!res.headersSent) return res.send(status);
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

  bind.manual = manual(action);

  return bind;
};

/**
 * Helper to manually run the "request" helper without express
 * @param {object} body JSON payload
 * @param {object} params URL params
 */
const manual = action => (body, params) =>
  new Promise(async resolve => {
    let connection = null;

    try {
      // Get a new connection to the database
      connection = await db.connection();

      // Start a transaction
      await connection.beginTransaction();

      // Run logic
      const status = await action(connection, { body, params }, null);

      // Commit changes to the DB
      await connection.commit();

      // Return result
      return resolve(status);
    } catch (e) {
      console.error(e);

      // Rollback transaction
      if (connection) await connection.rollback();
      return resolve({ status: 'error', error: e });
    } finally {
      // Release the DB connection back into the pool
      if (connection) connection.release();
    }
  });

module.exports = {
  request,
};
