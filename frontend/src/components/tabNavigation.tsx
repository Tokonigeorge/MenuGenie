import React from 'react';

interface TabNavigationProps {
  activeTab: 'mealPlanner' | 'askGenie';
  setActiveTab: (tab: 'mealPlanner' | 'askGenie') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className='flex justify-between items-center px-8 py-4 flex-wrap'>
      <h2 className='text-xl font-semibold uppercase text-gray-600'>
        Meal Planner
      </h2>

      <div className='flex rounded-full gap-1.5 py-2 px-3 shadow-sm border border-gray-100'>
        <button
          className={`px-3 cursor-pointer py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'mealPlanner'
              ? 'bg-gray-900 text-gray-300'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('mealPlanner')}
        >
          Meal Planner
        </button>
        <button
          className={`px-3 cursor-pointer py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'askGenie'
              ? 'bg-gray-900 text-gray-300'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('askGenie')}
        >
          Ask Genie
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
