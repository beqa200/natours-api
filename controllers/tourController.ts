import { NextFunction, Request, Response } from 'express';
import Tour from '../models/tourModel';
import APIFeatures from '../utils/apiFeatures';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

declare module 'express-serve-static-core' {
  interface Request {
    requestTime: string;
  }
}

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`).toString()
// );

// const checkBody = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }

//   next();
// };

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage price';

  next();
};

export const getAllTours = catchAsync(async (req: Request, res: Response) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields();
  // .paginate();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
);

export const createTour = catchAsync(async (req: Request, res: Response) => {
  // const newTour = new Tour({});
  // newTour.save();

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
});

export const updateTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

export const deleteTour = catchAsync(async (req: Request, res: Response, next: NextFunction  ) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

export const getTourStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.6 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: { avgPrice: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response) => {
    const year = parseFloat(req.params.year);

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      { $project: { _id: 0 } },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  }
);
