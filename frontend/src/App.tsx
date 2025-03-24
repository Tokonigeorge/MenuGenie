import { useState } from 'react';
// import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import './App.css';
import Header from './components/header';
import TabNavigation from './components/tabNavigation';
import EmptyState from './components/emptyState';
import MealPlansView from './views/mealPlansView';
import AskGenieView from './views/askGenieView';
import LoginView from './views/auth/LoginView';
import SignUpView from './views/auth/SignUpView';
import ForgotPasswordView from './views/auth/ForgotPassword';

function App() {
  const [activeTab, setActiveTab] = useState<'mealPlanner' | 'askGenie'>(
    'mealPlanner'
  );
  const [hasMealPlans, setHasMealPlans] = useState<boolean>(true);
  // const [hasChats, setHasChats] = useState<boolean>(true);
  const [hasFavorites] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleCreatePlan = () => {
    console.log('Creating new meal plan...');
    setHasMealPlans(true);
    // This will be implemented later
  };
  // const [message, setMessage] = useState<string>('');

  // useEffect(() => {
  //   axios
  //     .get('/api/')
  //     .then((response: { data: { message: SetStateAction<string> } }) =>
  //       setMessage(response.data.message)
  //     )
  //     .catch((error: any) => console.error('Error fetching data', error));
  // }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to='/login' />;
    }
    return children;
  };

  return (
    <Router>
      <div className='min-h-screen flex flex-col bg-white'>
        <Routes>
          <Route
            path='/login'
            element={<LoginView setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path='/signup'
            element={<SignUpView setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path='/forgot-password' element={<ForgotPasswordView />} />
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <>
                  <Header>
                    {hasFavorites && (
                      <button className='ml-auto hover:bg-gray-100 flex items-center border border-gray-900 text-gray-900 rounded-4xl px-3 py-2 cursor-pointer text-sm font-medium'>
                        View favorite meal plans
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
                    )}
                  </Header>

                  {!hasMealPlans && (
                    <div className='px-8 py-4'>
                      <TabNavigation
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                      />
                    </div>
                  )}

                  <main className='flex items-center justify-center'>
                    {activeTab === 'mealPlanner' &&
                      (hasMealPlans ? (
                        <MealPlansView
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                        />
                      ) : (
                        <div className='flex items-center justify-center h-full'>
                          <EmptyState onCreatePlan={handleCreatePlan} />
                        </div>
                      ))}
                    {activeTab === 'askGenie' && (
                      <AskGenieView
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                      />
                    )}
                  </main>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
