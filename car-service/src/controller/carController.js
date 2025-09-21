const mongoose = require('mongoose');
const CarService = require('../services/CarService');
const Car = require('../models/Car');

class CarController {
  async listCars(req, res, next) {
    try {
      const result = await CarService.listCars(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async addCar(req, res, next) {
    try {
      const car = await CarService.addCar(req.body);
      res.status(201).json(car);
    } catch (err) {
      next(err);
    }
  }

  async getAvailability(req, res, next) {
    try {
      const { id: carId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(carId)) {
        return res.status(400).json({ message: 'Invalid car id' });
      }

      const car = await Car.findById(carId).select('available').lean();
      if (!car) {
        return res.status(404).json({ error: 'Car not found' });
      }

      return res.json({ available: !!car.available });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CarController();