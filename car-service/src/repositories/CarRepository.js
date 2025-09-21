const Car = require('../models/Car');

class CarRepository {
  async findPaginated(filter, { page, limit, sort }) {
    const [data, total] = await Promise.all([
      Car.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Car.countDocuments(filter),
    ]);
    return { data, total };
  }

  async create(data) {
    const car = new Car(data);
    return car.save();
  }

  async findAvailableById(carId) {
    return Car.findOne({ _id: carId, available: true });
  }
}

module.exports = new CarRepository();