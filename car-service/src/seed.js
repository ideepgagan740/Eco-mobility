require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('./models/Car');

const MONGODB_URI =
  process.env.CARS_DB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://mongo:27017/eco_cars?replicaSet=rs0';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const count = await Car.countDocuments();
    if (count < 3) {
      await Car.insertMany([
        { name: 'Toyota Corolla', make: 'Toyota', model: 'Corolla', year: 2021, seats: 5, pricePerDay: 45, available: true },
        { name: 'Tesla Model 3', make: 'Tesla', model: 'Model 3', year: 2022, seats: 5, pricePerDay: 120, available: true },
        { name: 'Honda Civic', make: 'Honda', model: 'Civic', year: 2020, seats: 5, pricePerDay: 50, available: true }
      ]);
      console.log('Seeded 3 cars.');
    } else {
      console.log('Cars already seeded.');
    }
  } catch (err) {
    console.error('Car seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Car seed complete.');
  }
})();
