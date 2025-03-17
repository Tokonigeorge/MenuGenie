import React, { useState } from 'react';
import TabNavigation from '../components/tabNavigation';

// Sample data for chat history
const chatHistory = [
  {
    id: 1,
    title: 'Meal plan for weight loss',
    createdAt: '2 days ago',
  },
  {
    id: 2,
    title: 'Recipe for Nigerian Jollof',
    createdAt: '5 days ago',
  },
  {
    id: 3,
    title: 'Vegan alternatives',
    createdAt: '1 week ago',
  },
  {
    id: 4,
    title: 'Low carb breakfast ideas',
    createdAt: '2 weeks ago',
  },
  {
    id: 5,
    title: 'Low carb breakfast ideas',
    createdAt: '2 weeks ago',
  },
  {
    id: 6,
    title: 'Low carb breakfast ideas',
    createdAt: '2 weeks ago',
  },
  {
    id: 7,
    title: 'Low carb breakfast ideas',
    createdAt: '2 weeks ago',
  },
  {
    id: 8,
    title: 'Low carb breakfast ideas',
    createdAt: '2 weeks ago',
  },
];

const AskGenieView: React.FC<{
  activeTab: 'mealPlanner' | 'askGenie';
  setActiveTab: (tab: 'mealPlanner' | 'askGenie') => void;
}> = ({ activeTab, setActiveTab }) => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
    []
  );
  const [inputText, setInputText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasChats, setHasChats] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      // Add user message
      setMessages([...messages, { text: inputText, isUser: true }]);
      setInputText('');
      setHasChats(true);

      // Simulate genie response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I'm happy to help! What else would you like to know?",
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setHasChats(true);
  };

  return (
    <div className='flex h-[calc(100vh-64px)] w-full overflow-hidden'>
      {/* Left sidebar - chat history */}
      <div className='w-1/5 min-w-[250px] relative border-r border-gray-100 shadow-md flex flex-col pt-4'>
        <div className='overflow-y-auto pb-16'>
          <div className='px-4'>
            <p className='text-sm font-medium text-gray-400'>Chat History</p>
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

          {/* Chat history list */}
          <div className='flex-1 mt-4'>
            {chatHistory.map((chat) => (
              <div key={chat.id} className='p-2 space-y-2'>
                <div className='text-xs text-gray-400 font-medium px-2'>
                  {chat.createdAt}
                </div>
                <div className='font-medium text-gray-600 text-sm px-2 py-3 rounded-lg hover:border hover:border-gray-400 hover:bg-gray-50 cursor-pointer'>
                  {chat.title}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='border-t border-gray-300 bg-gray-50 sticky bottom-0 max-h-[70px] py-3.5 w-full text-center'>
          <button
            onClick={handleNewChat}
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
            Add a new chat
          </button>
        </div>
      </div>

      {/* Main content - chat area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <div className='p-6'>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className='flex-1 flex flex-col p-6 mx-6 overflow-y-auto bg-gray-50 rounded-xl'>
          {messages.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center'>
              <h2 className='text-2xl font-medium text-gray-600 mb-2'>
                Hi, I'm Genie 🤚🏽
              </h2>
              <p className='text-gray-500 font-normal'>
                How can I be of help to you today?
              </p>
            </div>
          ) : (
            <div className='space-y-4 flex-1'>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2.5 rounded-lg max-w-[80%] border w-max text-gray-600 border-gray-200 text-sm ${
                    msg.isUser ? 'ml-auto' : ''
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='border-t border-gray-300 h-[70px] px-4 py-3.5 w-full'>
          <form
            onSubmit={handleSendMessage}
            className='flex items-center gap-2'
          >
            <input
              type='text'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='Ask Genie anything...'
              className='flex-1 px-4 py-2 border text-sm text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900'
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
      </div>
    </div>
  );
};

export default AskGenieView;
