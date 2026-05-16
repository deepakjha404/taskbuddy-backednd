import Joi from "joi";
import { TaskPriority, TaskStatus } from "../../../lib/enums";

const createTaskValidation = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().allow("").max(800).required(),
  dueDate: Joi.date().required(),
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .required(),
  assignedTo: Joi.string().trim().required(),
});

const updateTaskValidation = Joi.object({
  title: Joi.string().trim().min(3).max(100).optional(),
  description: Joi.string().trim().allow("").max(800).optional(),
  dueDate: Joi.date().optional(),
  priority: Joi.string()
    .valid(...Object.values(TaskPriority))
    .optional(),
  assignedTo: Joi.string().trim().optional(),
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .optional(),
});

const updateStatusValidation = Joi.object({
  status: Joi.string()
    .valid(...Object.values(TaskStatus))
    .required(),
});

export { createTaskValidation, updateTaskValidation, updateStatusValidation };
