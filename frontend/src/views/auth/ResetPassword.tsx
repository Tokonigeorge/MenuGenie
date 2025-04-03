import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { toast, ToastContainer } from 'react-toastify';
import Header from '../../components/header';
import RightArrowIcon from '../../components/rightArrowIcon';

const ResetPasswordView = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isValidCode, setIsValidCode] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyCode = async () => {
      const code = searchParams.get('oobCode');
      if (!code) {
        toast.error('Invalid reset link');
        navigate('/forgot-password');
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, code);
        setEmail(email);
        setOobCode(code);
        setIsValidCode(true);
      } catch (error) {
        console.error('Error verifying reset code:', error);
        toast.error('This reset link is invalid or has expired');
        navigate('/forgot-password');
      }
    };

    verifyCode();
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!oobCode) {
      toast.error('Invalid reset code');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success('Password reset successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      if (error.code === 'auth/expired-action-code') {
        toast.error('Reset link has expired. Please request a new one');
      } else {
        toast.error('Failed to reset password. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <Header showLogout={false} />
      <div className='flex-1 flex py-10 justify-center px-4'>
        <div className='w-full max-w-md p-8 bg-white rounded-lg'>
          <h1 className='text-center text-xl font-medium text-gray-800 mb-4'>
            Reset Your Password
          </h1>

          {isValidCode && (
            <p className='text-center text-sm text-gray-500 mb-8 px-4'>
              Setting new password for <strong>{email}</strong>
            </p>
          )}

          {isValidCode ? (
            <form onSubmit={handleSubmit}>
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-900 mb-1'>
                  New Password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900'
                    placeholder='Minimum 8 characters'
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    className='absolute right-3 top-1/2 transform -translate-y-1/2'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 20 20'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M17.2559 2.74408C17.5813 3.06951 17.5813 3.59715 17.2559 3.92259L3.92255 17.2559C3.59711 17.5814 3.06947 17.5814 2.74404 17.2559C2.4186 16.9305 2.4186 16.4028 2.74404 16.0774L16.0774 2.74408C16.4028 2.41864 16.9304 2.41864 17.2559 2.74408Z'
                        fill='#667185'
                      />
                      <path
                        d='M13.1662 4.4767C12.2276 4.03469 11.1694 3.75 9.99994 3.75C7.54653 3.75 5.58226 5.00308 4.18629 6.33307C2.7871 7.66611 1.87921 9.14973 1.51982 9.7915C1.28431 10.2121 1.25626 10.7143 1.44958 11.1603C1.58459 11.4718 1.8142 11.9544 2.15261 12.5143C2.39065 12.9082 2.90294 13.0346 3.29684 12.7965C3.69073 12.5585 3.81708 12.0462 3.57903 11.6523C3.30684 11.2019 3.11797 8.8124 3.0034 10.5537C3.34153 9.95778 4.14233 8.67693 5.33593 7.53975C6.56883 6.36513 8.14165 5.41667 9.99994 5.41667C10.6683 5.41667 11.2998 5.53937 11.8918 5.75116L13.1662 4.4767Z'
                        fill='#667185'
                      />
                      <path
                        d='M14.7421 7.61491C15.8925 8.73288 16.6658 9.97087 16.9965 10.5537C16.8819 10.8124 16.693 11.2019 16.4209 11.6523C16.1828 12.0462 16.3092 12.5585 16.7031 12.7965C17.0969 13.0346 17.6092 12.9082 17.8473 12.5143C18.1857 11.9544 18.4153 11.4718 18.5503 11.1603C18.7436 10.7143 18.7156 10.2121 18.4801 9.7915C18.1299 9.16625 17.2592 7.74193 15.9207 6.43629L14.7421 7.61491Z'
                        fill='#667185'
                      />
                      <path
                        d='M9.99996 6.66667C10.3028 6.66667 10.5981 6.69898 10.8826 6.76034L9.16774 8.47519C8.4565 8.7262 7.89283 9.28987 7.64182 10.0011L5.92696 11.716C5.8656 11.4315 5.83329 11.1362 5.83329 10.8333C5.83329 8.53215 7.69877 6.66667 9.99996 6.66667Z'
                        fill='#667185'
                      />
                      <path
                        d='M9.99996 13.3333C9.70756 13.3333 9.42689 13.2831 9.16609 13.1909L7.91522 14.4418C8.5284 14.7968 9.24045 15 9.99996 15C12.3011 15 14.1666 13.1345 14.1666 10.8333C14.1666 10.0738 13.9634 9.36177 13.6084 8.74859L12.3575 9.99947C12.4498 10.2603 12.5 10.5409 12.5 10.8333C12.5 12.214 11.3807 13.3333 9.99996 13.3333Z'
                        fill='#667185'
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-900 mb-1'>
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900'
                  placeholder='Confirm your new password'
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='w-full mt-8 bg-black text-white rounded-4xl py-2 px-4 flex items-center justify-center font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                <RightArrowIcon />
              </button>
            </form>
          ) : (
            <div className='text-center'>
              <p className='text-gray-500'>Verifying reset link...</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar
        limit={1}
      />
    </div>
  );
};

export default ResetPasswordView;
