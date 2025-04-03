import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/header';
import { AppDispatch, RootState } from '../store';
import { useEffect, useState } from 'react';
import TabNavigation from '../components/tabNavigation';
import MealPlansView from './mealPlansView';
import AskGenieView from './askGenieView';
import { fetchMealPlans } from '../store/mealPlanSlice';
import { fetchChats } from '../store/chatSlice';

const MainView = () => {
  const [activeTab, setActiveTab] = useState<'mealPlanner' | 'askGenie'>(
    'mealPlanner'
  );
  const { mealPlans } = useSelector((state: RootState) => state.mealPlans);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchMealPlans());
    dispatch(fetchChats('createdAt'));
  }, [dispatch]);

  return (
    <>
      <Header showLogout={true}>
        {mealPlans.length > 0 && (
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

      {activeTab === 'mealPlanner' && mealPlans.length < 1 && (
        <div className='px-8 py-4'>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      <main className='flex items-center justify-center'>
        {activeTab === 'mealPlanner' && (
          <MealPlansView activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'askGenie' && (
          <AskGenieView activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </main>
    </>
  );
};

export default MainView;
