import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header';
import { auth } from '../../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import RightArrowIcon from '../../components/rightArrowIcon';

const ForgotPasswordView = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setIsSubmitted(true);
      toast.success('Reset link sent! Check your email');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address');
      } else {
        toast.error('Failed to send reset link. Please try again');
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
            Forgot your password
          </h1>

          <p className='text-center text-sm text-gray-500 mb-8 px-4'>
            Enter your registered email and we'll send you a link to reset it
          </p>

          {isSubmitted ? (
            <div className='text-center'>
              <div className='bg-green-50 p-4 rounded-md mb-6'>
                <p className='text-green-800'>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className='text-green-600 text-sm mt-2'>
                  Check your spam folder if you don't see it in your inbox
                </p>
              </div>
              <Link
                to='/login'
                className='text-gray-600 underline cursor-pointer'
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className='mb-6'>
                <label className='block text-sm font-medium text-gray-900 mb-1'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400'
                  placeholder='e.g bolu@gmail.com'
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='w-full mt-16 bg-black text-white rounded-4xl py-2 px-4 flex items-center justify-center font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Sending Reset Link...' : 'Reset Password'}
                <RightArrowIcon />
              </button>
            </form>
          )}

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-400'>
              Remember your password?{' '}
              <Link
                to='/login'
                className='text-gray-600 underline cursor-pointer'
              >
                Log in here
              </Link>
            </p>
          </div>
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

export default ForgotPasswordView;
