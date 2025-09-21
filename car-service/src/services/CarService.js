// src/services/CarService.js
const Car  = require('../models/Car');
const CarRepo = require("../repositories/CarRepository");


class CarService {
  // ---- helpers -------------------------------------------------------------

  _toBool(val) {
    if (typeof val === 'boolean') return val;
    if (val === undefined) return undefined;
    const s = String(val).trim().toLowerCase();
    if (['true', '1', 'yes'].includes(s)) return true;
    if (['false', '0', 'no'].includes(s)) return false;
    return undefined;
  }

  _toNum(val) {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  }

  _buildFilter(query) {
    const filter = {};

    const available = this._toBool(query.available);
    if (available !== undefined) filter.available = available;

    const seats = this._toNum(query.seats);
    if (seats !== undefined) filter.seats = seats;

    if (query.make) filter.make = new RegExp(`^${String(query.make).trim()}$`, 'i');
    if (query.model) filter.model = new RegExp(String(query.model).trim(), 'i');

    // price range
    const minPrice = this._toNum(query.minPrice);
    const maxPrice = this._toNum(query.maxPrice);
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.pricePerDay = {};
      if (minPrice !== undefined) filter.pricePerDay.$gte = minPrice;
      if (maxPrice !== undefined) filter.pricePerDay.$lte = maxPrice;
    }

    return filter;
  }

  _buildPaging(query) {
    const page = Math.max(parseInt(query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);

    // sort format: "field:asc" | "field:desc" (default createdAt:desc)
    const rawSort = String(query.sort || 'createdAt:desc');
    const [field, dirRaw] = rawSort.split(':');
    const dir = (dirRaw || 'desc').toLowerCase().startsWith('asc') ? 1 : -1;

    const sort = { [field]: dir };
    return { page, limit, sort };
  }

  // ---- public API ----------------------------------------------------------

  async listCars(query) {
    const filter = this._buildFilter(query);
    const { page, limit, sort } = this._buildPaging(query);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Car.find(filter).skip(skip).limit(limit).sort(sort),
      Car.countDocuments(filter),
    ]);

    return {
      data,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
      sort,
      filters: filter,
    };
  }

  async addCar(data) {
    // Basic normalization (optional)
    if (data.make) data.make = String(data.make).trim();
    if (data.model) data.model = String(data.model).trim();
    if (data.pricePerDay !== undefined) data.pricePerDay = this._toNum(data.pricePerDay);
    if (data.seats !== undefined) data.seats = this._toNum(data.seats);
    if (data.available !== undefined) data.available = this._toBool(data.available);

    const car = await Car.create(data);

    return car;
  }

    async addCar(data) {
    // Basic normalization (optional)
    if (data.make) data.make = String(data.make).trim();
    if (data.model) data.model = String(data.model).trim();
    if (data.pricePerDay !== undefined) data.pricePerDay = this._toNum(data.pricePerDay);
    if (data.seats !== undefined) data.seats = this._toNum(data.seats);
    if (data.available !== undefined) data.available = this._toBool(data.available);

    const car = await Car.create(data);

    return car;
    }

    async checkAvailability(carId) {
    // 1) Must exist & be active
    const car = await CarRepo.findAvailableById(carId);
    if (!car) return { available: false, reason: 'CAR_NOT_FOUND' };
    if (car.isActive === false) return { available: false, reason: 'CAR_INACTIVE' };

    // 2) Simple flag (your schema can use another field name, adjust accordingly)
    const available = !!car.isAvailable;
    return { available, reason: available ? null : 'ALREADY_RESERVED' };
    }
  
}

module.exports = new CarService();
