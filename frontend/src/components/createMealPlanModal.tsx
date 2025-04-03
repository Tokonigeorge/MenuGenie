import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Button from './button';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { auth } from '../firebaseConfig';
import { useWebSocket } from '../hooks/websocketContext';
import { useDispatch } from 'react-redux';
import { addMealPlan } from '../store/mealPlanSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  complexityOptions,
  cuisineSections,
  dietarySections,
  mealTypeOptions,
} from '../constants/createMealPlanSelections';
import RightArrowIcon from './rightArrowIcon';

interface CreateMealPlanModalProps {
  onClose: () => void;
  onComplete: () => void;
  setActiveTab: (tab: 'mealPlanner' | 'askGenie') => void;
}

type FormValues = {
  startDate: string;
  endDate: string;
  mealType: string[];
  dietaryPreferences: string[];
  cuisineTypes: string[];
  complexityLevels: string[];
};

const CreateMealPlanModal: React.FC<CreateMealPlanModalProps> = ({
  onClose,
  onComplete,
  setActiveTab,
}) => {
  const dispatch = useDispatch();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(true);
  const { lastMessage } = useWebSocket();
  const [createdMealPlanId, setCreatedMealPlanId] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    clearErrors,
  } = useForm<FormValues>({
    defaultValues: {
      startDate: '',
      endDate: '',
      mealType: [],
      dietaryPreferences: [],
      cuisineTypes: [],
      complexityLevels: [],
    },
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSelectAllInSection = (
    sectionItems: { id: string; label: string }[]
  ) => {
    const allItemIds = sectionItems.map((item) => item.id);
    const currentSelection = watch('dietaryPreferences') || [];

    // Check if all items in this section are already selected
    const allSelected = allItemIds.every((id) => currentSelection.includes(id));

    if (allSelected) {
      // Deselect all items in this section
      setValue(
        'dietaryPreferences',
        currentSelection.filter((id) => !allItemIds.includes(id))
      );
    } else {
      // Select all items in this section
      const newSelection = [...currentSelection];
      allItemIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      setValue('dietaryPreferences', newSelection);
    }
  };

  const handlePreferenceSelect = (preferenceId: string) => {
    const currentSelection = watch('dietaryPreferences') || [];
    if (currentSelection.includes(preferenceId)) {
      // Remove if already selected
      setValue(
        'dietaryPreferences',
        currentSelection.filter((id) => id !== preferenceId)
      );
    } else {
      // Add if not already selected
      setValue('dietaryPreferences', [...currentSelection, preferenceId]);
    }
  };

  const handleSelectAllCuisines = (
    sectionItems: { id: string; label: string }[]
  ) => {
    const allItemIds = sectionItems.map((item) => item.id);
    const currentSelection = watch('cuisineTypes') || [];

    // Check if all items in this section are already selected
    const allSelected = allItemIds.every((id) => currentSelection.includes(id));

    if (allSelected) {
      // Deselect all items in this section
      setValue(
        'cuisineTypes',
        currentSelection.filter((id) => !allItemIds.includes(id))
      );
    } else {
      // Select all items in this section
      const newSelection = [...currentSelection];
      allItemIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      setValue('cuisineTypes', newSelection);
    }
  };

  const handleCuisineSelect = (cuisineId: string) => {
    const currentSelection = watch('cuisineTypes') || [];
    if (currentSelection.includes(cuisineId)) {
      // Remove if already selected
      setValue(
        'cuisineTypes',
        currentSelection.filter((id) => id !== cuisineId)
      );
    } else {
      // Add if not already selected
      setValue('cuisineTypes', [...currentSelection, cuisineId]);
    }
  };

  const handleComplexitySelect = (complexityId: string) => {
    const currentSelection = watch('complexityLevels') || [];
    if (currentSelection.includes(complexityId)) {
      // Remove if already selected
      setValue(
        'complexityLevels',
        currentSelection.filter((id) => id !== complexityId)
      );
    } else {
      // Add if not already selected
      setValue('complexityLevels', [...currentSelection, complexityId]);
    }
  };

  const selectedMealTypes = watch('mealType');
  const watchStartDate = watch('startDate');

  const today = new Date().toISOString().split('T')[0];

  const handleMealTypeSelect = (mealTypeId: string) => {
    const currentSelection = [...selectedMealTypes];

    if (currentSelection.includes(mealTypeId)) {
      const newSelection = currentSelection.filter((id) => id !== mealTypeId);
      setValue('mealType', newSelection);

      if (newSelection.length === 0) {
        trigger('mealType');
      }
    } else {
      setValue('mealType', [...currentSelection, mealTypeId], {
        shouldValidate: false,
      });

      if (errors.mealType) {
        clearErrors('mealType');
      }
    }
  };

  useEffect(() => {
    if (
      lastMessage &&
      lastMessage.type === 'meal_plan_completed' &&
      lastMessage.meal_plan_id === createdMealPlanId
    ) {
      // Meal plan is ready
      if (lastMessage.meal_plan_id === createdMealPlanId) {
        dispatch(addMealPlan(lastMessage.meal_plan));
      }
      setIsLoading(false);
      setIsComplete(true);
    } else if (
      lastMessage &&
      lastMessage.type === 'meal_plan_error' &&
      lastMessage.meal_plan_id === createdMealPlanId
    ) {
      // Handle error
      setIsLoading(false);
      toast.error(`Error creating meal plan: ${lastMessage.error}`);
    }
  }, [lastMessage, createdMealPlanId, dispatch]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (data: FormValues) => {
    if (currentStep < totalSteps) {
      if (currentStep === 2) {
        if (data.mealType.length === 0) {
          setValue('mealType', [], { shouldValidate: true });
          return;
        }
      }
      console.log('currentStep', data);
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create meal plan
      setIsLoading(true);
      try {
        const user = await auth.currentUser;
        if (!user) {
          toast.error('You must be logged in to create a meal plan');
          setIsLoading(false);
          return;
        }
        const token = await user.getIdToken();

        const response = await axios.post(
          'http://localhost:8000/api/v1/meal-plans',
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response?.data;
        console.log('Meal Plan Creation Started', result);

        dispatch(addMealPlan(result));
        setCreatedMealPlanId(result._id);
      } catch (error) {
        console.error('Error creating meal plan', error);
        toast.error('Error creating meal plan');
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  //todo: include step for weight loss, weight gain, or maintenance

  const renderStepper = () => {
    return (
      <div className='flex items-center mb-6 px-6'>
        <div className='flex space-x-3'>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-14 h-1.5 rounded-full flex items-center justify-center ${
                index + 1 <= currentStep ? 'bg-gray-600 ' : 'bg-gray-100'
              }`}
            ></div>
          ))}
        </div>
        <div className='ml-auto text-sm font-normal text-gray-500'>
          Step {currentStep} of {totalSteps}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 overflow-hidden bg-opacity-50 flex justify-end'
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className='relative w-full max-w-md bg-white h-full shadow-lg'
        >
          <div className='fixed inset-0 z-50 overflow-hidden bg-opacity-50 flex justify-end'>
            <div className='relative w-full max-w-xl bg-white h-full shadow-lg transform transition-transform duration-300 ease-in-out'>
              {/* Header with title and close button */}
              <div className='flex items-center justify-between p-4 border-b h-16 border-gray-200'>
                <h2 className='text-gray-700 font-semibold'>
                  Create a New Meal Plan
                </h2>
                <button
                  onClick={onClose}
                  className='text-gray-800 cursor-pointer hover:text-gray-600'
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
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              {/* Main content */}
              <div className='flex flex-col h-full'>
                <div className='pt-4'>
                  {currentStep > 1 && !isLoading && !isComplete && (
                    <div className='px-6 mb-4'>
                      <button
                        type='button'
                        onClick={handleBack}
                        className='mr-4 text-gray-600 cursor-pointer items-center text-sm flex gap-2 hover:text-gray-800'
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
                            strokeWidth={3}
                            d='M7 16l-4-4m0 0l4-4m-4 4h18'
                          />
                        </svg>
                        Back
                      </button>
                    </div>
                  )}
                  {!isLoading && !isComplete && renderStepper()}
                </div>

                <div className='flex-1 overflow-y-auto pb-16 '>
                  {isLoading && !isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='flex flex-col items-center justify-center h-full space-y-6 px-6'
                    >
                      <div className='w-24 h-24 rounded-full border-4 border-blue-500 border-t-transparent animate-spin'></div>
                      <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className='text-xl font-semibold text-gray-800'
                      >
                        Creating your meal plan
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className='text-gray-500'
                      >
                        Your meal plan will be ready in a jiffy
                      </motion.p>
                    </motion.div>
                  )}

                  {isComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='flex flex-col items-center justify-center h-full space-y-2 px-6'
                    >
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className='text-2xl font-medium text-gray-600'
                      >
                        Your meal plan is Ready
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className='text-gray-500 font-normal text-sm'
                      >
                        Yes, we are fast and awesome like that 🚀
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className='flex space-y-5 flex-col mt-8 w-full'
                      >
                        <div className='flex space-y-5 flex-col mt-8 w-full'>
                          <Button
                            className='border border-gray-900 py-3 text-gray-900 cursor-pointer'
                            variant='secondary'
                            onClick={() => {
                              onComplete();
                              onClose();
                              setActiveTab('askGenie');
                            }}
                          >
                            Go to Ask Genie
                          </Button>
                          <Button
                            className='px-6 py-3 text-white cursor-pointer'
                            onClick={() => {
                              onComplete();
                              onClose();
                              setActiveTab('mealPlanner');
                            }}
                          >
                            View Meal Plan
                          </Button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {!isLoading && !isComplete && (
                    <motion.form
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSubmit(onSubmit)}
                      className='flex flex-col flex-1 h-full'
                    >
                      {currentStep === 1 && (
                        <motion.div
                          className='flex-grow overflow-y-auto px-6'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.h3
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className='font-normal mb-4 text-left text-gray-500'
                          >
                            Select the date range for your meal plan
                          </motion.h3>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className='mb-4'
                          >
                            <label className='block text-sm font-normal text-gray-900 mb-1 text-left'>
                              From
                            </label>
                            <div className='relative'>
                              <input
                                type='date'
                                min={today}
                                placeholder='Start date of meal plan'
                                className={`w-full pl-3 py-4 border ${
                                  errors.startDate
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md  appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-3`}
                                {...register('startDate', {
                                  required: 'Start date is required',
                                })}
                              />
                            </div>
                            {errors.startDate && (
                              <p className='mt-1 text-sm text-red-600 text-left'>
                                {errors.startDate.message}
                              </p>
                            )}
                          </motion.div>
                          <motion.div
                            className='mb-6'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <label className='block text-sm font-normal text-gray-900 mb-1 text-left'>
                              To
                            </label>
                            <div className='relative'>
                              <input
                                type='date'
                                placeholder='End date of meal plan'
                                min={watchStartDate || today}
                                className={`w-full pl-3 py-4 border ${
                                  errors.endDate
                                    ? 'border-red-500'
                                    : 'border-gray-300'
                                } rounded-md  appearanc
                  e-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-3`}
                                {...register('endDate', {
                                  required: 'End date is required',
                                  validate: (value) =>
                                    !watchStartDate ||
                                    value >= watchStartDate ||
                                    'End date must be after start date',
                                })}
                              />
                            </div>
                            {errors.endDate && (
                              <p className='mt-1 text-sm text-red-600 text-left'>
                                {errors.endDate.message}
                              </p>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                      {currentStep === 2 && (
                        <motion.div
                          className='flex-grow overflow-y-auto px-6'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.h3
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className='font-normal mb-4 text-left text-gray-500'
                          >
                            Select your meal type/menu
                          </motion.h3>
                          <div className='space-y-3'>
                            {mealTypeOptions.map((option, index) => (
                              <motion.div
                                key={option.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * (index + 1) }}
                                onClick={() => handleMealTypeSelect(option.id)}
                                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                                  selectedMealTypes.includes(option.id)
                                    ? 'bg-gray-100 border border-gray-300'
                                    : 'border border-gray-300 bg-gray-50'
                                }`}
                              >
                                <div className='mr-3'>
                                  <div
                                    className={`w-4 h-4 border rounded ${
                                      selectedMealTypes.includes(option.id)
                                        ? 'bg-gray-900 border-gray-900'
                                        : 'border-gray-400'
                                    } flex items-center justify-center`}
                                  >
                                    {selectedMealTypes.includes(option.id) && (
                                      <div className='w-3 h-3  rounded-sm'>
                                        <svg
                                          xmlns='http://www.w3.org/2000/svg'
                                          className='h-3 w-3 text-white'
                                          viewBox='0 0 20 20'
                                          fill='currentColor'
                                        >
                                          <path
                                            fillRule='evenodd'
                                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                            clipRule='evenodd'
                                          />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className=''>
                                  <span className='text-gray-500 text-sm font-medium'>
                                    {option.label}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          <input
                            type='hidden'
                            {...register('mealType', {
                              validate: (value) =>
                                value.length > 0 ||
                                'Please select at least one meal type',
                            })}
                          />
                          {errors.mealType && (
                            <p className='mt-1 text-sm text-red-600 text-left'>
                              {errors.mealType.message}
                            </p>
                          )}
                        </motion.div>
                      )}
                      {currentStep === 3 && (
                        <motion.div
                          className='flex-grow overflow-y-auto px-6'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.h3
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className='font-normal mb-4 text-left text-gray-500'
                          >
                            Select your dietary preferences
                          </motion.h3>
                          <div className='space-y-4'>
                            {dietarySections.map((section, index) => {
                              const isExpanded = expandedSections.includes(
                                section.id
                              );
                              const selectedPreferences =
                                watch('dietaryPreferences') || [];
                              const allSectionItemsSelected =
                                section.items.every((item) =>
                                  selectedPreferences.includes(item.id)
                                );
                              const someSectionItemsSelected =
                                section.items.some((item) =>
                                  selectedPreferences.includes(item.id)
                                );

                              return (
                                <motion.div
                                  key={section.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * (index + 1) }}
                                  className='border border-gray-100 rounded-md'
                                >
                                  <div
                                    className='flex items-center justify-between p-3 cursor-pointer bg-gray-50'
                                    onClick={() => toggleSection(section.id)}
                                  >
                                    <div className='flex items-center'>
                                      <div
                                        className='mr-3'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectAllInSection(
                                            section.items
                                          );
                                        }}
                                      >
                                        <div
                                          className={`w-4 h-4 border rounded ${
                                            allSectionItemsSelected
                                              ? 'bg-gray-900 border-gray-900'
                                              : someSectionItemsSelected
                                              ? 'bg-gray-300 border-gray-400'
                                              : 'border-gray-400'
                                          } flex items-center justify-center`}
                                        >
                                          {allSectionItemsSelected && (
                                            <svg
                                              xmlns='http://www.w3.org/2000/svg'
                                              className='h-3 w-3 text-white'
                                              viewBox='0 0 20 20'
                                              fill='currentColor'
                                            >
                                              <path
                                                fillRule='evenodd'
                                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                clipRule='evenodd'
                                              />
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                      <span className='font-medium text-gray-700'>
                                        {section.title}
                                      </span>
                                    </div>
                                    <motion.button
                                      type='button'
                                      initial={false}
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                      className='text-gray-500 focus:outline-none cursor-pointer'
                                    >
                                      <svg
                                        className='w-5 h-5'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth='2'
                                          d='M19 9l-7 7-7-7'
                                        />
                                      </svg>
                                    </motion.button>
                                  </div>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className='overflow-hidden'
                                      >
                                        <div className='p-3 border-t border-gray-100 bg-white'>
                                          <div className='space-y-2'>
                                            {section.items.map((item) => (
                                              <div
                                                key={item.id}
                                                onClick={() =>
                                                  handlePreferenceSelect(
                                                    item.id
                                                  )
                                                }
                                                className='flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50'
                                              >
                                                <div className='mr-3'>
                                                  <div
                                                    className={`w-4 h-4 border rounded ${
                                                      selectedPreferences.includes(
                                                        item.id
                                                      )
                                                        ? 'bg-gray-900 border-gray-900'
                                                        : 'border-gray-400'
                                                    } flex items-center justify-center`}
                                                  >
                                                    {selectedPreferences.includes(
                                                      item.id
                                                    ) && (
                                                      <svg
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        className='h-3 w-3 text-white'
                                                        viewBox='0 0 20 20'
                                                        fill='currentColor'
                                                      >
                                                        <path
                                                          fillRule='evenodd'
                                                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                          clipRule='evenodd'
                                                        />
                                                      </svg>
                                                    )}
                                                  </div>
                                                </div>
                                                <span className='text-gray-500'>
                                                  {item.label}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {currentStep === 4 && (
                        <motion.div
                          className='flex-grow overflow-y-auto px-6'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.h3
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className='font-normal mb-4 text-left text-gray-500'
                          >
                            Select your cuisine type
                          </motion.h3>
                          <div className='space-y-4'>
                            {cuisineSections.map((section, index) => {
                              const isExpanded = expandedSections.includes(
                                section.id
                              );
                              const selectedCuisines =
                                watch('cuisineTypes') || [];
                              const allSectionItemsSelected =
                                section.items.every((item) =>
                                  selectedCuisines.includes(item.id)
                                );
                              const someSectionItemsSelected =
                                section.items.some((item) =>
                                  selectedCuisines.includes(item.id)
                                );

                              return (
                                <motion.div
                                  key={section.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * (index + 1) }}
                                  className='border border-gray-100 rounded-md'
                                >
                                  <div
                                    className='flex items-center justify-between p-3 cursor-pointer bg-gray-50'
                                    onClick={() => toggleSection(section.id)}
                                  >
                                    <div className='flex items-center'>
                                      <div
                                        className='mr-3'
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectAllCuisines(
                                            section.items
                                          );
                                        }}
                                      >
                                        <div
                                          className={`w-4 h-4 border rounded ${
                                            allSectionItemsSelected
                                              ? 'bg-gray-900 border-gray-900'
                                              : someSectionItemsSelected
                                              ? 'bg-gray-300 border-gray-400'
                                              : 'border-gray-400'
                                          } flex items-center justify-center`}
                                        >
                                          {allSectionItemsSelected && (
                                            <svg
                                              xmlns='http://www.w3.org/2000/svg'
                                              className='h-3 w-3 text-white'
                                              viewBox='0 0 20 20'
                                              fill='currentColor'
                                            >
                                              <path
                                                fillRule='evenodd'
                                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                clipRule='evenodd'
                                              />
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                      <span className='font-medium text-gray-700'>
                                        {section.title}
                                      </span>
                                    </div>
                                    <motion.button
                                      type='button'
                                      initial={false}
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                      className='text-gray-500 focus:outline-none'
                                    >
                                      <svg
                                        className='w-5 h-5'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                      >
                                        <path
                                          strokeLinecap='round'
                                          strokeLinejoin='round'
                                          strokeWidth='2'
                                          d='M19 9l-7 7-7-7'
                                        />
                                      </svg>
                                    </motion.button>
                                  </div>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className='overflow-hidden'
                                      >
                                        <div className='p-3 border-t border-gray-100 bg-white'>
                                          <div className='space-y-2'>
                                            {section.items.map((item) => (
                                              <div
                                                key={item.id}
                                                onClick={() =>
                                                  handleCuisineSelect(item.id)
                                                }
                                                className='flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50'
                                              >
                                                <div className='mr-3'>
                                                  <div
                                                    className={`w-4 h-4 border rounded ${
                                                      selectedCuisines.includes(
                                                        item.id
                                                      )
                                                        ? 'bg-gray-900 border-gray-900'
                                                        : 'border-gray-400'
                                                    } flex items-center justify-center`}
                                                  >
                                                    {selectedCuisines.includes(
                                                      item.id
                                                    ) && (
                                                      <svg
                                                        xmlns='http://www.w3.org/2000/svg'
                                                        className='h-3 w-3 text-white'
                                                        viewBox='0 0 20 20'
                                                        fill='currentColor'
                                                      >
                                                        <path
                                                          fillRule='evenodd'
                                                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                          clipRule='evenodd'
                                                        />
                                                      </svg>
                                                    )}
                                                  </div>
                                                </div>
                                                <span className='text-gray-500'>
                                                  {item.label}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                      {currentStep === 5 && (
                        <motion.div
                          className='flex-grow overflow-y-auto px-6'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.h3
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className='font-normal mb-4 text-left text-gray-500'
                          >
                            Select your meal complexity level(s)
                          </motion.h3>
                          <div className='space-y-4'>
                            {complexityOptions.map((option, index) => {
                              const selectedComplexities =
                                watch('complexityLevels') || [];
                              return (
                                <motion.div
                                  key={option.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 * (index + 1) }}
                                  onClick={() =>
                                    handleComplexitySelect(option.id)
                                  }
                                  className={`flex items-start p-4 rounded-md cursor-pointer border ${
                                    selectedComplexities.includes(option.id)
                                      ? 'bg-gray-100 border-gray-300'
                                      : 'border-gray-300 bg-gray-50'
                                  }`}
                                >
                                  <div className='mr-3 mt-1'>
                                    <div
                                      className={`w-4 h-4 border rounded ${
                                        selectedComplexities.includes(option.id)
                                          ? 'bg-gray-900 border-gray-900'
                                          : 'border-gray-400'
                                      } flex items-center justify-center`}
                                    >
                                      {selectedComplexities.includes(
                                        option.id
                                      ) && (
                                        <svg
                                          xmlns='http://www.w3.org/2000/svg'
                                          className='h-3 w-3 text-white'
                                          viewBox='0 0 20 20'
                                          fill='currentColor'
                                        >
                                          <path
                                            fillRule='evenodd'
                                            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                            clipRule='evenodd'
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <div className='text-left'>
                                    <h4 className='font-medium text-gray-800'>
                                      {option.title}
                                    </h4>
                                    <p className='text-sm text-gray-500 mt-1'>
                                      {option.description}
                                    </p>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                      {!isLoading && !isComplete && (
                        <div className='sticky bottom-0 mt-auto bg-gray-50  border-t border-gray-300'>
                          <div className='px-6 py-4'>
                            {' '}
                            <button
                              type='submit'
                              className='w-full cursor-pointer p-4 flex items-center justify-center text-white bg-gray-900 rounded-4xl'
                            >
                              {currentStep < totalSteps
                                ? 'Next'
                                : 'Create Meal Plan'}
                              <RightArrowIcon style='-ml-6 text-white' />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.form>
                  )}
                </div>
              </div>
            </div>
            <ToastContainer />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateMealPlanModal;
