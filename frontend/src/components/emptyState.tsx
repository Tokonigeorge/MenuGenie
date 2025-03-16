import React from 'react';
import Button from './button';

interface EmptyStateProps {
  onCreatePlan: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreatePlan }) => {
  return (
    <div className='flex flex-col items-center justify-center py-20 px-4 text-center'>
      {/* Menu SVG icon */}
      <svg
        className='w-20 h-20 text-gray-400 mb-4'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M4 6h16M4 12h16M4 18h16'
        />
      </svg>

      <h3 className='text-xl font-bold mb-2'>No meal plan found</h3>
      <p className='text-gray-600 mb-6 max-w-md'>
        You haven't created any meal plan yet. Click the "Create New Plan"
        button below to get started.
      </p>

      <Button
        onClick={onCreatePlan}
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
  );
};

export default EmptyState;
