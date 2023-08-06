import express from 'express';
import {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
} from '../controllers/tourController';

const router = express.Router();

// router.param('id', checkID);

router.route('/').get(getAllTours).post(createTour);
router.route('/top-5-cheapest').get(aliasTopTours ,getAllTours);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default router;
