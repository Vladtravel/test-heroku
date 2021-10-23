const Joi = require("joi");
const { HttpCode } = require("../service/constants");

const schemaValidateContact = Joi.object({
  name: Joi.string().min(1).max(30),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

const schemaValidateAuth = Joi.object({
  name: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

const schemaValidateUpdateSub = Joi.object({
  subscription: Joi.any().valid("free", "pro", "premium").required(),
});

const schemaFavorite = Joi.object({
  favorite: Joi.boolean().required(),
});

const validate = (schema, obj, next) => {
  const { error } = schema.validate(obj);
  if (error) {
    return next({
      status: HttpCode.BAD_REQUEST,
      message: "Bad request",
    });
  }
  next();
};

const validateFav = (schema, body, next) => {
  const { error } = schema.validate(body);
  if (error) {
    return next({
      message: {
        status: "Bad Request",
        code: HttpCode.BAD_REQUEST,
        message: `Missing field favorite`,
      },
    });
  }
  next();
};

const validateContact = (req, _res, next) => {
  return validate(schemaValidateContact, req.body, next);
};

const validateFavorite = (req, _res, next) => {
  return validateFav(schemaFavorite, req.body, next);
};

const validateAuth = (req, _res, next) => {
  return validate(schemaValidateAuth, req.body, next);
};

const validateUpdateSub = (req, _res, next) => {
  return validate(schemaValidateUpdateSub, req.body, next);
};

module.exports = {
  validateContact,
  validateFavorite,
  validateAuth,
  validateUpdateSub,
};
