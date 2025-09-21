const bcrypt = require('bcryptjs');
const { sign } = require('../../shared/auth/jwt');
const Users = require('../repositories/UserRepository');

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = {
  async register({ name, email, password, role }) {
    if (!email || !password) throw httpError(400, 'email and password are required');
    const exists = await Users.findByEmail(email);
    if (exists) throw httpError(409, 'Email already in use');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Users.create({ name, email, passwordHash, role: role || 'user' });
    return { id: user._id, email: user.email, role: user.role };
  },

  async login({ email, password }) {
    if (!email || !password) throw httpError(400, 'email and password are required');
    const user = await Users.findByEmail(email);
    if (!user) throw httpError(401, 'Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw httpError(401, 'Invalid credentials');
    const token = sign({ sub: user._id.toString(), role: user.role, email: user.email });
    return { token };
  }
};