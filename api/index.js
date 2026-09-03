const { app, connectDB } = require('../server/server');

let databaseConnection;

module.exports = async (req, res) => {
  try {
    databaseConnection = databaseConnection || connectDB();
    await databaseConnection;
    return app(req, res);
  } catch (error) {
    console.error('API startup error:', error.message);
    return res.status(503).json({
      success: false,
      message: 'The API database is unavailable. Check the Vercel MONGODB_URI setting.'
    });
  }
};