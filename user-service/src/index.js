require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
const PORT = process.env.PORT || 3001;

connectDB()

app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ ok: true }));

// 404 handler (must be after all routes)
app.use((req, res, _next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`user-service on :${PORT}`));
