import React from 'react';
import RocketIcon from './rocketIcon';

interface TabNavigationProps {
  activeTab: 'mealPlanner' | 'askGenie';
  setActiveTab: (tab: 'mealPlanner' | 'askGenie') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className='flex justify-between items-center flex-wrap'>
      <h2 className='text-xl font-medium uppercase text-gray-600'>
        Meal Planner
      </h2>

      <div className='flex rounded-full gap-1.5 py-1.5 px-2 shadow-sm shadow-[#10192805] border border-gray-100'>
        <button
          className={`px-3 cursor-pointer py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'mealPlanner'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('mealPlanner')}
        >
          Meal Planner
        </button>
        <button
          className={`px-3 cursor-pointer py-2 rounded-full flex items-center gap-1 text-sm font-medium transition-colors ${
            activeTab === 'askGenie'
              ? 'bg-gray-900 text-white'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('askGenie')}
        >
          Ask Genie{' '}
          <span
            className={`text-[8px] flex items-center gap-1 border border-gray-100 rounded-full px-1 ${
              activeTab === 'askGenie'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600'
            }`}
          >
            <RocketIcon />
            Ask AI
          </span>
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
