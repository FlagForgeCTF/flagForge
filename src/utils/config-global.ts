export const filters = [
  // radio
  {
    id: 'type',
    name: 'Type',
    options: [
      { value: 'course', label: 'Course' },
      { value: 'test', label: 'Test' },
    ],
  },
  // checkbox
  {
    id: 'difficulty',
    name: 'Difficulty',
    options: [
      { value: 'easy', label: 'Beginner' },
      { value: 'medium', label: 'Intermediate' },
      { value: 'hard', label: 'Advanced' },
    ],
  },
  // checkbox
  {
    id: 'category',
    name: 'Category',
    options: [],
  },
];

export const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

export const API_URL = import.meta.env.VITE_API_URL;
export const FILE_SIZE = 2 * 1024 * 1024;

export const FILE_EXTENSIONS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];
