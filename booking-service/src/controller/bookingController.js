const crypto = require("crypto");
const BookingService = require("../services/BookingService");

class BookingController {
  // POST /v1/bookings
  async bookCar(req, res, next) {
    try {
      const { carId, startDate, endDate, bookingId } = req.body || {};
      const id = bookingId || crypto.randomUUID();

      // Resolve user id from token/context
      const u = req.user || {};
      const userId = u.id || u._id || u.userId || u.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: missing user id", code: "AUTH_REQUIRED" });
      }

      // Direct synchronous creation (no queue)
      const booking = await BookingService.createBooking(
        userId,
        { carId, startDate, endDate },
        req.headers.authorization // forward token
      );

      return res.status(201).json(booking);
    } catch (err) {
      // respond with proper status/code/message
      const status = err.status || 500;
      return res.status(status).json({
        error: err.message || "Internal Server Error",
        code: err.code || "INTERNAL_ERROR",
      });
    }
  }

  // GET /v1/bookings
  async getBookings(req, res, next) {
    try {
      const u = req.user || {};
      const userId = u.id || u._id || u.userId || u.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: missing user id", code: "AUTH_REQUIRED" });
      }

      const bookings = await BookingService.getUserBookings(userId);
      res.json(bookings);
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({
        error: err.message || "Internal Server Error",
        code: err.code || "INTERNAL_ERROR",
      });
    }
  }

  // DELETE/PUT /v1/bookings/:id/cancel
  async cancelBooking(req, res, next) {
    try {
      const u = req.user || {};
      const userId = u.id || u._id || u.userId || u.sub;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: missing user id", code: "AUTH_REQUIRED" });
      }

      const booking = await BookingService.cancelBooking(userId, req.params.id);
      res.json(booking);
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({
        error: err.message || "Internal Server Error",
        code: err.code || "INTERNAL_ERROR",
      });
    }
  }
}

module.exports = new BookingController();
