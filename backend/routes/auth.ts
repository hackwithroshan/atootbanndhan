
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User';
import auth, { AuthRequest } from '../middleware/auth';
import { UserStatus } from '../../types';

const router = express.Router();

// Helper to check if email config is present
const isEmailConfigured = () => process.env.EMAIL_USER && process.env.EMAIL_PASS;

const createTransporter = () => {
    if (!isEmailConfigured()) return null;
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '465'),
        secure: (process.env.EMAIL_PORT === '465'),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        connectionTimeout: 5000,
    });
};

router.post('/send-otp', [check('email', 'Please include a valid email').isEmail()], async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email } = req.body;
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await User.findOneAndUpdate(
            { email },
            { emailOtp: otp, emailOtpExpires: otpExpires },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (!isEmailConfigured()) {
            console.warn("⚠️ Email credentials missing. Returning Mock OTP.");
            return res.status(200).json({ msg: 'OTP Sent (Mock Mode)', debug_otp: otp });
        }

        const transporter = createTransporter();
        await transporter!.sendMail({
            from: `"Atut Bandhan" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your OTP Code',
            html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
        });

        res.status(200).json({ msg: 'OTP sent to your email address.' });
    } catch (err: any) {
        console.error("OTP Route Error:", err);
        res.status(500).json({ msg: 'Server Error during OTP generation.' });
    }
});

router.post('/verify-otp', [check('email').isEmail(), check('otpEmail').not().isEmpty()], async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { email, otpEmail } = req.body;
        const user = await User.findOne({ email, emailOtp: otpEmail, emailOtpExpires: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ msg: 'Invalid or expired OTP.' });

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

router.post('/register', [ /* ... validation checks ... */ ], async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { fullName, email, password, ...profileData } = req.body;
      
        const user = await User.findOne({ email });
        if (!user || !user.isEmailVerified) {
            return res.status(400).json({ msg: 'Email not verified or user does not exist.' });
        }
        
        const finalMobileNumber = req.body.mobileNumber?.trim() || undefined;
        Object.assign(user, { fullName, password, status: UserStatus.ACTIVE, mobileNumber: finalMobileNumber, ...profileData });
        await user.save();
      
        const payload = { user: { id: (user as any).id } };
        jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err: any) {
        console.error("Registration Error:", err);
        if (err.code === 11000) return res.status(400).json({ msg: 'A user with this email or mobile already exists.' });
        res.status(500).json({ msg: 'Server Error during registration.' });
    }
});

router.post('/login', [check('email').isEmail(), check('password').exists()], async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !user.password) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await (user as any).comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
        
        const payload = { user: { id: (user as any).id } };
        jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err: any) {
        console.error("Login Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.get('/me', auth, async (req: AuthRequest, res: ExpressResponse) => {
    try {
        const user = await User.findById(req.user?.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err: any) {
        console.error("Me Route Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.post('/forgot-password', [check('email').isEmail()], async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: 'User not found.' });

        const otp = crypto.randomInt(100000, 999999).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        if (isEmailConfigured()) {
            await createTransporter()!.sendMail({ to: email, subject: 'Password Reset OTP', html: `<p>Your reset OTP is <strong>${otp}</strong></p>` });
            return res.status(200).json({ msg: 'Password reset OTP sent.' });
        }
        return res.status(200).json({ msg: 'OTP Sent (Mock Mode)', debug_otp: otp });
    } catch (err: any) {
        console.error("Forgot Password Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.post('/reset-password', [check('email').isEmail(), check('otp').not().isEmpty(), check('newPassword').isLength({ min: 6 })], async (req: ExpressRequest, res: ExpressResponse) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email, resetPasswordOtp: otp, resetPasswordOtpExpires: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ msg: 'Invalid or expired OTP.' });

        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpires = undefined;
        await user.save();
        
        res.status(200).json({ msg: 'Password has been reset successfully.' });
    } catch (err: any) {
        console.error("Reset Password Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
