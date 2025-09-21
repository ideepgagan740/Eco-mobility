const { z } = require('zod');

const createBookingSchema = z.object({
  carId: z.string().min(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  bookingId: z.string().optional(),
});

module.exports = { createBookingSchema };
