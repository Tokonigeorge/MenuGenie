import React, { useState } from 'react';
import Button from './button';
import menu from '../assets/emptyMenu.svg';
import CreateMealPlanModal from './createMealPlanModal';

interface EmptyStateProps {
  onCreatePlan: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreatePlan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='flex flex-col items-center justify-center  px-4 text-center'>
      {/* Menu SVG icon */}
      <img src={menu} alt='menu' className='w-100 h-100' />

      <h3 className='text-2xl font-medium pb-2 text-gray-600'>
        No meal plan found
      </h3>
      <p className=' mb-8 max-w-md text-sm font-normal text-gray-500'>
        You haven't created any meal plan yet. Click the "Create New Plan"
        button below to get started.
      </p>

      <Button
        onClick={handleOpenModal}
        className='cursor-pointer p-4'
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
      {isModalOpen && (
        <CreateMealPlanModal
          onClose={handleCloseModal}
          onComplete={onCreatePlan}
        />
      )}
    </div>
  );
};

export default EmptyState;
