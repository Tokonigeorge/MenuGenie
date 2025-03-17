import React, { useState } from 'react';
import Button from '../components/button';
import TabNavigation from '../components/tabNavigation';

// Sample data for meal plans
const mealPlans = [
  {
    id: 1,
    title: 'Dec 1 - Dec 15 Meal Plan',
    createdAt: '7 days ago',
    description:
      'This meal plan for December 1st is designed to keep your taste buds excited and your body energized. Start your day with a vibrant smoothie bowl topped with fresh fruits and nuts.',
    meals: ['Jollof rice', 'Noddles', 'Tuwo', 'Ewa Agoyin', 'Egbo'],
    calories: '12,749',
    isFavorite: false,
  },
  {
    id: 2,
    title: 'Nov 15 - Nov 30 Meal Plan',
    createdAt: '14 days ago',
    description:
      'A balanced meal plan featuring nutritious options for the end of November. Packed with proteins and healthy carbs to fuel your day.',
    meals: ['Fried Rice', 'Efo Riro', 'Amala', 'Moi Moi', 'Akara'],
    calories: '10,520',
    isFavorite: true,
  },
  {
    id: 3,
    title: 'Nov 1 - Nov 15 Meal Plan',
    createdAt: '30 days ago',
    description:
      'Early November meal plan with seasonal ingredients. Perfect balance of comfort foods and nutritious options.',
    meals: ['Egusi Soup', 'Pounded Yam', 'Beans', 'Plantain', 'Suya'],
    calories: '11,350',
    isFavorite: false,
  },
  {
    id: 4,
    title: 'Oct 15 - Oct 31 Meal Plan',
    createdAt: '45 days ago',
    description:
      'Fall-themed meal plan with seasonal vegetables and hearty dishes to keep you warm as the weather cools.',
    meals: [
      'Banga Soup',
      'Coconut Rice',
      'Ofada Stew',
      'Yam Porridge',
      'Moin Moin',
    ],
    calories: '13,200',
    isFavorite: false,
  },

  {
    id: 5,
    title: 'Oct 15 - Oct 31 Meal Plan',
    createdAt: '45 days ago',
    description:
      'Fall-themed meal plan with seasonal vegetables and hearty dishes to keep you warm as the weather cools.',
    meals: [
      'Banga Soup',
      'Coconut Rice',
      'Ofada Stew',
      'Yam Porridge',
      'Moin Moin',
    ],
    calories: '13,200',
    isFavorite: false,
  },
  {
    id: 6,
    title: 'Oct 15 - Oct 31 Meal Plan',
    createdAt: '45 days ago',
    description:
      'Fall-themed meal plan with seasonal vegetables and hearty dishes to keep you warm as the weather cools.',
    meals: [
      'Banga Soup',
      'Coconut Rice',
      'Ofada Stew',
      'Yam Porridge',
      'Moin Moin',
    ],
    calories: '13,200',
    isFavorite: false,
  },
  {
    id: 7,
    title: 'Nov 15 - Nov 30 Meal Plan',
    createdAt: '14 days ago',
    description:
      'A balanced meal plan featuring nutritious options for the end of November. Packed with proteins and healthy carbs to fuel your day.',
    meals: ['Fried Rice', 'Efo Riro', 'Amala', 'Moi Moi', 'Akara'],
    calories: '10,520',
    isFavorite: true,
  },
  {
    id: 8,
    title: 'Nov 15 - Nov 30 Meal Plan',
    createdAt: '14 days ago',
    description:
      'A balanced meal plan featuring nutritious options for the end of November. Packed with proteins and healthy carbs to fuel your day.',
    meals: ['Fried Rice', 'Efo Riro', 'Amala', 'Moi Moi', 'Akara'],
    calories: '10,520',
    isFavorite: true,
  },
];

const MealPlansView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mealPlanner' | 'askGenie'>(
    'mealPlanner'
  );

  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 4;
  const totalPages = Math.ceil(mealPlans.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mealPlans.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className='flex h-[calc(100vh-64px)] w-full overflow-hidden'>
      <div className='w-1/5 min-w-[250px] relative border-r border-gray-100 shadow-md flex flex-col pt-4'>
        <div className='overflow-y-auto pb-16'>
          <div className='px-4'>
            <p className='text-sm font-medium text-gray-400'>
              Meal Plan History
            </p>
          </div>
          <div className='p-4'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
              <input
                type='text'
                placeholder='Search anything'
                className='pl-10 pr-4 py-2 w-full text-sm text-gray-400 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
              />
            </div>
          </div>

          {/* Meal plans list */}
          <div className='flex-1  mt-4'>
            {mealPlans.map((plan) => (
              <div key={plan.id} className='p-2 space-y-2'>
                <div className='text-xs text-gray-400 font-medium px-2'>
                  {plan.createdAt}
                </div>
                <div className='font-medium text-gray-600 text-sm px-2 py-3 rounded-lg hover:border  hover:border-gray-400 hover:bg-gray-50 cursor-pointer'>
                  {plan.title}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className=' border-t border-gray-300 bg-gray-50 sticky bottom-0 p-4 w-full'>
          <Button
            onClick={() => console.log('Create new plan clicked')}
            className='cursor-pointer p-6 w-full'
            variant='primary'
            icon={
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
            }
          >
            Create new meal plan
          </Button>
        </div>
      </div>

      {/* Main content - two column meal plan cards */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <div className='flex-1 p-6 overflow-y-auto pb-16'>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
            {currentItems.map((plan) => (
              <div
                key={plan.id}
                className='bg-white rounded-lg shadow-sm p-4 border border-gray-200 cursor-pointer'
              >
                <h3 className='text-sm font-medium text-gray-600'>
                  {plan.title}
                </h3>
                <p className='text-gray-500 pt-3 text-sm'>{plan.description}</p>

                <div className='text-sm flex gap-1 mt-2 items-center'>
                  <h4 className=' text-gray-600'>Meals:</h4>
                  <p className='text-gray-500'>{plan.meals.join(', ')}</p>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='text-sm flex gap-1 mt-2 items-center'>
                    <h4 className=' text-gray-600'>Total Avg. Calories:</h4>
                    <p className='text-gray-500'>{plan.calories} kCal</p>
                  </div>

                  {/* Favorite button */}
                  <div className='flex justify-end'>
                    <button className='text-gray-400 hover:text-gray-900 focus:outline-none cursor-pointer'>
                      <svg
                        className={`w-6 h-6 ${
                          plan.isFavorite ? 'text-gray-900 fill-current' : ''
                        }`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='border-t border-gray-300 bg-gray-50 sticky bottom-0 p-4 w-full flex items-center justify-between'>
          <div className='text-sm text-gray-500 font-medium'>
            Page <span className='text-gray-900'>{currentPage}</span> of{' '}
            {totalPages}
          </div>

          <div className='flex space-x-2'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === page
                    ? 'border border-gray-900 text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <div className='flex space-x-2'>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-2 rounded-4xl  border border-gray-300 text-sm text-gray-700 ${
                currentPage === 1
                  ? ' cursor-not-allowed border-gray-200 text-gray-100 opacity-50'
                  : 'cursor-pointer'
              }`}
            >
              <svg
                className='w-4 h-4 mr-1'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              Back
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1 rounded-4xl border border-gray-300 text-sm text-gray-700 ${
                currentPage === totalPages
                  ? 'cursor-not-allowed border-gray-200 text-gray-100 opacity-50'
                  : 'cursor-pointer '
              }`}
            >
              Next
              <svg
                className='w-4 h-4 ml-1'
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
      </div>
    </div>
  );
};

export default MealPlansView;
