require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { connectDB } = require('./config/db');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3003;

// connect DB
connectDB()

// mount versioned routes
app.use('/api', routes);

// health endpoint
app.get('/health', (_req, res) => res.json({ ok: true }));

// 404 handler
app.use(require('./middlewares/notFound'));

// error handler
app.use(require('./middlewares/error'));
app.listen(PORT, () => console.log(`booking-service on :${PORT}`));
