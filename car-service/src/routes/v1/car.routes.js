const { Router } = require('express');
const CarController = require('../../controller/carController');
const auth = require('../../middlewares/auth');
const role = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const { addCarSchema } = require('../../../../shared/validators/car');

const router = Router();

router.get('/cars', (req, res, next) =>
  CarController.listCars(req, res, next)
);

router.post('/cars', auth, role('admin'), validate(addCarSchema), (req, res, next) =>
  CarController.addCar(req, res, next)
);

router.get('/cars/:id/availability', auth, (req, res, next) =>
  CarController.getAvailability(req, res, next)
);

module.exports = router;