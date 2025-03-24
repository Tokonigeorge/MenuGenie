import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/header';

const ForgotPasswordView = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add password reset logic here
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
  };

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <Header />
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
              <p className='text-green-600 mb-6'>
                If an account exists with this email, we've sent a password
                reset link.
              </p>
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
                />
              </div>

              <button
                type='submit'
                className='w-full mt-16 bg-gray-900 text-white rounded-4xl py-2 px-4 flex items-center justify-center font-medium cursor-pointer'
              >
                Reset Password
                <svg
                  className='w-4 h-4 ml-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
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
    </div>
  );
};

export default ForgotPasswordView;
