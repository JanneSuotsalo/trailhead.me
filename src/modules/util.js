/**
 * Helper to make error handling with Express routes easier
 * @param {Function} action The function for the Express route to run
 */
const request = action => (req, res, next) =>
  new Promise(async () => {
    try {
      const status = await action(req, res, next);
      if (!res.headersSent) return res.send(status);
    } catch (e) {
      console.error(e);
      return res.sendStatus(500);
    }
  });

module.exports = {
  request,
};
