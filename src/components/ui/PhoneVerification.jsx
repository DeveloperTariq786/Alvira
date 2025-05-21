'use client';

import { useState } from 'react';
import { verifyPhone, createUser, resendOTP, checkUserExists } from '@/utils/api';

const PhoneVerification = ({ onSuccess, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    phone: initialData.phone || '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneSubmit = async () => {
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      setError('Please enter a valid 10-digit phone number starting with 6-9');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if user exists
      const checkResponse = await checkUserExists(formData.phone);
      let apiResponse;

      if (checkResponse.error) {
        throw new Error(checkResponse.error);
      }

      if (checkResponse.exists) {
        if (checkResponse.isVerified) {
          // Handle case where user is already verified - maybe show message?
          setError('This phone number is already verified.');
          setLoading(false);
          return; // Or potentially proceed to OTP verification if login is intended
        } else {
          // User exists but not verified, resend OTP
          apiResponse = await resendOTP(formData.phone);
        }
      } else {
        // User does not exist, create user (which sends OTP)
        apiResponse = await createUser({
          name: formData.name || 'Guest User', // Use name if provided
          phone: formData.phone,
        });
      }

      if (apiResponse.error) {
        setError(apiResponse.error);
        // Still set otpSent to true even on error, to allow verification attempt if OTP was logged
        setOtpSent(true); 
        startResendTimer();
      } else {
        setOtpSent(true);
        startResendTimer();
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      // Consider if otpSent should be true here depending on error type
      // setOtpSent(true); 
      // startResendTimer();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      setError('Please enter verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await verifyPhone({
        phone: formData.phone,
        verificationToken: formData.otp
      });

      if (response.error) {
        setError(response.error);
      } else {
        onSuccess(response);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await resendOTP(formData.phone);

      if (response.error) {
        setError(response.error);
      } else {
        startResendTimer();
        setError('New verification code sent!');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-md w-full">
      <h3 className="text-xl font-medium text-gray-900 mb-4">
        {otpSent ? 'Enter Verification Code' : 'Phone Verification'}
      </h3>

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        {!otpSent ? (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#c5a87f] focus:outline-none focus:ring-1 focus:ring-[#c5a87f]"
                placeholder="Enter your name"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#c5a87f] focus:outline-none focus:ring-1 focus:ring-[#c5a87f]"
                  placeholder="Enter 10-digit number"
                  maxLength="10"
                  pattern="[6-9][0-9]{9}"
                  required
                />
              </div>
              <button
                type="button"
                onClick={handlePhoneSubmit}
                disabled={loading}
                className="mt-7 px-4 py-2 bg-[#c5a87f] text-white rounded-md hover:bg-[#b39770] transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Sending...' : 'Get OTP'}
              </button>
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Verification Code*
            </label>
            <input
              type="text"
              id="otp"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#c5a87f] focus:outline-none focus:ring-1 focus:ring-[#c5a87f]"
              placeholder="Enter 6-digit code"
              maxLength="6"
              pattern="[0-9]{6}"
              required
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendTimer > 0}
                className="text-sm text-[#c5a87f] hover:text-[#b39770] disabled:text-gray-400"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
              </button>
              <span className="text-sm text-gray-500">
                Sent to {formData.phone}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {otpSent && (
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#c5a87f] text-white rounded-md hover:bg-[#b39770] transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PhoneVerification;