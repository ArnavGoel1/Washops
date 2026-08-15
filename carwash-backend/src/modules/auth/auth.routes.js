import { Router } from 'express';
import { signup, login, validate as validateHandler } from './auth.controller.js';
import { signupValidator, loginValidator } from './auth.validators.js';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.get('/validate', requireAuth, validateHandler);

export default router;
