import express from 'express';
import rateLimiter from '../middlewares/rateLimiter.js';
import {
  registerUser,
  loginUser,
  contactUs,
  forgotPassword,
  resetPassword,
  getUserProfile,updateUserProfile,  refreshAuthToken,  // Import the refreshAuthToken controller function
  getUserById
} from '../controllers/authController.js';
import { check } from 'express-validator';
import { requireAuth } from '../middlewares/authMiddleware.js';  // Import the requireAuth middleware

const router = express.Router();

router.post('/contact', contactUs);

router.post('/forgot-password', forgotPassword);

router.post(
  '/reset-password',
  [
    check('token').notEmpty().withMessage('Token is required'),
    check('newPassword')
      .isLength({ min: 8 })
      .matches(/[A-Z]/)
      .matches(/[a-z]/)
      .matches(/\d/),
  ],
  resetPassword
);

router.post(
  '/register',
  rateLimiter,
  [
    check('username').notEmpty(),
    check('email').isEmail(),
    check('password').isLength({ min: 8 }),
    check('phone').notEmpty(),
    check('address').notEmpty(),
  ],
  registerUser
);

router.post(
  '/login',
  rateLimiter,
  [
    check('email').isEmail(),
    check('password').notEmpty(),
  ],
  loginUser
);

// Fetch user profile route with the requireAuth middleware
router.get('/profile', requireAuth, getUserProfile);  // Apply requireAuth to ensure user is authenticated
// Add this route for updating the profile
router.put('/profile', requireAuth, updateUserProfile);
router.post('/refresh-token', refreshAuthToken);
router.get('/users/:userId', requireAuth,getUserById);
export default router;

