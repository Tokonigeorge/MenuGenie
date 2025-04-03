export const complexityOptions = [
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

export const cuisineSections = [
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

export const mealTypeOptions = [
  { id: 'Breakfast', label: 'Breakfast' },
  { id: 'Lunch', label: 'Lunch' },
  { id: 'Dinner', label: 'Dinner' },
  { id: 'Snack', label: 'Snack' },
];
export const dietarySections = [
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
