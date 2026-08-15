import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { checkout, listMyPayments, updateStatus } from './payment.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', listMyPayments);
router.get('/me', listMyPayments);
router.post('/checkout', checkout);
router.patch('/:id/status', updateStatus);

export default router;
