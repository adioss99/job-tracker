import StatusType from '../types/status.type';
import Joi from 'joi';

export const statusValSchema = (payload: StatusType): Joi.ValidationResult<StatusType> => {
  const schema = Joi.object({
    id: Joi.string().trim().allow(null, ''),
    status: Joi.string().trim().min(3).max(100).required(),
    jobId: Joi.string().trim().length(24).required(),
    addDate: Joi.date().default(() => new Date()),
  });
  return schema.validate(payload, { abortEarly: false });
};
