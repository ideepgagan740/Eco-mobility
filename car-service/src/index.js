require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Redis = require('ioredis');
const { authenticate, authorize } = require('../../shared/auth/jwt');
const { connectDB } = require('./config/db');
const routes = require('./routes');
// const CarService = require('./services/CarService');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 3002;

connectDB()

// const redis = new Redis(REDIS_URL);
// CarService.init(redis);

app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`car-service on :${PORT}`));
