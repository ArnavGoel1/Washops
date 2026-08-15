import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  listCustomers,
  getCustomerById,
  createCustomer,
  getMyProfile,
  updateMyProfile,
  addAddress,
  addCar,
  listMyCars,
} from './customer.controller.js';
import {
  createSchedule,
  listMySchedules,
  listAllSchedules,
  updateSchedule,
} from './schedule.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listCustomers);
router.post('/', createCustomer);
router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);

router.get('/schedules/all', listAllSchedules);

router.post('/me/address', addAddress);

router.get('/me/cars', listMyCars);
router.post('/me/cars', addCar);

router.get('/me/schedules', listMySchedules);
router.post('/me/schedules', createSchedule);
router.patch('/me/schedules/:id', updateSchedule);

router.get('/:id', getCustomerById);

export default router;
