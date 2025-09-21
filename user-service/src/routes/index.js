const express = require('express');
const v1Auth = require('./v1/auth.routes');

const router = express.Router();
router.use('/v1', v1Auth);

module.exports = router;
