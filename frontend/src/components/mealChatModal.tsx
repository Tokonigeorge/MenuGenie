import React, { useState } from 'react';

const MealChatModal = ({
  onClose,
  selectedPlan,
}: {
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedPlan: any;
}) => {
  const [selectedMealType, setSelectedMealType] = useState<
    'Breakfast' | 'Lunch' | 'Dinner' | null
  >(null);
  const [genieChats, setGenieChats] = useState<
    {
      message: string;
      isUser: boolean;
    }[]
  >([]);
  const [genieInput, setGenieInput] = useState('');

  const handleMealTypeSelect = (type: 'Breakfast' | 'Lunch' | 'Dinner') => {
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

  return (
    <div
      className={`fixed top-0 right-0 h-full w-1/3 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col`}
    >
      {/* Modal Header */}
      <div className='p-4 border-b bg-gray-50 h-16 border-gray-200 flex justify-between items-center'>
        <h2 className='font-semibold text-gray-700'>
          {selectedMealType
            ? `${selectedMealType} for ${selectedPlan?.title.split(' ')[0]} ${
                selectedPlan?.title.split(' ')[1]
              }`
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
            {['Breakfast', 'Lunch', 'Dinner'].map((type) => (
              <div
                key={type}
                onClick={() =>
                  handleMealTypeSelect(type as 'Breakfast' | 'Lunch' | 'Dinner')
                }
                className='border border-gray-100 bg-gray-50 py-3 px-4 rounded-lg text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100'
              >
                {type}
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-6 mt-2'>
            <div className='text-gray-500 text-sm'>
              <h3 className='font-medium'>Meal Title:</h3>
              <p className='mt-1'>Nigerian Jollof Rice</p>
            </div>
            <div className='text-gray-500 text-sm'>
              <h3 className='font-medium'>Description/History:</h3>
              <p className='mt-1'>
                Nigerian Jollof Rice is a beloved West African dish made with
                rice, tomatoes, peppers, and a blend of spices. It's a staple at
                parties, gatherings, and everyday meals, known for its rich,
                smoky flavor. The dish is at the center of a friendly rivalry
                between Nigeria, Ghana, and other West African countries, each
                with its unique take. Nigerian Jollof is typically cooked with
                long-grain parboiled rice, giving it a firm texture that absorbs
                the flavors beautifully.
              </p>
            </div>

            <div className='text-gray-500 text-sm'>
              <h3 className='font-medium'>
                Calories (Per Serving - Approximate):
              </h3>
              <p className='mt-1'>
                450-500 kcal per serving (depends on oil quantity and protein
                choice).
              </p>
            </div>
            <div className='text-gray-500 text-sm'>
              <h3 className='font-medium'>Recipe:</h3>
              <p className='mt-1 font-medium'>Ingredients:</p>
              <ul className='list-disc pl-5 mt-2 text-sm text-gray-500'>
                <li>2 cups of long-grain parboiled rice</li>
                <li>6 large ripe tomatoes</li>
                <li>2 red bell peppers</li>
                <li>2 large onions</li>
                <li>4 tablespoons of tomato paste</li>
                <li>1/3 cup of vegetable oil</li>
                <li>2-3 scotch bonnet peppers (adjust to taste)</li>
                <li>3 cloves of garlic</li>
                <li>1-inch piece of ginger</li>
                <li>2 bay leaves</li>
                <li>1 teaspoon thyme</li>
                <li>1 teaspoon curry powder</li>
                <li>2-3 stock cubes</li>
                <li>Salt to taste</li>
              </ul>
            </div>
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
