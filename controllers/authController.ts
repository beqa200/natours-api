import jwt from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { promisify } from 'util';
import sendEmail from '../utils/email';
import crypto from "crypto"
const signToken = (id: Object) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      ...req.body,
      passwordChangedAt: new Date(),
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  }
);

const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
    });
  }
);

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verification token

    //@ts-ignore
    const decoded: { id: String; iat: number; exp: number } = await promisify(
      jwt.verify
      //@ts-ignore
    )(token, process.env.JWT_SECRET);

    console.log(decoded);

    // 3) Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exists',
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }
    //@ts-ignore
    req.user = freshUser;
    // GRANT ACCESS TO PROTECTED ROUTE
    next();
  }
);

const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}. If you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });
  
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });

    } catch(err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.save({validateBeforeSave: false});

      return next(new AppError("There was an error sending an email. Try again later", 500))
    }
   
  }
);

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now( )}})

  // 2) If token has not expired, and there is user, set the new password
  if(!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
 

  // 4) Log the user in, send JWT

  await user.save();
  const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
    });
});

export { signup, login, protect, restrictTo, forgotPassword, resetPassword };
