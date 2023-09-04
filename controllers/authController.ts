import jwt from "jsonwebtoken";
import { NextFunction, Response, Request } from 'express';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

export { signup };