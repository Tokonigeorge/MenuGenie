import React, { useState } from 'react';
import TabNavigation from '../components/tabNavigation';
import MealChatModal from '../components/mealChatModal';
import CreateMealPlanModal from '../components/createMealPlanModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/index';
import { fetchMealPlans, MealPlan } from '../store/mealPlanSlice';
import { format } from 'date-fns';
import EmptyState from '../components/emptyState';

const MealPlansView: React.FC<{
  activeTab: 'mealPlanner' | 'askGenie';
  setActiveTab: (tab: 'mealPlanner' | 'askGenie') => void;
}> = ({ activeTab, setActiveTab }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { mealPlans, loading } = useSelector(
    (state: RootState) => state.mealPlans
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<
    (typeof mealPlans)[0] | null
  >(null);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] =
    useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const itemsPerPage = 4;
  const totalPages = Math.ceil(mealPlans.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mealPlans.slice(indexOfFirstItem, indexOfLastItem);

  // Filter meal plans by search term
  // const filteredMealPlans = mealPlans.filter(
  //   (plan) =>
  //     plan.startDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     plan.endDate.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  console.log(mealPlans, 'mealPlans');
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePlanClick = (plan: (typeof mealPlans)[0]) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreatePlanClick = () => {
    setIsCreatePlanModalOpen(true);
  };

  const handleCloseCreatePlanModal = () => {
    setIsCreatePlanModalOpen(false);
  };
  const handleCompletePlan = () => {
    dispatch(fetchMealPlans());
  };

  const calculateTotalCalories = (plan: MealPlan): string => {
    if (!plan.mealPlan?.days) return '0';

    let total = 0;
    plan.mealPlan.days.forEach((day) => {
      day.meals.forEach((meal) => {
        total += meal.nutritionalInfo.calories;
      });
    });

    return total.toLocaleString();
  };

  const getMealNames = (plan: MealPlan): string[] => {
    if (!plan.mealPlan?.days) return [];

    const names: string[] = [];
    plan.mealPlan.days.forEach((day) => {
      day.meals.forEach((meal) => {
        if (!names.includes(meal.name)) {
          names.push(meal.name);
        }
      });
    });

    return names.slice(0, 5); // Just take the first 5 meals
  };
  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className='flex w-full'>
      {loading ? (
        <div className='flex justify-center items-center h-[calc(100vh-150px)] w-full overflow-hidden'>
          <div className='w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin'></div>
        </div>
      ) : mealPlans.length === 0 ? (
        <div className='flex justify-center items-center h-[calc(100vh-150px)] w-full overflow-hidden'>
          <EmptyState onCreatePlan={handleCreatePlanClick} />
        </div>
      ) : (
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder='Search anything'
                    className='pl-10 pr-4 py-2 w-full text-sm text-gray-400 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
                  />
                </div>
              </div>

              {/* Meal plans list */}
              <div className='flex-1  mt-4'>
                {mealPlans.map((plan) => (
                  <div key={plan._id} className='p-2 space-y-2'>
                    <div className='text-xs text-gray-400 font-medium px-2'>
                      {formatRelativeTime(plan.createdAt)}
                    </div>
                    <div
                      onClick={() => handlePlanClick(plan)}
                      className='font-medium text-gray-600 text-sm px-2 py-3 rounded-lg hover:border hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
                    >
                      {format(new Date(plan.startDate), 'MMM d')} -{' '}
                      {format(new Date(plan.endDate), 'MMM d')} Meal Plan
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className=' border-t border-gray-300 bg-gray-50 sticky bottom-0 h-[70px] py-3.5 w-full text-center'>
              <button
                onClick={handleCreatePlanClick}
                className='cursor-pointer py-3 max-w-[250px] mx-auto px-4 bg-gray-900 text-white text-sm rounded-3xl flex items-center justify-center gap-2 w-full'
                type='button'
              >
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
                Create new meal plan
              </button>
            </div>
          </div>

          {/* Main content - two column meal plan cards */}
          <div className='flex-1 flex flex-col overflow-hidden'>
            <div className='flex-1 p-6 overflow-y-auto pb-16'>
              <TabNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              {
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                  {currentItems.map((plan) => (
                    <div
                      key={plan._id}
                      onClick={() => handlePlanClick(plan)}
                      className='bg-white rounded-lg shadow-sm p-4 border border-gray-200 cursor-pointer'
                    >
                      <h3 className='text-sm font-medium text-gray-600'>
                        {format(new Date(plan.startDate), 'MMM d')} -{' '}
                        {format(new Date(plan.endDate), 'MMM d')} Meal Plan
                      </h3>

                      {plan.status === 'pending' ? (
                        <p className='text-yellow-500 pt-3 text-sm'>
                          Generating meal plan...
                        </p>
                      ) : plan.status === 'error' ? (
                        <p className='text-red-500 pt-3 text-sm'>
                          Error: {plan.error || 'Failed to generate meal plan'}
                        </p>
                      ) : (
                        <>
                          <p className='text-gray-500 pt-3 text-sm'>
                            {plan.mealPlan?.days.length || 0} day meal plan with{' '}
                            {plan.mealType.join(', ')} recipes.
                          </p>

                          <div className='text-sm flex gap-1 mt-2 items-start'>
                            <h4 className='text-gray-600'>Meals:</h4>
                            <p className='text-gray-500'>
                              {getMealNames(plan).join(', ')}
                            </p>
                          </div>
                          <div className='flex items-center justify-between'>
                            <div className='text-sm flex gap-1 mt-2 items-start'>
                              <h4 className='text-gray-600'>
                                Total Avg. Calories:
                              </h4>
                              <p className='text-gray-500'>
                                {calculateTotalCalories(plan)} kCal
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              }
            </div>

            {mealPlans.length > 0 && (
              <div className='border-t border-gray-300 h-[70px] px-4 py-3.5 w-full flex items-center justify-between'>
                <div className='text-sm text-gray-500 font-medium'>
                  Page <span className='text-gray-900'>{currentPage}</span> of{' '}
                  {totalPages}
                </div>

                <div className='flex space-x-2'>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-md cursor-pointer text-sm ${
                          currentPage === page
                            ? 'border border-gray-900 text-gray-900'
                            : 'text-gray-400'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <div className='flex space-x-2'>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
            )}
          </div>
        </div>
      )}
      {isModalOpen && (
        <MealChatModal onClose={handleCloseModal} selectedPlan={selectedPlan} />
      )}
      {isCreatePlanModalOpen && (
        <CreateMealPlanModal
          onClose={handleCloseCreatePlanModal}
          onComplete={handleCompletePlan}
        />
      )}
    </div>
  );
};

export default MealPlansView;
