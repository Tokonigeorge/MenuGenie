import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Button from './button';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { auth } from '../firebaseConfig';
import { useWebSocket } from '../hooks/websocketContext';
import { useDispatch } from 'react-redux';
import { addMealPlan } from '../store/mealPlanSlice';
interface CreateMealPlanModalProps {
  onClose: () => void;
  onComplete: () => void;
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
}) => {
  const dispatch = useDispatch();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
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

  const mealTypeOptions = [
    { id: 'Breakfast', label: 'Breakfast' },
    { id: 'Lunch', label: 'Lunch' },
    { id: 'Dinner', label: 'Dinner' },
    { id: 'Snack', label: 'Snack' },
  ];
  const dietarySections = [
    {
      id: 'allergies',
      title: 'Medical & Allergy-Related',
      items: [
        { id: 'nut-free', label: 'Nut Free' },
        { id: 'gluten-free', label: 'Gluten Free' },
        { id: 'dairy-free', label: 'Dairy Free' },
        { id: 'shellfish-free', label: 'Shellfish Free' },
        { id: 'egg-free', label: 'Egg Free' },
        { id: 'soy-free', label: 'Soy Free' },
      ],
    },
    {
      id: 'diets',
      title: 'Diet Types',
      items: [
        { id: 'vegan', label: 'Vegan' },
        { id: 'vegetarian', label: 'Vegetarian' },
        { id: 'pescatarian', label: 'Pescatarian' },
        { id: 'keto', label: 'Keto' },
      ],
    },
    {
      id: 'intolerances',
      title: 'Intolerances',
      items: [
        { id: 'lactose', label: 'Lactose' },
        { id: 'fodmap', label: 'FODMAP' },
      ],
    },
    {
      id: 'preferences',
      title: 'Other Preferences',
      items: [
        { id: 'low-carb', label: 'Low Carb' },
        { id: 'high-protein', label: 'High Protein' },
        { id: 'low-fat', label: 'Low Fat' },
      ],
    },
  ];

  const cuisineSections = [
    {
      id: 'african',
      title: 'African',
      items: [
        { id: 'nigerian', label: 'Nigerian' },
        { id: 'ethiopian', label: 'Ethiopian' },
        { id: 'moroccan', label: 'Moroccan' },
      ],
    },
    {
      id: 'middle-eastern',
      title: 'Middle Eastern',
      items: [
        { id: 'lebanese', label: 'Lebanese' },
        { id: 'turkish', label: 'Turkish' },
        { id: 'persian', label: 'Persian' },
      ],
    },
    {
      id: 'european',
      title: 'European',
      items: [
        { id: 'italian', label: 'Italian' },
        { id: 'french', label: 'French' },
        { id: 'spanish', label: 'Spanish' },
        { id: 'greek', label: 'Greek' },
      ],
    },
    {
      id: 'american',
      title: 'American',
      items: [
        { id: 'north-american', label: 'North American' },
        { id: 'south-american', label: 'South American' },
        { id: 'caribbean', label: 'Caribbean' },
      ],
    },
    {
      id: 'asian',
      title: 'Asian',
      items: [
        { id: 'chinese', label: 'Chinese' },
        { id: 'indian', label: 'Indian' },
        { id: 'japanese', label: 'Japanese' },
        { id: 'thai', label: 'Thai' },
        { id: 'vietnamese', label: 'Vietnamese' },
      ],
    },
    {
      id: 'diet-specific',
      title: 'Diet-Specific & Fusion',
      items: [
        { id: 'fusion', label: 'Fusion' },
        { id: 'plant-based', label: 'Plant-Based' },
        { id: 'gluten-free', label: 'Gluten-Free' },
      ],
    },
  ];

  const complexityOptions = [
    {
      id: 'simple',
      title: 'Simple',
      description:
        'Quick and easy meals with minimal ingredients and steps (Under 30 mins)',
    },
    {
      id: 'moderate',
      title: 'Moderate',
      description:
        'Requires more prep, seasoning, and cooking techniques (30-60 mins)',
    },
    {
      id: 'complex',
      title: 'Complex',
      description:
        'Involves multiple cooking methods, longer prep, and precise execution (1-2 hours)',
    },
    {
      id: 'gourmet',
      title: 'Gourmet',
      description:
        'High-level techniques, intricate presentation, and premium ingredients (2+ hours)',
    },
  ];

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
  // Generate stepper circles
  const renderStepper = () => {
    return (
      <div className='flex items-center mb-6 px-6'>
        <div className='flex space-x-3'>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-16 h-2 rounded-full flex items-center justify-center ${
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

  //   const CalendarIcon = ({ onClick }: { onClick: () => void }) => (
  //     <svg
  //       width='20'
  //       height='21'
  //       viewBox='0 0 20 21'
  //       fill='none'
  //       xmlns='http://www.w3.org/2000/svg'
  //       className='absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer'
  //       onClick={onClick}
  //     >
  //       <path
  //         fillRule='evenodd'
  //         clipRule='evenodd'
  //         d='M7.49999 2.16659C7.49999 1.70635 7.12689 1.33325 6.66666 1.33325C6.20642 1.33325 5.83332 1.70635 5.83332 2.16659V2.99992H4.99999C3.15904 2.99992 1.66666 4.4923 1.66666 6.33325V15.4999C1.66666 17.3409 3.15904 18.8333 4.99999 18.8333H12.5C12.9602 18.8333 13.3333 18.4602 13.3333 17.9999C13.3333 17.5397 12.9602 17.1666 12.5 17.1666H4.99999C4.07952 17.1666 3.33332 16.4204 3.33332 15.4999V8.41658H16.6667V12.9999C16.6667 13.4602 17.0398 13.8333 17.5 13.8333C17.9602 13.8333 18.3333 13.4602 18.3333 12.9999V6.33325C18.3333 4.4923 16.8409 2.99992 15 2.99992H14.1667V2.16659C14.1667 1.70635 13.7936 1.33325 13.3333 1.33325C12.8731 1.33325 12.5 1.70635 12.5 2.16659V2.99992H7.49999V2.16659ZM13.3333 5.49992C12.8731 5.49992 12.5 5.12682 12.5 4.66658H7.49999C7.49999 5.12682 7.12689 5.49992 6.66666 5.49992C6.20642 5.49992 5.83332 5.12682 5.83332 4.66658H4.99999C4.07952 4.66658 3.33332 5.41278 3.33332 6.33325V6.74992H16.6667V6.33325C16.6667 5.41278 15.9205 4.66658 15 4.66658H14.1667C14.1667 5.12682 13.7936 5.49992 13.3333 5.49992Z'
  //         fill='#667185'
  //       />
  //       <path
  //         d='M17.5 15.4999C17.5 15.0397 17.1269 14.6666 16.6667 14.6666C16.2064 14.6666 15.8333 15.0397 15.8333 15.4999V16.3333H15C14.5398 16.3333 14.1667 16.7063 14.1667 17.1666C14.1667 17.6268 14.5398 17.9999 15 17.9999H15.8333V18.8333C15.8333 19.2935 16.2064 19.6666 16.6667 19.6666C17.1269 19.6666 17.5 19.2935 17.5 18.8333V17.9999H18.3333C18.7936 17.9999 19.1667 17.6268 19.1667 17.1666C19.1667 16.7063 18.7936 16.3333 18.3333 16.3333H17.5V15.4999Z'
  //         fill='#667185'
  //       />
  //     </svg>
  //   );

  return (
    <div className='fixed inset-0 z-50 overflow-hidden bg-opacity-50 flex justify-end'>
      <div className='relative w-full max-w-xl bg-white h-full shadow-lg transform transition-transform duration-300 ease-in-out'>
        {/* Header with title and close button */}
        <div className='flex items-center justify-between p-4 border-b border-gray-200'>
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
        <div className='pt-4 pb-20 h-full overflow-y-auto flex flex-col'>
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
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
                Back
              </button>
            </div>
          )}
          {!isLoading && !isComplete && renderStepper()}

          {isLoading && (
            <div className='flex flex-col items-center justify-center h-full space-y-6 px-6'>
              <div className='w-24 h-24 rounded-full border-4 border-blue-500 border-t-transparent animate-spin'></div>
              <h3 className='text-xl font-semibold text-gray-800'>
                Creating your meal plan
              </h3>
              <p className='text-gray-500'>
                Your meal plan will be ready in a jiffy
              </p>
            </div>
          )}

          {isComplete && (
            <div className='flex flex-col items-center justify-center h-full space-y-2 px-6'>
              <h3 className='text-2xl font-medium text-gray-600'>
                Your meal plan is Ready
              </h3>
              <p className='text-gray-500 font-normal text-sm'>
                Yes, we are fast and awesome like that 🚀
              </p>
              <div className='flex space-y-5 flex-col mt-8 w-full'>
                <Button
                  className='border border-gray-900 py-3 text-gray-900 cursor-pointer'
                  variant='secondary'
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                >
                  Go to Ask Genie
                </Button>
                <Button
                  className='px-6 py-3 text-white cursor-pointer'
                  onClick={() => {
                    onComplete();
                    onClose();
                  }}
                >
                  View Meal Plan
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !isComplete && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col h-full justify-between'
            >
              {currentStep === 1 && (
                <div className='flex-grow overflow-y-auto px-6'>
                  {' '}
                  <h3 className='font-normal mb-4 text-left text-gray-500'>
                    Select the date range for your meal plan
                  </h3>
                  <div className='mb-4'>
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
                  </div>
                  <div className='mb-6'>
                    <label className='block text-sm font-normal text-gray-900 mb-1 text-left'>
                      To
                    </label>
                    <div className='relative'>
                      <input
                        type='date'
                        placeholder='End date of meal plan'
                        min={watchStartDate || today}
                        className={`w-full pl-3 py-4 border ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
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
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className='flex-grow overflow-y-auto px-6'>
                  <h3 className='font-normal mb-4 text-left text-gray-500'>
                    Select your meal type/menu
                  </h3>
                  <div className='space-y-3'>
                    {mealTypeOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={() => handleMealTypeSelect(option.id)}
                        className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                          selectedMealTypes.includes(option.id)
                            ? 'bg-gray-100 border border-gray-300'
                            : 'border border-gray-300  bg-gray-50'
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
                      </div>
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
                </div>
              )}
              {currentStep === 3 && (
                <div className='flex-grow overflow-y-auto px-6'>
                  <h3 className='font-normal mb-4 text-left text-gray-500'>
                    Select your dietary preferences
                  </h3>
                  <div className='space-y-4'>
                    {dietarySections.map((section) => {
                      const isExpanded = expandedSections.includes(section.id);
                      const selectedPreferences =
                        watch('dietaryPreferences') || [];
                      const allSectionItemsSelected = section.items.every(
                        (item) => selectedPreferences.includes(item.id)
                      );
                      const someSectionItemsSelected = section.items.some(
                        (item) => selectedPreferences.includes(item.id)
                      );

                      return (
                        <div
                          key={section.id}
                          className='border border-gray-100 rounded-md'
                        >
                          <div className='flex items-center justify-between p-3 cursor-pointer bg-gray-50'>
                            <div
                              className='flex items-center'
                              onClick={() =>
                                handleSelectAllInSection(section.items)
                              }
                            >
                              <div className='mr-3'>
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
                            <button
                              type='button'
                              onClick={() => toggleSection(section.id)}
                              className='text-gray-500 focus:outline-none cursor-pointer'
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isExpanded ? 'transform rotate-180' : ''
                                }`}
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
                            </button>
                          </div>

                          {isExpanded && (
                            <div className='p-3 border-t border-gray-100 bg-white'>
                              <div className='space-y-2'>
                                {section.items.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() =>
                                      handlePreferenceSelect(item.id)
                                    }
                                    className='flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50'
                                  >
                                    <div className='mr-3'>
                                      <div
                                        className={`w-4 h-4 border rounded ${
                                          selectedPreferences.includes(item.id)
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
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className='flex-grow overflow-y-auto px-6'>
                  <h3 className='font-normal mb-4 text-left text-gray-500'>
                    Select your cuisine type
                  </h3>
                  <div className='space-y-4'>
                    {cuisineSections.map((section) => {
                      const isExpanded = expandedSections.includes(section.id);
                      const selectedCuisines = watch('cuisineTypes') || [];
                      const allSectionItemsSelected = section.items.every(
                        (item) => selectedCuisines.includes(item.id)
                      );
                      const someSectionItemsSelected = section.items.some(
                        (item) => selectedCuisines.includes(item.id)
                      );

                      return (
                        <div
                          key={section.id}
                          className='border border-gray-100 rounded-md'
                        >
                          <div className='flex items-center justify-between p-3 cursor-pointer bg-gray-50'>
                            <div
                              className='flex items-center'
                              onClick={() =>
                                handleSelectAllCuisines(section.items)
                              }
                            >
                              <div className='mr-3'>
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
                            <button
                              type='button'
                              onClick={() => toggleSection(section.id)}
                              className='text-gray-500 focus:outline-none'
                            >
                              <svg
                                className={`w-5 h-5 transition-transform ${
                                  isExpanded ? 'transform rotate-180' : ''
                                }`}
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
                            </button>
                          </div>

                          {isExpanded && (
                            <div className='p-3 border-t border-gray-100 bg-white'>
                              <div className='space-y-2'>
                                {section.items.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => handleCuisineSelect(item.id)}
                                    className='flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50'
                                  >
                                    <div className='mr-3'>
                                      <div
                                        className={`w-4 h-4 border rounded ${
                                          selectedCuisines.includes(item.id)
                                            ? 'bg-gray-900 border-gray-900'
                                            : 'border-gray-400'
                                        } flex items-center justify-center`}
                                      >
                                        {selectedCuisines.includes(item.id) && (
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
                                    <span className='text-gray-700'>
                                      {item.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {currentStep === 5 && (
                <div className='flex-grow overflow-y-auto px-6'>
                  <h3 className='font-normal mb-4 text-left text-gray-500'>
                    Select your meal complexity level(s)
                  </h3>
                  <div className='space-y-4'>
                    {complexityOptions.map((option) => {
                      const selectedComplexities =
                        watch('complexityLevels') || [];
                      return (
                        <div
                          key={option.id}
                          onClick={() => handleComplexitySelect(option.id)}
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
                              {selectedComplexities.includes(option.id) && (
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className='pt-6 bg-gray-50 border-t border-gray-300 px-6'>
                <Button
                  type='submit'
                  className='w-full cursor-pointer p-4 flex items-center justify-center'
                  icon={
                    <svg
                      className='w-5 h-5 ml-2'
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
                  }
                  iconPosition='right'
                >
                  {currentStep < totalSteps ? 'Next' : 'Create Meal Plan'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateMealPlanModal;
