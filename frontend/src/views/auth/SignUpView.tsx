import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/header';
import { auth } from '../../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

interface SignUpViewProps {
  setIsAuthenticated: (value: boolean) => void;
}

const SignUpView = ({ setIsAuthenticated }: SignUpViewProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed up with Google:', user);

      await axios.post('/api/register', {
        email: user.email,
        googleAuth: true,
      });

      setIsAuthenticated(true);
      navigate('/');
      setIsGoogleLoading(false);
    } catch (error: any) {
      console.error('Error with Google sign-up:', error);
      toast.error('Google sign-up failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential?.user;
      console.log('User created:', user);

      await axios.post('/api/register', {
        email: email,
        password: password,
      });
      setIsAuthenticated(true);
      navigate('/login');
      setIsLoading(false);
    } catch (error: any) {
      setIsAuthenticated(false);
      const errorMessage =
        error.code === 'auth/email-already-in-use'
          ? 'This email is already in use.'
          : 'Error signing up. Please try again.';

      toast.error(errorMessage);
      setIsLoading(false);
      console.error('Error signing up:', error);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <Header />

      <div className='flex-1 flex items-center justify-center px-4'>
        <div className='w-full max-w-md p-8 bg-white rounded-lg '>
          <h1 className='text-center text-xl font-medium text-gray-800 mb-10'>
            Create your Genie Account
          </h1>

          <form onSubmit={handleSignUp}>
            {passwordError && (
              <p className='text-white text-sm mt-1 p-2 bg-red-500 rounded-md mb-4'>
                {passwordError}
              </p>
            )}
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

            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-900 mb-1'>
                Password
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400'
                  placeholder='(min. of 8 characters)'
                  required
                  minLength={8}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
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
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400'
                  placeholder='Confirm your password'
                  required
                  minLength={8}
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

            <button
              type='submit'
              disabled={isLoading}
              className='w-full mt-12 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white rounded-4xl py-2 px-4 flex items-center justify-center font-medium cursor-pointer'
            >
              {isLoading ? 'Signing up...' : 'Sign Up'}
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

          <div className='mt-4 text-center'>
            <p className='text-sm text-gray-400'>
              Already have an account?{' '}
              <Link
                to='/login'
                className='text-gray-600 underline cursor-pointer'
              >
                Log in here
              </Link>
            </p>
          </div>

          <div className='flex items-center my-6'>
            <div className='flex-1 border-t border-gray-300'></div>
            <div className='px-6 text-sm text-gray-500'>OR</div>
            <div className='flex-1 border-t border-gray-300'></div>
          </div>

          <button
            type='button'
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className='w-full border disabled:opacity-50 disabled:cursor-not-allowed border-gray-900 text-gray-900 rounded-4xl py-2 px-4 flex items-center justify-center cursor-pointer'
          >
            <svg
              className='w-5 h-5 mr-2'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z'
                fill='#FFC107'
              />
              <path
                d='M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z'
                fill='#FF3D00'
              />
              <path
                d='M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39897 18 7.19047 16.3415 6.35847 14.027L3.09747 16.5395C4.75247 19.778 8.11347 22 12 22Z'
                fill='#4CAF50'
              />
              <path
                d='M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z'
                fill='#1976D2'
              />
            </svg>
            {isGoogleLoading
              ? 'Signing up with Google...'
              : 'Sign up with Google'}
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
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUpView;
