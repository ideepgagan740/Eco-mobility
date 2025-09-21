const { z } = require('zod');

const addCarSchema = z.object({
  name: z.string().min(2),
  make: z.string().min(2).optional(),
  model: z.string().min(1).optional(),
  seats: z.number().int().min(1),
  pricePerDay: z.number().min(0),
  available: z.boolean(),
});

const listCarsSchema = z.object({
  available: z.string(),
  seats: z.string(),
  make: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
});

module.exports = { addCarSchema, listCarsSchema };
