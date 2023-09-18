import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import { RequestCustomType } from '../types';

const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const updateMe = catchAsync(
  async (req: RequestCustomType, res: Response, next: NextFunction) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword',
          400
        )
      );
    }

    // 2) Update user document
    //Filtered out unwanted fields names
    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      user: updatedUser,
    });
  }
);

const deleteMe = catchAsync(
  async (req: RequestCustomType, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find();
  res.status(500).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const getUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const updateUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const deleteUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

export {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
