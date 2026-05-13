import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import { getCategory } from '../../utils/constants';

const SearchBar = ({
  selectedCategory,
  globalSearch,
  categorySearch,
  onGlobalSearchChange,
  onCategorySearchChange,
  onBack,
}) => {
  return (
    <div className="mb-8">
      {selectedCategory && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">{getCategory(selectedCategory).icon}</span>
            {selectedCategory}
          </h1>
        </div>
      )}

      {selectedCategory ? (
        /* Category search — filters within selected category */
        <div className="relative max-w-md">
          <FiSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            value={categorySearch}
            onChange={(e) => onCategorySearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
          />
          {categorySearch && (
            <button
              onClick={() => onCategorySearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        /* Global search — searches all products */
        <div className="relative max-w-xl">
          <FiSearch
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search..."
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg"
          />
          {globalSearch && (
            <button
              onClick={() => onGlobalSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
