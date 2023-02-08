const { body, validationResult } = require('express-validator');

const religionValidationRules = () => {
  return [
    // username must be an email
    body('religionName')
      .notEmpty()
      .withMessage('Religion Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Should have minimum 2 and maximum 50 characters'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  const extractedErrors = [];
  errors.array().map((error) => extractedErrors.push({ msg: error.msg }));
  req.ValidateErrors = extractedErrors;
  return next();
};

module.exports = {
  religionValidationRules,
  validate,
};
