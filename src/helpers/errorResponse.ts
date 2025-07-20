import { Response } from "express"
import { ValidationError } from "joi";

export const valResponse = (res: Response, error: ValidationError) => {
  res.status(400).json({
    success: false,
    message: error.details.map((err) => ({ message: err.message, path: err.path[0] })),
  });
}

export const invalidResponse = (res: Response, val: string = '', code: number = 401) => {
  return res.status(code).json({
    success: false,
    message: 'Invalid: ' + val,
  });
};