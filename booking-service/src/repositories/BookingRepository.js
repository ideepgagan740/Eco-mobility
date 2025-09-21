const Booking = require('../models/Booking');

class BookingRepository {
  async findOverlap(carId, start, end, session, { timeoutMs = 8000 } = {}) {
    try {
      return await Booking.findOne({
        carId,
        status: 'active',
        startDate: { $lt: end },
        endDate: { $gt: start }
      })
        .session(session || null)
        .maxTimeMS(timeoutMs)
        .exec();
    } catch (err) {
      err.code ||= 'DB_QUERY_FAILED';
      throw err;
    }
  }

  async create(data, session) {
    try {
      const booking = new Booking(data);
      return await booking.save({ session });
    } catch (err) {
      err.code ||= 'DB_SAVE_FAILED';
      throw err;
    }
  }

  async findByUser(userId, { timeoutMs = 8000 } = {}) {
    try {
      return await Booking.find({ userId })
        .populate('carId')
        .maxTimeMS(timeoutMs)
        .exec();
    } catch (err) {
      err.code ||= 'DB_QUERY_FAILED';
      throw err;
    }
  }

  async findActiveByUserAndId(userId, bookingId, { timeoutMs = 8000 } = {}) {
    try {
      return await Booking.findOne({ _id: bookingId, userId, status: 'active' })
        .maxTimeMS(timeoutMs)
        .exec();
    } catch (err) {
      err.code ||= 'DB_QUERY_FAILED';
      throw err;
    }
  }

  async update(booking, session) {
    try {
      return await booking.save({ session });
    } catch (err) {
      err.code ||= 'DB_SAVE_FAILED';
      throw err;
    }
  }
}

module.exports = new BookingRepository();