import React, { useEffect, useState } from 'react';
import TabNavigation from '../components/tabNavigation';
import MealChatModal from '../components/mealChatModal';
import CreateMealPlanModal from '../components/createMealPlanModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/index';
import { fetchMealPlans, MealDay, MealPlan } from '../store/mealPlanSlice';
import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from 'date-fns';
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

  useEffect(() => {
    if (mealPlans.length > 0 && !selectedPlan) {
      const completedPlans = mealPlans.filter(
        (plan) => plan.status === 'completed'
      );
      if (completedPlans.length > 0) {
        setSelectedPlan(completedPlans[0]);
      } else if (mealPlans.length > 0) {
        setSelectedPlan(mealPlans[0]);
      }
    }
  }, [mealPlans, selectedPlan]);

  const itemsPerPage = 6;

  const getMealDays = () => selectedPlan?.mealPlan?.days || [];
  const totalPages = Math.ceil(getMealDays().length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDays = getMealDays().slice(indexOfFirstItem, indexOfLastItem);

  const filteredMealPlans = mealPlans.filter(
    (plan) =>
      format(new Date(plan.startDate), 'MMM d')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      format(new Date(plan.endDate), 'MMM d')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );
  console.log(mealPlans, 'mealPlans');

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleViewDetails = (plan: MealPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handlePlanClick = (plan: (typeof mealPlans)[0]) => {
    setSelectedPlan(plan);
    setCurrentPage(1);
    // setIsModalOpen(true);
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

  const calculateDayCalories = (day: MealDay): string => {
    if (!day.meals) return '0';

    let total = 0;
    day.meals.forEach((meal) => {
      total += meal.nutritionalInfo.calories;
    });

    return total.toLocaleString();
  };

  const getFormattedDayDate = (
    planStartDate: string,
    dayNumber: number
  ): string => {
    const startDate = new Date(planStartDate);
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayNumber - 1);
    return format(dayDate, 'MMM d');
  };

  const handleFavoriteClick = (e: React.MouseEvent, dayId: string) => {
    e.stopPropagation(); // Prevent card click from triggering
    // TODO: Implement backend call to mark meal plan day as favorite
    console.log('Marked day as favorite:', dayId);
  };

  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);

    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';

    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff < 7) return `${daysDiff} days ago`;

    const weeksDiff = differenceInWeeks(new Date(), date);
    if (weeksDiff < 4) return `${weeksDiff} weeks ago`;

    const monthsDiff = differenceInMonths(new Date(), date);
    return `${monthsDiff} months ago`;
  };

  const getMealNamesForDay = (day: MealDay): string => {
    return day.meals.map((meal) => meal.name).join(', ');
  };

  return (
    <div className='flex w-full'>
      {loading && mealPlans.length === 0 ? (
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
                {filteredMealPlans?.map((plan) => (
                  <div key={plan._id} className='p-2 space-y-2'>
                    <div className='text-xs text-gray-400 font-medium px-2'>
                      {formatRelativeTime(plan.createdAt)}
                    </div>
                    <div
                      onClick={() => handlePlanClick(plan)}
                      className={`relative font-medium text-sm  px-2 py-3 rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center ${
                        selectedPlan?._id === plan._id
                          ? 'border border-gray-400 bg-gray-50'
                          : 'hover:border hover:border-gray-400'
                      }`}
                    >
                      {format(new Date(plan.startDate), 'MMM d')} -{' '}
                      {format(new Date(plan.endDate), 'MMM d')} Meal Plan
                      {plan.status === 'pending' && (
                        <span className=' absolute right-0  top-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800'>
                          Pending
                        </span>
                      )}
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

              <div className='grid grid-cols-1 gap-6 mt-4 w-full '>
                {selectedPlan?.status === 'pending' ? (
                  <div className='flex flex-col items-center justify-center h-64'>
                    <div className='w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mb-4'></div>
                    <p className='text-gray-600'>
                      Generating your meal plan...
                    </p>
                  </div>
                ) : selectedPlan?.status === 'error' ? (
                  <div className='flex flex-col items-center justify-center h-64'>
                    <p className='text-red-500'>
                      Error:{' '}
                      {selectedPlan.error || 'Failed to generate meal plan'}
                    </p>
                  </div>
                ) : selectedPlan?.mealPlan?.days ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
                    {currentDays.map((day) => (
                      <div
                        key={day.day}
                        onClick={() => handleViewDetails(selectedPlan)}
                        className='bg-white rounded-lg shadow-sm p-4 border cursor-pointer hover:bg-gray-50 border-gray-200'
                      >
                        <h3 className='text-sm font-medium text-gray-600'>
                          Meal Plan for{' '}
                          {getFormattedDayDate(selectedPlan.startDate, day.day)}
                        </h3>
                        <p className='text-gray-500 pt-3 text-sm'>
                          {day.description ||
                            `Meal plan for ${format(
                              new Date(selectedPlan.startDate),
                              'MMMM d'
                            )} giving you a variety of options...`}
                        </p>
                        <div className='text-sm flex gap-1 mt-2 items-start'>
                          <h4 className='text-gray-600'>Meals:</h4>
                          <p className='text-gray-500'>
                            {getMealNamesForDay(day)}
                          </p>
                        </div>
                        <div className='flex justify-between items-center mt-3'>
                          <div className='text-sm flex gap-1 items-start'>
                            <h4 className='text-gray-600'>Total Calories:</h4>
                            <p className='text-gray-500'>
                              {calculateDayCalories(day)} kCal
                            </p>
                          </div>
                          <button
                            onClick={(e) =>
                              handleFavoriteClick(e, day.day.toString())
                            }
                            className='p-1 hover:bg-gray-100 rounded-full cursor-pointer'
                          >
                            <svg
                              width='16'
                              height='17'
                              viewBox='0 0 16 17'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M9.15327 2.84001L10.3266 5.18668C10.4866 5.51334 10.9133 5.82668 11.2733 5.88668L13.3999 6.24001C14.7599 6.46668 15.0799 7.45334 14.0999 8.42668L12.4466 10.08C12.1666 10.36 12.0133 10.9 12.0999 11.2867L12.5733 13.3333C12.9466 14.9533 12.0866 15.58 10.6533 14.7333L8.65994 13.5533C8.29994 13.34 7.70661 13.34 7.33994 13.5533L5.34661 14.7333C3.91994 15.58 3.05327 14.9467 3.42661 13.3333L3.89994 11.2867C3.98661 10.9 3.83327 10.36 3.55327 10.08L1.89994 8.42668C0.926606 7.45334 1.23994 6.46668 2.59994 6.24001L4.72661 5.88668C5.07994 5.82668 5.50661 5.51334 5.66661 5.18668L6.83994 2.84001C7.47994 1.56668 8.51994 1.56668 9.15327 2.84001Z'
                                stroke='#475367'
                                stroke-width='1.2'
                                stroke-linecap='round'
                                stroke-linejoin='round'
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center h-64'>
                    <p className='text-gray-500'>
                      Select a meal plan to view details
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedPlan?.mealPlan?.days &&
              selectedPlan.mealPlan.days.length > itemsPerPage && (
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
