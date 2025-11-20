
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { MailIcon } from '../icons/MailIcon';
import { LockClosedIcon } from '../icons/LockClosedIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeSlashIcon } from '../icons/EyeSlashIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { API_URL } from '../../utils/api';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { CheckIcon } from '../icons/CheckIcon';

interface LoginFormProps {
  onAuthSuccess: (authData: { token: string }) => void;
}

type LoginView = 'LOGIN' | 'FORGOT_PASSWORD_EMAIL' | 'FORGOT_PASSWORD_RESET';

const LoginForm: React.FC<LoginFormProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<LoginView>('LOGIN');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password State
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        // If response is not JSON (e.g., Vercel 500/504 HTML page), read text to avoid crash
        const text = await res.text();
        console.error("Non-JSON response from server:", text);
        throw new Error(`Server Error: ${res.status} ${res.statusText}. Please try again later.`);
      }

      if (!res.ok) {
        throw new Error(data.msg || 'An error occurred during login.');
      }
      
      onAuthSuccess(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
      setSuccessMsg('');
      
      try {
          const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
          });
          
          const contentType = res.headers.get("content-type");
          let data;
          if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await res.json();
          } else {
            const text = await res.text();
            console.error("Non-JSON response:", text);
            throw new Error(`Server Error: ${res.status} ${res.statusText}`);
          }

          if(!res.ok) throw new Error(data.msg || 'Failed to send OTP.');
          
          setSuccessMsg(data.msg);
          setView('FORGOT_PASSWORD_RESET');

      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmNewPassword) {
          setError("Passwords do not match.");
          return;
      }
      if (newPassword.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
      }

      setIsLoading(true);
      setError('');
      setSuccessMsg('');

      try {
          const res = await fetch(`${API_URL}/api/auth/reset-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, otp: resetOtp, newPassword }),
          });

          const contentType = res.headers.get("content-type");
          let data;
          if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await res.json();
          } else {
            const text = await res.text();
            console.error("Non-JSON response:", text);
            throw new Error(`Server Error: ${res.status} ${res.statusText}`);
          }

          if(!res.ok) throw new Error(data.msg || 'Failed to reset password.');

          setSuccessMsg(data.msg);
          // Reset fields and go back to login after brief delay or immediately
          setPassword(''); // Clear old password state
          setView('LOGIN');
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  // --- RENDER HELPERS ---

  const renderHeader = (title: string, subtitle?: string) => (
      <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
  );

  const renderMessage = () => (
      <>
        {error && (
            <div className="flex items-start p-3 mb-4 space-x-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg animate-fadeIn" role="alert">
                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
            </div>
        )}
        {successMsg && (
             <div className="flex items-start p-3 mb-4 space-x-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg animate-fadeIn" role="alert">
                <CheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
            </div>
        )}
      </>
  );

  if (view === 'LOGIN') {
      return (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {renderMessage()}
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<MailIcon className="w-5 h-5 text-gray-400" />}
            required
            autoComplete="email"
          />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<LockClosedIcon className="w-5 h-5 text-gray-400" />}
            rightIcon={showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            required
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-gray-700">Remember me</label>
            </div>
            <button type="button" onClick={() => { setError(''); setSuccessMsg(''); setView('FORGOT_PASSWORD_EMAIL'); }} className="font-medium text-rose-600 hover:text-rose-500">
              Forgot your password?
            </button>
          </div>
          <Button type="submit" variant="primary" className="w-full !py-3" isLoading={isLoading} disabled={isLoading}>
            Log in
          </Button>
        </form>
      );
  }

  if (view === 'FORGOT_PASSWORD_EMAIL') {
      return (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
             <div className="flex items-center mb-4">
                <button type="button" onClick={() => setView('LOGIN')} className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
             </div>
             <p className="text-sm text-gray-600 mb-4">Enter your email address and we'll send you an OTP to reset your password.</p>
             {renderMessage()}
             <Input
                id="reset-email"
                name="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<MailIcon className="w-5 h-5 text-gray-400" />}
                required
                autoComplete="email"
              />
              <Button type="submit" variant="primary" className="w-full !py-3" isLoading={isLoading} disabled={isLoading}>
                Send OTP
              </Button>
          </form>
      );
  }

  if (view === 'FORGOT_PASSWORD_RESET') {
      return (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="flex items-center mb-4">
                <button type="button" onClick={() => setView('FORGOT_PASSWORD_EMAIL')} className="text-gray-500 hover:text-gray-700 mr-2">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Create New Password</h2>
             </div>
             <p className="text-sm text-gray-600 mb-2">OTP sent to <strong>{email}</strong></p>
             {renderMessage()}
             <Input
                id="otp"
                name="otp"
                type="text"
                label="Enter OTP"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                placeholder="6-digit code"
                required
              />
             <Input
                id="newPassword"
                name="newPassword"
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                label="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" className="w-full !py-3" isLoading={isLoading} disabled={isLoading}>
                Reset Password
              </Button>
          </form>
      );
  }

  return null;
};

export default LoginForm;
