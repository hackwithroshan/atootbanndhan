
import React, { useState, useCallback } from 'react';
import {
  SignupFormData, Gender, MaritalStatus, Religion, MotherTongue,
  EducationLevel, OccupationCategory, HeightUnit, WeightUnit
} from '../../types';
import {
  GENDER_OPTIONS, RELIGION_OPTIONS, MARITAL_STATUS_OPTIONS, MOTHER_TONGUE_OPTIONS,
  EDUCATION_OPTIONS, OCCUPATION_OPTIONS, HEIGHT_UNIT_OPTIONS, SIGNUP_STEPS,
  MANGLIK_STATUS_OPTIONS, PROFILE_CREATED_BY_OPTIONS, WEIGHT_UNIT_OPTIONS
} from '../../constants';
import MultiStepForm from '../MultiStepForm';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { UserIcon } from '../icons/UserIcon';
import { MailIcon } from '../icons/MailIcon';
import { PhoneIcon } from '../icons/PhoneIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { LockClosedIcon } from '../icons/LockClosedIcon';
import { EyeIcon } from '../icons/EyeIcon';
import { EyeSlashIcon } from '../icons/EyeSlashIcon';
import { BriefcaseIcon } from '../icons/BriefcaseIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';
import { LanguageIcon } from '../icons/LanguageIcon';
import { CameraIcon } from '../icons/CameraIcon';
import { BuildingOfficeIcon } from '../icons/BuildingOfficeIcon';
import { IdentificationIcon } from '../icons/IdentificationIcon';
import Button from '../ui/Button';
import { API_URL } from '../../utils/api';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';


