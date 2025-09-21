const AuthService = require('../services/AuthService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const result = await AuthService.register({ name, email, password, role });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
