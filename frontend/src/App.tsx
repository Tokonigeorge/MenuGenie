import { useEffect, useState } from 'react';
// import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import './App.css';

import LoginView from './views/auth/LoginView';
import SignUpView from './views/auth/SignUpView';
import ForgotPasswordView from './views/auth/ForgotPassword';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { ToastContainer } from 'react-toastify';
import { WebSocketProvider } from './components/websocketConnection';
import MainView from './views/MainView';
import ResetPasswordView from './views/auth/ResetPassword';

function App() {
  // const [hasChats, setHasChats] = useState<boolean>(true);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [lastActivityTime, setLastActivityTime] = useState<number | null>(null);
  //30 minutes
  //todo: change back to 30 minutes
  const SESSION_TIMEOUT = 60 * 60 * 1000;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setLastActivityTime(null);
      console.log('User logged out due to inactivity');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        if (!lastActivityTime) {
          setLastActivityTime(Date.now());
        }
      } else {
        setIsAuthenticated(false);
        setLastActivityTime(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !lastActivityTime) return;

    // Set initial activity time when authenticated
    if (!lastActivityTime) {
      setLastActivityTime(Date.now());
    }

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - lastActivityTime;

      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        handleLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivityTime]);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthLoading) {
      return;
    }
    if (!isAuthenticated) {
      return <Navigate to='/login' />;
    }
    return children;
  };

  return (
    <Provider store={store}>
      <Router>
        <WebSocketProvider>
          <div className='min-h-screen flex flex-col bg-white'>
            <Routes>
              <Route
                path='/login'
                element={
                  <LoginView
                    setIsAuthenticated={setIsAuthenticated}
                    setLoginTime={setLastActivityTime}
                  />
                }
              />
              <Route
                path='/signup'
                element={<SignUpView setIsAuthenticated={setIsAuthenticated} />}
              />
              <Route path='/reset-password' element={<ResetPasswordView />} />
              <Route path='/forgot-password' element={<ForgotPasswordView />} />
              <Route
                path='/'
                element={
                  <ProtectedRoute>
                    <MainView />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <ToastContainer />
          </div>
        </WebSocketProvider>
      </Router>
    </Provider>
  );
}

export default App;