interface SignupFormProps {
  onAuthSuccess: (authData: { token: string }) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onAuthSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    mobileNumber: '',
    otpEmail: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    marketingConsent: false,
    maritalStatus: '',
    religion: '',
    caste: '',
    subCaste: '',
    manglikStatus: '',
    profileCreatedBy: '',
    city: '',
    state: '',
    country: '',
    motherTongue: '',
    education: '',
    occupation: '',
    heightValue: '',
    heightUnit: HeightUnit.FEET_INCHES,
    weightValue: '',
    weightUnit: WeightUnit.KG,
    photo: null,
    profileBio: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Email OTP State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailOtpSuccess, setEmailOtpSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, photo: e.target.files![0] }));
    }
  };
  
  const handleSendEmailOtp = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({...prev, email: 'Please enter a valid email address first.'}));
      return;
    }
    setIsSendingEmailOtp(true);
    setEmailOtpError('');
    setEmailOtpSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        throw new Error(`Server Error: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) throw new Error(data.msg || 'Failed to send OTP.');
      setEmailOtpSent(true);
      setEmailOtpSuccess(data.msg);
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      if (errorMessage.toLowerCase().includes('server error') || errorMessage.toLowerCase().includes('failed to fetch')) {
        setEmailOtpError('Could not connect to the server. Please check your connection and try again.');
      } else {
        setEmailOtpError(errorMessage);
      }
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otpEmail) {
      setErrors(prev => ({ ...prev, otpEmail: 'Please enter the OTP.' }));
      return;
    }
    setIsVerifyingOtp(true);
    setEmailOtpError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otpEmail: formData.otpEmail }),
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        throw new Error(`Server Error: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) throw new Error(data.msg || 'Failed to verify OTP.');
      setIsEmailVerified(true);
      setEmailOtpSuccess('Email verified! You can now complete your details.');
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      if (errorMessage.toLowerCase().includes('server error') || errorMessage.toLowerCase().includes('failed to fetch')) {
        setEmailOtpError('Could not connect to the server. Please check your connection and try again.');
      } else {
        setEmailOtpError(errorMessage);
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};
    const stepFields = SIGNUP_STEPS[step - 1].fields;

    if (step === 1) {
        if (!isEmailVerified) {
            newErrors.email = 'Please verify your email to proceed.';
        } else {
            // Validate these after email verification
            if (!formData.fullName) newErrors.fullName = 'This field is required';
            if (!formData.gender) newErrors.gender = 'This field is required';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'This field is required';
            if (!formData.mobileNumber) newErrors.mobileNumber = 'This field is required';
        }
    } else if (stepFields) { // For other steps
        for (const field of stepFields) {
            const key = field as keyof SignupFormData;
            const value = formData[key];
            if (value === undefined || value === null || (value === '' && typeof value !== 'boolean')) {
                 if (key !== 'confirmPassword' && key !== 'termsAccepted') { // Handled separately
                    (newErrors as any)[key] = 'This field is required';
                }
            }
        }
    }
    
    // Custom validations for step 2
    if (step === 2) {
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.termsAccepted) {
            newErrors.termsAccepted = 'You must accept the terms and conditions';
        }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEmailVerified]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) { // Final validation
        setApiError("Please fill all required fields correctly before completing your profile.");
        return;
    }
    if(!isEmailVerified) {
      setApiError("Please verify your email before completing your profile.");
      return;
    }
    setIsLoading(true);
    setApiError('');
    
    try {
        const payload = { ...formData };
        
        // Handle image upload to Cloudinary if a photo is present
        if (payload.photo) {
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('file', payload.photo);
            cloudinaryFormData.append('upload_preset', 'attut_bandhan'); // Your Cloudinary preset

            const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dvrqft9ov/image/upload', {
                method: 'POST',
                body: cloudinaryFormData,
            });

            if (!cloudinaryRes.ok) {
                const errorData = await cloudinaryRes.json();
                console.error("Cloudinary Error:", errorData);
                throw new Error('Image upload failed. Please try a different image or check preset name.');
            }

            const cloudinaryData = await cloudinaryRes.json();
            payload.profilePhotoUrl = cloudinaryData.secure_url;
        }

        // Clean up data for backend
        delete (payload as any).photo;
        delete (payload as any).confirmPassword;
        
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await res.json();
        } else {
            const text = await res.text();
            console.error("Non-JSON response from server:", text);
            throw new Error(`Server Error: ${res.status} ${res.statusText}.`);
        }

        if (!res.ok) {
            throw new Error(data.msg || 'An error occurred during registration.');
        }

        onAuthSuccess(data);

    } catch (err: any) {
        const errorMessage = err.message || 'An unknown error occurred during registration.';
        if (errorMessage.toLowerCase().includes('server error') || errorMessage.toLowerCase().includes('failed to fetch')) {
            setApiError('A problem occurred on our end. Please try again in a few moments.');
        } else {
            setApiError(errorMessage);
        }
        // Check for specific field errors to guide the user
        if (errorMessage.toLowerCase().includes('email')) {
            setErrors(prev => ({...prev, email: errorMessage}));
            setCurrentStep(1);
        }
    } finally {
        setIsLoading(false);
    }
  };

  // Render steps...
  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Email Verification Section */}
      <div className="p-3 border rounded-lg bg-gray-50/50">
        <h3 className="text-sm font-semibold mb-2 text-gray-600">A. Verify Your Email</h3>
        <div className="flex items-end gap-2">
          <Input type="email" id="email" name="email" label="Email Address" value={formData.email} onChange={handleChange} error={errors.email} icon={<MailIcon className="w-5 h-5 text-gray-400" />} required disabled={isSendingEmailOtp || emailOtpSent} className="flex-grow"/>
          <Button type="button" onClick={handleSendEmailOtp} isLoading={isSendingEmailOtp} disabled={emailOtpSent || isSendingEmailOtp} className="whitespace-nowrap h-11">
            {emailOtpSent ? 'OTP Sent' : 'Send OTP'}
          </Button>
        </div>
        {emailOtpError && (
            <div className="flex items-start p-3 mt-2 space-x-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg animate-fadeIn">
                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{emailOtpError}</span>
            </div>
        )}
        {emailOtpSuccess && !isEmailVerified && <p className="text-xs text-green-600 mt-1">{emailOtpSuccess}</p>}
        {emailOtpSent && !isEmailVerified && (
          <div className="flex items-end gap-2 mt-2 animate-fadeIn">
              <Input type="text" id="otpEmail" name="otpEmail" label="Email OTP" value={formData.otpEmail} onChange={handleChange} error={errors.otpEmail} placeholder="Enter 6-digit OTP from email" required className="flex-grow"/>
              <Button type="button" onClick={handleVerifyOtp} isLoading={isVerifyingOtp} className="whitespace-nowrap h-11">
                  Verify Email
              </Button>
          </div>
        )}
        {isEmailVerified && <p className="text-sm font-semibold text-green-600 mt-2 animate-fadeIn">✓ Email Verified Successfully!</p>}
      </div>
       
       {/* Personal Details Section */}
       {isEmailVerified && (
        <div className="p-3 border rounded-lg bg-gray-50/50 space-y-4 pt-4 animate-fadeIn">
            <h3 className="text-sm font-semibold text-gray-600">B. Your Basic Details</h3>
            <Input id="fullName" name="fullName" label="Full Name" value={formData.fullName} onChange={handleChange} error={errors.fullName} icon={<UserIcon className="w-5 h-5 text-gray-400" />} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select id="gender" name="gender" label="Gender" options={GENDER_OPTIONS} value={formData.gender} onChange={handleChange} error={errors.gender} placeholder="Select Gender" required />
                <Input type="date" id="dateOfBirth" name="dateOfBirth" label="Date of Birth" value={formData.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} icon={<CalendarIcon className="w-5 h-5 text-gray-400" />} required />
            </div>
            {/* Added Mobile Number Input without OTP requirement */}
            <Input 
                id="mobileNumber" 
                name="mobileNumber" 
                label="Mobile Number" 
                value={formData.mobileNumber || ''} 
                onChange={handleChange} 
                error={errors.mobileNumber} 
                placeholder="Enter your mobile number" 
                icon={<PhoneIcon className="w-5 h-5 text-gray-400" />} 
                type="tel"
                required 
            />
        </div>
       )}
    </div>
  );
  
  const renderStep2 = () => (
     <div className="space-y-4">
        <Input type={showPassword ? 'text' : 'password'} id="password" name="password" label="Password" value={formData.password} onChange={handleChange} error={errors.password} icon={<LockClosedIcon className="w-5 h-5 text-gray-400" />} rightIcon={showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />} onRightIconClick={() => setShowPassword(!showPassword)} required />
        <Input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon={<LockClosedIcon className="w-5 h-5 text-gray-400" />} rightIcon={showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />} onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)} required />
        <div className="flex items-start">
            <input id="termsAccepted" name="termsAccepted" type="checkbox" checked={!!formData.termsAccepted} onChange={handleChange} className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded mt-0.5" />
            <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-700">I accept the <a href="#" className="text-rose-600 hover:underline">Terms & Conditions</a> and <a href="#" className="text-rose-600 hover:underline">Privacy Policy</a>.</label>
        </div>
        {errors.termsAccepted && <p className="text-xs text-red-600">{errors.termsAccepted}</p>}
        <div className="flex items-start">
            <input id="marketingConsent" name="marketingConsent" type="checkbox" checked={!!formData.marketingConsent} onChange={handleChange} className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded mt-0.5" />
            <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-700">I would like to receive marketing emails and offers.</label>
        </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select id="profileCreatedBy" name="profileCreatedBy" label="Profile Created By (Optional)" options={PROFILE_CREATED_BY_OPTIONS} value={formData.profileCreatedBy} onChange={handleChange} error={errors.profileCreatedBy} placeholder="Select option" />
            <Select id="maritalStatus" name="maritalStatus" label="Marital Status" options={MARITAL_STATUS_OPTIONS} value={formData.maritalStatus} onChange={handleChange} error={errors.maritalStatus} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex space-x-2">
                <Input id="heightValue" name="heightValue" label="Height" value={formData.heightValue || ''} onChange={handleChange} error={errors.heightValue} required className="flex-grow" placeholder="e.g. 5.5" type="number" step="0.01" />
                <Select id="heightUnit" name="heightUnit" label="Unit" options={HEIGHT_UNIT_OPTIONS} value={formData.heightUnit || ''} onChange={handleChange} className="w-24 min-w-[80px]" />
            </div>
             <div className="flex space-x-2">
                <Input id="weightValue" name="weightValue" label="Weight (Optional)" value={formData.weightValue || ''} onChange={handleChange} error={errors.weightValue} className="flex-grow" placeholder="e.g. 65" type="number" />
                <Select id="weightUnit" name="weightUnit" label="Unit" options={WEIGHT_UNIT_OPTIONS} value={formData.weightUnit || ''} onChange={handleChange} className="w-24 min-w-[80px]" />
             </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select id="religion" name="religion" label="Religion" options={RELIGION_OPTIONS} value={formData.religion} onChange={handleChange} error={errors.religion} required />
            <Select id="manglikStatus" name="manglikStatus" label="Manglik Status (Optional)" options={MANGLIK_STATUS_OPTIONS} value={formData.manglikStatus} onChange={handleChange} error={errors.manglikStatus} placeholder="Select Status" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="caste" name="caste" label="Caste / Community" value={formData.caste} onChange={handleChange} error={errors.caste} icon={<IdentificationIcon className="w-5 h-5 text-gray-400" />} required />
            <Input id="subCaste" name="subCaste" label="Sub-Caste (Optional)" value={formData.subCaste} onChange={handleChange} error={errors.subCaste} icon={<IdentificationIcon className="w-5 h-5 text-gray-400" />} />
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <Input id="city" name="city" label="City" value={formData.city} onChange={handleChange} error={errors.city} icon={<BuildingOfficeIcon className="w-5 h-5 text-gray-400" />} required />
             <Input id="state" name="state" label="State" value={formData.state} onChange={handleChange} error={errors.state} required />
             <Input id="country" name="country" label="Country" value={formData.country} onChange={handleChange} error={errors.country} required />
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <Select id="motherTongue" name="motherTongue" label="Mother Tongue" options={MOTHER_TONGUE_OPTIONS} value={formData.motherTongue} onChange={handleChange} error={errors.motherTongue} icon={<LanguageIcon className="w-5 h-5 text-gray-400" />} required />
             <Select id="education" name="education" label="Highest Education" options={EDUCATION_OPTIONS} value={formData.education} onChange={handleChange} error={errors.education} icon={<AcademicCapIcon className="w-5 h-5 text-gray-400" />} required />
             <Select id="occupation" name="occupation" label="Occupation" options={OCCUPATION_OPTIONS} value={formData.occupation} onChange={handleChange} error={errors.occupation} icon={<BriefcaseIcon className="w-5 h-5 text-gray-400" />} required />
         </div>
          <Input type="file" id="photo" name="photo" label="Upload Profile Photo" onChange={handleFileChange} error={errors.photo} icon={<CameraIcon className="w-5 h-5 text-gray-400"/>} accept="image/*" />
          <div>
            <label htmlFor="profileBio" className="block text-xs font-medium text-gray-600 mb-0.5">About Yourself (Bio)</label>
            <textarea id="profileBio" name="profileBio" value={formData.profileBio || ''} onChange={handleChange} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Write a few lines about yourself..."></textarea>
          </div>
    </div>
  );

  const renderStep4 = () => (
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">You're All Set!</h3>
        <p className="text-gray-600 mt-2">Please review your details. Click "Complete Profile" to create your account.</p>
        {isLoading && <p className="mt-4">Creating your profile...</p>}
      </div>
  );


  return (
    <>
      {apiError && (
        <div className="flex items-start p-4 mb-4 space-x-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg animate-fadeIn" role="alert">
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Registration Error</p>
            <p className="text-xs mt-1">{apiError}</p>
          </div>
        </div>
      )}
      <MultiStepForm steps={SIGNUP_STEPS} onFormSubmit={handleSubmit} validateStep={validateStep} currentStep={currentStep} setCurrentStep={setCurrentStep}>
        {renderStep1()}
        {renderStep2()}
        {renderStep3()}
        {renderStep4()}
      </MultiStepForm>
    </>
  );
};

export default SignupForm;
