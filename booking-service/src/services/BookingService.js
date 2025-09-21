const mongoose = require("mongoose");
const BookingRepo = require("../repositories/BookingRepository");
const redis = require("../config/redis"); // your ioredis singleton
const axios = require("axios");
const IDEMP_TTL_SEC = Number(process.env.IDEMPOTENCY_TTL_SEC);

// Resolve car-service base URL for deployment (no localhost)
const CAR_SERVICE_URL = process.env.CAR_SERVICE_URL;
// Default path to availability endpoint; adjust via env if your car-service differs
const CAR_AVAILABILITY_PATH_PREFIX = (process.env.CAR_AVAILABILITY_PATH_PREFIX || '/api/v1/cars').replace(/\/+$/,'');

class BookingService {
  async createBooking(userId, { carId, startDate, endDate }, authHeader) {
    if (!userId) {
      const err = new Error("User id is required");
      err.code = "AUTH_REQUIRED";
      err.status = 401;
      throw err;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || start >= end) {
      const err = new Error("Invalid booking dates");
      err.code = "INVALID_DATES";
      err.status = 400;
      throw err;
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Check car availability via car-service API
      const availabilityUrl = `${CAR_SERVICE_URL}${CAR_AVAILABILITY_PATH_PREFIX}/${carId}/availability`;
      console.log("Checking car availability at:", availabilityUrl);
      let availableResp;
      try {
        const headers = {};
        if (authHeader) headers.Authorization = authHeader;
        availableResp = await axios.get(availabilityUrl, { timeout: 5000, headers });
      } catch (e) {
        const err = new Error("Failed to reach car-service for availability");
        err.code = "CAR_SERVICE_UNREACHABLE";
        err.status = 503;
        throw err;
      }
      if (!availableResp?.data || availableResp.data.available !== true) {
        const err = new Error("Car not available");
        err.code = "CAR_UNAVAILABLE";
        err.status = 409;
        throw err;
      }

      const overlap = await BookingRepo.findOverlap(carId, start, end, session);
      if (overlap) {
        const err = new Error("Car already booked for these dates");
        err.code = "BOOKING_OVERLAP";
        err.status = 409;
        throw err;
      }

      const booking = await BookingRepo.create(
        { userId, carId, startDate: start, endDate: end, status: "active" },
        session
      );

      await session.commitTransaction();
      return booking;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getUserBookings(userId) {
    return BookingRepo.findByUser(userId);
  }

  async cancelBooking(userId, bookingId) {
    const booking = await BookingRepo.findActiveByUserAndId(userId, bookingId);
    if (!booking) {
      const err = new Error("Booking not found or already canceled");
      err.code = "BOOKING_NOT_FOUND";
      err.status = 404;
      throw err;
    }
    booking.status = "cancelled";
    return BookingRepo.update(booking);
  }

  async ensureIdempotency(bookingId) {
    if (!bookingId) return;
    const key = `idem:booking:${bookingId}`;
    const set = await redis.set(key, "1", "EX", IDEMP_TTL_SEC, "NX");
    if (set !== "OK") {
      const err = new Error("Duplicate bookingId (idempotent request)");
      err.code = "IDEMPOTENT_DUPLICATE";
      err.status = 409;
      throw err;
    }
  }

  async afterBookingCommit(carId, start, end) {
    try {
      // e.g., await Cache.invalidateCarAvailability(carId, start, end);
      return;
    } catch (e) {
      // don't fail the booking if cache busting errors out
      console.error("[afterBookingCommit] failed:", e);
    }
  }
}

module.exports = new BookingService();
