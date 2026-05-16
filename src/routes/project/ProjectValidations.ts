import Joi from "joi";

const createProjectValidation = Joi.object({
  name: Joi.string().trim().min(3).max(80).required(),
  description: Joi.string().trim().allow("").max(500).optional(),
});

const updateProjectValidation = Joi.object({
  name: Joi.string().trim().min(3).max(80).optional(),
  description: Joi.string().trim().allow("").max(500).optional(),
});

const memberValidation = Joi.object({
  userId: Joi.string().trim().required(),
});

export { createProjectValidation, updateProjectValidation, memberValidation };
