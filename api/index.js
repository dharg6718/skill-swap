const { app, connectDB } = require('../server/server');

let databaseConnection;

module.exports = async (req, res) => {
  databaseConnection = databaseConnection || connectDB();
  await databaseConnection;
  return app(req, res);
};