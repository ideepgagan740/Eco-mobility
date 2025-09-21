const express = require('express');
const v1Cars = require('./v1/car.routes');

const router = express.Router();
router.use('/v1', v1Cars);

module.exports = router;
