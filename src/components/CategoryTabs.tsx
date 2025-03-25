import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Category {
  name: string;
  path: string;
}

interface CategoryTabsProps {
  categories: Category[];
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories }) => {
  const location = useLocation();
  
  return (
    <div className="flex overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex space-x-2">
        {categories.map((category) => (
          <Link
            key={category.path}
            to={category.path}
            className={`px-6 py-3 rounded-lg whitespace-nowrap transition-colors ${
              location.pathname === category.path
                ? 'bg-dark-800 text-white dark:bg-primary-700'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-200 dark:hover:bg-dark-600'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;