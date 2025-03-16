import { useState } from 'react';
// import axios from 'axios';

import './App.css';
import Header from './components/header';
import TabNavigation from './components/tabNavigation';
import EmptyState from './components/emptyState';

function App() {
  const [activeTab, setActiveTab] = useState<'mealPlanner' | 'askGenie'>(
    'mealPlanner'
  );

  const handleCreatePlan = () => {
    console.log('Creating new meal plan...');
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
      <Header />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className='flex-1 flex items-center justify-center'>
        {activeTab === 'mealPlanner' && (
          <EmptyState onCreatePlan={handleCreatePlan} />
        )}
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
