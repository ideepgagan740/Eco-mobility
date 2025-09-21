const { Router } = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');

const BookingController = require('../../controller/bookingController'); // changed
const { createBookingSchema } = require('../../../../shared/validators/booking'); // changed
const router = Router();

router.post('/bookings', auth, validate(createBookingSchema), (req, res, next) =>
  BookingController.bookCar(req, res, next)
);
router.get('/bookings', auth, (req, res, next) =>
  BookingController.getBookings(req, res, next)
);
router.put('/bookings/:id/cancel', auth, (req, res, next) =>
  BookingController.cancelBooking(req, res, next)
);

module.exports = router;
