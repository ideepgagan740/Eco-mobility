const { Router } = require('express');

const v1Bookings  = require('./v1/booking.routes');

const router = Router();
router.use('/v1', v1Bookings);

module.exports = router;
