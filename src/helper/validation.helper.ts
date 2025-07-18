import { Response } from "express"
import { ValidationError } from "joi";

export const valResponse = (res: Response, error: ValidationError) => {
  res.status(400).json({
    success: false,
    message: error.details.map((err) => ({ message: err.message, path: err.path[0] })),
  });
}
