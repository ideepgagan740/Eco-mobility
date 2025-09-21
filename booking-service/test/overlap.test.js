const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { Booking, BookingSlot } = require('../src/models');

const enumerateDays = (start, end) => {
  const s = new Date(start); s.setUTCHours(0,0,0,0);
  const e = new Date(end); e.setUTCHours(0,0,0,0);
  const days = [];
  for (let d = s; d < e; d.setUTCDate(d.getUTCDate() + 1)) days.push(new Date(d));
  return days;
};

describe('booking overlap', () => {
  let replset;

  beforeAll(async () => {
    replset = await MongoMemoryReplSet.create({ replSet: { storageEngine: 'wiredTiger' } });
    const uri = replset.getUri();
    await mongoose.connect(uri);
    await BookingSlot.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await replset.stop();
  });

  test('prevents overlapping bookings by slots', async () => {
    const carId = new mongoose.Types.ObjectId();
    const userA = new mongoose.Types.ObjectId();
    const userB = new mongoose.Types.ObjectId();

    // Booking 1: [2025-01-10, 2025-01-13)
    const session1 = await mongoose.startSession();
    session1.startTransaction();
    const b1 = await Booking.create([{ userId: userA, carId, startDate: new Date('2025-01-10'), endDate: new Date('2025-01-13') }], { session: session1 });
    const slots1 = enumerateDays('2025-01-10', '2025-01-13').map(d => ({ bookingId: b1[0]._id, carId, date: d }));
    await BookingSlot.insertMany(slots1, { session: session1 });
    await session1.commitTransaction(); session1.endSession();

    // Booking 2 overlaps [2025-01-12, 2025-01-14)
    const session2 = await mongoose.startSession();
    session2.startTransaction();
    const b2 = await Booking.create([{ userId: userB, carId, startDate: new Date('2025-01-12'), endDate: new Date('2025-01-14') }], { session: session2 });
    const slots2 = enumerateDays('2025-01-12', '2025-01-14').map(d => ({ bookingId: b2[0]._id, carId, date: d }));

    let dup = null;
    try {
      await BookingSlot.insertMany(slots2, { session: session2 });
    } catch (e) {
      dup = e;
      await session2.abortTransaction();
    } finally {
      session2.endSession();
    }
    expect(dup && dup.code).toBe(11000);
  });
});
