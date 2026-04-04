export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.errors[0].message,
    });
  }
};
