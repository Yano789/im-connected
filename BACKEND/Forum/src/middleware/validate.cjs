const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.body = value;
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.params = value;
  next();
};


const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.query = value;
  next();
};



module.exports = {validateBody,validateParams,validateQuery}