import * as core from 'express-serve-static-core';

interface userPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      customField?: string;
      user?: userPayload;
    }
  }
}
