require('dotenv').config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

module.exports = {
  PORT,
  JWT_SECRET,
  CORS_ORIGIN,
};