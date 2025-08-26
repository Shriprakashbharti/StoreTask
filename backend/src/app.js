const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./modules/auth.routes');
const adminRoutes = require('./modules/admin.routes');
const storesRoutes = require('./modules/stores.routes');
const ownerRoutes = require('./modules/owner.routes');
const errorHandler = require('./middlewares/error');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(morgan('combined'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/owner', ownerRoutes);

app.use(errorHandler);

module.exports = app;