import express from 'express';
import {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} from '../controllers/tourController';
import { protect, restrictTo } from '../controllers/authController';

const router = express.Router();

// router.param('id', checkID);

router.route('/').get(protect, getAllTours).post(createTour);
router.route('/top-5-cheapest').get(aliasTopTours, getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/:id').get(getTour).patch(updateTour).delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

export default router;
