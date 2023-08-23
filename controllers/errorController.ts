import { Request, Response, NextFunction } from 'express';

interface ErrorType extends Error {
  status: string;
  statusCode: number;
}

export default (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
