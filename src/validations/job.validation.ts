import JobType from '../types/job.type';
import Joi from 'joi';

export const jobValSchema = (payload: JobType): Joi.ValidationResult<JobType> => {
  const schema = Joi.object({
    id: Joi.string().trim().allow(null, ''),
    title: Joi.string().trim().min(3).max(100).required(),
    company: Joi.string().trim().min(3).max(100).required(),
    role: Joi.string().trim().min(3).max(100).required(),
    type: Joi.string().trim().min(3).max(100).required(),
    source: Joi.string().trim().min(3).max(100).required(),
    sourceLink: Joi.string().trim().uri().allow(null, ''),
    location: Joi.string().trim().min(3).max(100).required(),
    applyDate: Joi.date().required(),
    applyOn: Joi.string().trim().min(3).max(20).required(),
  });
  return schema.validate(payload, { abortEarly: false });
};