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
    <div className='flex justify-between items-center px-6 py-4'>
      <h2 className='text-lg font-semibold uppercase'>Meal Planner</h2>

      <div className='flex rounded-full bg-inactive p-1 shadow-md'>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'mealPlanner'
              ? 'bg-active text-white'
              : 'text-gray-700'
          }`}
          onClick={() => setActiveTab('mealPlanner')}
        >
          Meal Planner
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'askGenie' ? 'bg-active text-white' : 'text-gray-700'
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
