import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { ErrorType } from '../types';

const handleJWTError = (err: ErrorType) =>
  new AppError('Invalid token. Please login again!', 401);

  const handleTokenExpiredError = (err: ErrorType) =>
  new AppError('Your token has expired. Please login again!', 401);

const handleCastErrorDB = (err: ErrorType) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: ErrorType) => {
  const values = Object.values(err.keyValue).join('');
  const message = `Duplicate field value: ${values}.  Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: ErrorType, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: ErrorType, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

export default (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError(error);
    sendErrorProd(error, res);
  }
};
