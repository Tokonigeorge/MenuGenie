import React, { useState } from 'react';
import { MealPlan, MealDay, MealItem } from '../store/mealPlanSlice';
import { format } from 'date-fns';
const MealChatModal = ({
  onClose,
  selectedPlan,
  selectedDay,
}: {
  onClose: () => void;
  selectedPlan: MealPlan;
  selectedDay: MealDay;
}) => {
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [genieChats, setGenieChats] = useState<
    {
      message: string;
      isUser: boolean;
    }[]
  >([]);
  const [genieInput, setGenieInput] = useState('');

  const handleMealTypeSelect = (type: string) => {
    setSelectedMealType(type);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (genieInput.trim()) {
      setGenieChats([...genieChats, { message: genieInput, isUser: true }]);
      setGenieInput('');
      // Here you would typically call an API to get genie's response
      // For now, we'll just simulate a response
      setTimeout(() => {
        setGenieChats((prev) => [
          ...prev,
          {
            message:
              "I've analyzed your question about this meal. What else would you like to know?",
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  function getFormattedDayDate(startDate: string, dayNumber: number): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return format(date, 'MMM d');
  }

  const getMealTypes = () => {
    if (!selectedDay || !selectedDay.meals) return [];
    return [...new Set(selectedDay.meals.map((meal) => meal.type))];
  };

  const getSelectedMeal = (): MealItem | null => {
    if (!selectedDay || !selectedMealType) return null;
    return (
      selectedDay.meals.find((meal) => meal.type === selectedMealType) || null
    );
  };

  const selectedMeal = getSelectedMeal();
  const dayDate = selectedPlan
    ? getFormattedDayDate(selectedPlan.startDate, selectedDay?.day || 0)
    : '';

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col`}
    >
      {/* Modal Header */}
      <div className='p-4 border-b bg-gray-50 h-16 border-gray-200 flex justify-between items-center'>
        <h2 className='font-semibold text-gray-700'>
          {selectedMealType
            ? `${selectedMealType} for ${dayDate}`
            : 'Select Menu / Meal type'}
        </h2>
        <button
          onClick={onClose}
          className='text-gray-800 cursor-pointer hover:text-gray-900 hover:scale-110 transition-all duration-300'
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
      <div className='flex-1 overflow-y-auto p-4'>
        {!selectedMealType ? (
          <div className='grid grid-rows-3 gap-4'>
            {getMealTypes().map((type) => (
              <div
                key={type}
                onClick={() => handleMealTypeSelect(type)}
                className='border border-gray-100 bg-gray-50 py-3 px-4 rounded-lg text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100'
              >
                {type}
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-6 mt-2'>
            {selectedMeal && (
              <>
                <div className='text-gray-500 text-sm'>
                  <h3 className='font-medium'>Meal Title:</h3>
                  <p className='mt-1'>{selectedMeal.name}</p>
                </div>
                <div className='text-gray-500 text-sm'>
                  <h3 className='font-medium'>Description/History:</h3>
                  <p className='mt-1'>
                    {selectedMeal.description || 'No description available'}
                  </p>
                </div>

                <div className='text-gray-500 text-sm'>
                  <h3 className='font-medium'>
                    Calories (Per Serving - Approximate):
                  </h3>
                  <p className='mt-1'>
                    {selectedMeal.nutritionalInfo.calories} kcal per serving
                  </p>
                </div>
                <div className='text-gray-500 text-sm'>
                  <h3 className='font-medium'>Recipe:</h3>
                  <p className='mt-1 font-medium'>Ingredients:</p>
                  <ul className='list-disc pl-5 mt-2 text-sm text-gray-500'>
                    {selectedMeal.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                  <p className='mt-3 font-medium'>Instructions:</p>
                  {typeof selectedMeal.recipe === 'string' ? (
                    <p className='mt-1'>{selectedMeal.recipe}</p>
                  ) : (
                    <ol className='list-decimal pl-5 mt-2 text-sm text-gray-500'>
                      {selectedMeal.recipe.map((step, index) => (
                        <li key={index} className='mb-2'>
                          <span className='font-medium'>{step.step}:</span>{' '}
                          {step.description}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </>
            )}

            {genieChats.length > 0 && (
              <div className='mt-6'>
                <div className='flex items-center gap-2 mb-3 border-t border-b bg-gray-50  p-2 -mx-4  border-t-gray-100 border-b-gray-100'>
                  <div className='p-1 rounded-full bg-white'>
                    <svg
                      width='16'
                      height='17'
                      viewBox='0 0 16 17'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M10 11.1667C12.5774 11.1667 14.6667 9.07737 14.6667 6.50004C14.6667 3.92271 12.5774 1.83337 10 1.83337C7.42271 1.83337 5.33337 3.92271 5.33337 6.50004C5.33337 9.07737 7.42271 11.1667 10 11.1667Z'
                        stroke='#98A2B3'
                        strokeWidth='1.2'
                        strokeMiterlimit='10'
                      />
                      <path
                        d='M6.00004 15.1667C8.57737 15.1667 10.6667 13.0774 10.6667 10.5C10.6667 7.92271 8.57737 5.83337 6.00004 5.83337C3.42271 5.83337 1.33337 7.92271 1.33337 10.5C1.33337 13.0774 3.42271 15.1667 6.00004 15.1667Z'
                        stroke='#98A2B3'
                        strokeWidth='1.2'
                        strokeMiterlimit='10'
                      />
                    </svg>
                  </div>
                  <span className='text-sm font-medium'>Chats with genie</span>
                </div>

                <div className='space-y-3'>
                  {genieChats.map((chat, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-500 ${
                        chat.isUser
                          ? 'ml-auto max-w-[80%] w-max '
                          : 'mr-auto max-w-[80%] w-max '
                      }`}
                    >
                      {chat.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {selectedMealType && (
        <div className='sticky bottom-0 border-t border-gray-300 bg-gray-50 p-3 h-[70px]'>
          <form
            onSubmit={handleSendMessage}
            className='flex items-center gap-2'
          >
            <input
              type='text'
              value={genieInput}
              onChange={(e) => setGenieInput(e.target.value)}
              placeholder='Ask Genie... (e.g make this recipe for 6 people servings)'
              className='flex-1 px-4 py-2 border text-sm text-gray-400 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900'
            />
            <button
              type='submit'
              className='p-2 bg-gray-800 text-white rounded-md'
            >
              <svg
                className='w-5 h-5 transform rotate-90'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MealChatModal;
