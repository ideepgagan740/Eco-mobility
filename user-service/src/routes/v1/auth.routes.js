const { Router } = require('express');
const AuthController = require('../../controller/authController');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('../../../../shared/validators/auth');

const router = Router();

router.post('/register', validate(registerSchema), (req, res, next) =>
  AuthController.register(req, res, next)
);
router.post('/login', validate(loginSchema), (req, res, next) =>
  AuthController.login(req, res, next)
);

module.exports = router;

