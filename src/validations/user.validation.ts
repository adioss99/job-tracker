import UserType from '@/types/user.type';
import Joi from 'joi';

export const userValidationSchema = (payload: UserType): Joi.ValidationResult<UserType> => { 
  const schema = Joi.object({
    id: Joi.string().trim().allow(null, ''),
    name: Joi.string().trim().min(3).max(30).required().messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name must not exceed 30 characters',
    }),
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
    }),
    password: Joi.string().trim().min(6).max(16).required().messages({
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must not exceed 16 characters',
    }),
  });
  return schema.validate(payload, { abortEarly: false });
};

export const loginValidationSchema = (payload: UserType): Joi.ValidationResult<UserType> => {
  const schema = Joi.object({ 
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).max(16).required(),
  });
  return schema.validate(payload, { abortEarly: false });
};