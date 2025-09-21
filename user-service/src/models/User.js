const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});
userSchema.index({ email: 1 });

// Map passwordHash to password for auth code expecting `user.passwordHash`
userSchema.virtual('passwordHash')
  .get(function () {
    // primary: stored hash in `password`; fallback: legacy field if exists
    return this.password || (this._doc && this._doc.passwordHash);
  })
  .set(function (v) {
    // allow setting passwordHash to populate password
    this.password = v;
  });

module.exports = mongoose.model('User', userSchema);
