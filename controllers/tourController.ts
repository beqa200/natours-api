import { NextFunction, Request, Response } from 'express';
import fs from 'fs';

declare module 'express-serve-static-core' {
  interface Request {
    requestTime: string;
  }
}

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`).toString()
);

const checkID = (req: Request, res: Response, next: NextFunction, val) => {
  if (parseFloat(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  next();
};

const checkBody = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }

  next();
};
const getAllTours = (req: Request, res: Response) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req: Request, res: Response) => {
  const id = parseFloat(req.params.id);

  const tour = tours.find((el: any) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req: Request, res: Response) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
    }
  );
};

const updateTour = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req: Request, res: Response) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

export { getAllTours, getTour, createTour, updateTour, deleteTour, checkID, checkBody };
