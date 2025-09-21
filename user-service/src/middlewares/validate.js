module.exports = (schema, source = 'body') => (req, res, next) => {
  try {
    req[source] = schema.parse(req[source]);
    next();
  } catch (err) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      errors: err.errors || err.message,
    });
  }
};