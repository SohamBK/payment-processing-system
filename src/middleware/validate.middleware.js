export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.validatedData = result;

    next();
  } catch (err) {
    throw {
      statusCode: 400,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors,
    };
  }
};
