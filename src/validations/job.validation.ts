import JobType from '../types/job.type';
import Joi from 'joi';

export const jobValSchema = (payload: JobType): Joi.ValidationResult<JobType> => {
  const schema = Joi.object({
    id: Joi.string().trim().allow(null, ''),
    title: Joi.string().trim().min(3).max(100).required(),
    company: Joi.string().trim().min(3).max(100).required(),
    role: Joi.string().trim().valid('Full Time', 'Part Time', 'Internship', 'Contract', 'Freelance').required(),
    type: Joi.string().trim().valid('Remote', 'Onsite', 'Hybrid').required(),
    source: Joi.string().trim().valid('LinkedIn', 'Indeed', 'Socmed', 'Glints', 'Jobstreet', 'Other').required(),
    applyOn: Joi.string().trim().valid('InApp', 'Email', 'Company Web', 'Whatsapp', 'GoogleForm', 'Other').required(),
    sourceLink: Joi.string().trim().uri().allow(null, ''),
    location: Joi.string().trim().min(3).max(100).required(),
    applyDate: Joi.date().default(() => new Date()),
  });
  return schema.validate(payload, { abortEarly: false });
};
