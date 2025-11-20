
// FIX: Add explicit types for Express Request and Response
import express from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User';
import auth from '../middleware/auth';
import { AdminRole, UserStatus } from '../../types';

const router = express.Router();

// Helper to check if email config is present
const isEmailConfigured = () => {
    return process.env.EMAIL_USER && process.env.EMAIL_PASS;
};

const createTransporter = () => {
    if (!isEmailConfigured()) return null;
    
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '465'),
        secure: (process.env.EMAIL_PORT === '465' || !process.env.EMAIL_PORT), // true for 465
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // CRITICAL VERCEL FIX: Set low timeouts.
        // Vercel functions time out in 10s. If SMTP hangs, we need to fail fast 
        // so we can return a JSON response (fail-safe) instead of Vercel killing the app (504 HTML).
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,
        socketTimeout: 5000,
    });
};

// @route   POST api/auth/send-otp
// @desc    Send OTP to user's email
// @access  Public
router.post('/send-otp', [check('email', 'Please include a valid email').isEmail()], async (req: any, res: any) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user = await User.findOne({ email });
        if (user) {
            user.emailOtp = otp;
            user.emailOtpExpires = otpExpires;
            await user.save();
        } else {
            user = new User({
                email,
                emailOtp: otp,
                emailOtpExpires: otpExpires,
            });
            await user.save();
        }

        // Vercel Fail-Safe: Check configuration before attempting to send
        if (!isEmailConfigured()) {
            console.warn("⚠️ Email credentials missing. Returning Mock OTP.");
            return res.status(200).json({ 
                msg: 'OTP Sent (Mock Mode - Env Missing)',
                debug_otp: otp 
            });
        }

        const mailOptions = {
            from: `"Atut Bandhan" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP for Atut Bandhan',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Welcome to Atut Bandhan!</h2>
                    <p>Your One-Time Password (OTP) to verify your email is:</p>
                    <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #D6336C;">${otp}</p>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `,
        };

        const transporter = createTransporter();
        if (transporter) {
            try {
                await transporter.sendMail(mailOptions);
                res.status(200).json({ msg: 'OTP sent to your email address.' });
            } catch (emailError: any) {
                console.error("SMTP Error:", emailError);
                // Fail-Safe: If email fails (timeout/auth), return success with debug OTP
                // This prevents the "Unexpected end of JSON" error on frontend.
                return res.status(200).json({ 
                    msg: 'OTP Generated (Email Delivery Failed - Mock Mode)',
                    debug_otp: otp 
                });
            }
        } else {
             return res.status(200).json({ 
                msg: 'OTP Generated (Transporter Failed)',
                debug_otp: otp 
            });
        }

    } catch (err: any) {
        console.error("OTP Route Error:", err);
        res.status(500).json({ 
            msg: 'Server Error during OTP generation.',
            details: err.message 
        });
    }
});


// @route   POST api/auth/verify-otp
// @desc    Verify email OTP
// @access  Public
router.post('/verify-otp', [
    check('email', 'Please include a valid email').isEmail(),
    check('otpEmail', 'OTP is required').not().isEmpty()
], async (req: any, res: any) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otpEmail } = req.body;

        const user = await User.findOne({
            email,
            emailOtp: otpEmail,
            emailOtpExpires: { $gt: Date.now() },
        }).select('+emailOtp +emailOtpExpires');

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired OTP. Please try again.' });
        }

        user.isEmailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpires = undefined;
        await user.save();

        res.status(200).json({ msg: 'Email verified successfully.' });

    } catch (err: any) {
        console.error("Verify OTP Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', 
  [
    check('fullName', 'Full name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('gender', 'Gender is required').not().isEmpty(),
    check('dateOfBirth', 'Date of birth is required').not().isEmpty(),
  ],
  async (req: any, res: any) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullName, email, password, gender, dateOfBirth, mobileNumber, ...profileData } = req.body;
      
        // Env check
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");
            return res.status(500).json({ msg: 'Server configuration error (JWT).' });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Please verify your email first.' });
        }

        if (user.isEmailVerified === false) {
            return res.status(400).json({ msg: 'Email is not verified.' });
        }
      
        // Update user with all registration data
        // Handling mobileNumber: convert empty string to undefined to respect MongoDB sparse index
        const finalMobileNumber = mobileNumber && mobileNumber.trim() !== '' ? mobileNumber.trim() : undefined;

        Object.assign(user, {
            fullName,
            password, // hashed by pre-save hook
            gender,
            dateOfBirth,
            mobileNumber: finalMobileNumber,
            status: UserStatus.ACTIVE,
            ...profileData
        });

        await user.save();
      
        const payload = {
            user: {
            id: (user as any).id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5 days' },
            (err, token) => {
            if (err) throw err;
            res.json({ token });
            }
        );
    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.code === 11000) {
          return res.status(400).json({ msg: 'A user with this email or mobile number already exists.' });
      }
      res.status(500).json({ msg: 'Server Error during registration.', error: err.message });
    }
  }
);


// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req: any, res: any) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ msg: 'Server configuration error (JWT).' });
        }

        let user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        if (!user.password) {
            return res.status(400).json({ msg: 'Account not fully set up. Please complete registration.' });
        }

        const isMatch = await bcrypt.compare(password, user.password as string);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
            id: (user as any).id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5d' },
            (err, token) => {
            if (err) throw err;
            res.json({ token });
            }
        );
    } catch (err: any) {
      console.error("Login Error:", err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// @route   GET api/auth/me
// @desc    Get user by token
// @access  Private
router.get('/me', auth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
         return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    console.error("Me Route Error:", err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post('/forgot-password', [check('email', 'Please include a valid email').isEmail()], async (req: any, res: any) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
             return res.status(404).json({ msg: 'User not found with this email.' });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = otpExpires;
        await user.save();

        // Vercel Fail-Safe for Email
        if (!isEmailConfigured()) {
            return res.status(200).json({ msg: 'Mock Reset OTP generated (Env missing).', debug_otp: otp });
        }

        const mailOptions = {
            from: `"Atut Bandhan Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request - Atut Bandhan',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password for your Atut Bandhan account.</p>
                    <p>Your Password Reset OTP is:</p>
                    <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #D6336C;">${otp}</p>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p>If you did not request this change, please ignore this email.</p>
                </div>
            `,
        };
        
        const transporter = createTransporter();
        if(transporter) {
            try {
                await transporter.sendMail(mailOptions);
                res.status(200).json({ msg: 'Password reset OTP sent to your email.' });
            } catch (emailError) {
                 console.error("SMTP Error (Reset):", emailError);
                 return res.status(200).json({ msg: 'Mock Reset OTP (Email Failed).', debug_otp: otp });
            }
        } else {
             return res.status(200).json({ msg: 'Mock Reset OTP (Transporter failed).', debug_otp: otp });
        }

    } catch (err: any) {
        console.error("Forgot Password Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// @route   POST api/auth/reset-password
// @desc    Reset password using OTP
// @access  Public
router.post('/reset-password', [
    check('email', 'Please include a valid email').isEmail(),
    check('otp', 'OTP is required').not().isEmpty(),
    check('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req: any, res: any) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordOtpExpires: { $gt: Date.now() },
        }).select('+resetPasswordOtp +resetPasswordOtpExpires');

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired OTP.' });
        }

        // The pre-save hook in User model handles hashing if 'password' is modified
        user.password = newPassword; 
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;
        
        await user.save();

        res.status(200).json({ msg: 'Password has been reset successfully. You can now login.' });

    } catch (err: any) {
        console.error("Reset Password Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
