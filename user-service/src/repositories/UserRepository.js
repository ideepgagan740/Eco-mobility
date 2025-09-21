const bcrypt = require('bcryptjs');
const User = require('../models/User');

function isBcryptHash(str) {
  return typeof str === 'string' && /^\$2[aby]\$\d{2}\$/.test(str);
}

module.exports = {
  findByEmail(email) {
    return User.findOne({ email });
  },
  create(data) {
    const doc = { ...data };

    // Normalize: allow passwordHash or password
    if (!doc.password && doc.passwordHash) {
      doc.password = doc.passwordHash;
    }

    // Hash plain password if not already bcrypt
    if (doc.password && !isBcryptHash(doc.password)) {
      doc.password = bcrypt.hashSync(doc.password, 10);
    }

    // Do not persist passwordHash field
    delete doc.passwordHash;

    return User.create(doc);
  }
};