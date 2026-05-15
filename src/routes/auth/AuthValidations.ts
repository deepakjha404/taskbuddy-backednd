import Joi from "joi";
import { Status } from "../../../lib/enums";

const createUserValidation = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),

  emailId: Joi.string().trim().email().required(),

  password: Joi.string().trim().min(6).max(32).required(),
});

export { createUserValidation };