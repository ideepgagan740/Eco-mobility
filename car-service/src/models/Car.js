const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2 },
  make: { type: String, minlength: 2 },
  model: { type: String, minlength: 1 },
  seats: { type: Number, min: 1 ,required: true},
  pricePerDay: { type: Number, min: 0,required: true},
  available: { type: Boolean, default: true ,required: true},
}, { timestamps: true });

// Useful indexes for queries and filters
carSchema.index({ available: 1 });
carSchema.index({ make: 1 });
carSchema.index({ model: 1 });
carSchema.index({ seats: 1 });
carSchema.index({ pricePerDay: 1 });

module.exports = mongoose.model('Car', carSchema);
