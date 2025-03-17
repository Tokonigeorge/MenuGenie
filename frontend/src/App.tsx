import { useState } from 'react';
// import axios from 'axios';

import './App.css';
import Header from './components/header';
import TabNavigation from './components/tabNavigation';
import EmptyState from './components/emptyState';
import MealPlansView from './views/mealPlansView';

function App() {
  const [activeTab, setActiveTab] = useState<'mealPlanner' | 'askGenie'>(
    'mealPlanner'
  );
  const [hasMealPlans, setHasMealPlans] = useState<boolean>(true);
  const [hasFavorites] = useState<boolean>(true);

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

  return (
    <div className='min-h-screen flex flex-col bg-white'>
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
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}
      <main className=' flex items-center justify-center'>
        {activeTab === 'mealPlanner' &&
          (hasMealPlans ? (
            <MealPlansView />
          ) : (
            <div className='flex items-center justify-center h-full'>
              <EmptyState onCreatePlan={handleCreatePlan} />
            </div>
          ))}
        {activeTab === 'askGenie' && (
          <div className='p-6'>
            <h3 className='text-xl font-bold'>Ask Genie</h3>
            <p className='text-gray-600'>
              This feature will be implemented later.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
