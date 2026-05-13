import { getCategory } from '../../utils/constants';

const CategoryGrid = ({ categories, onSelectCategory }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {categories.map((category) => {
        const catDetails = getCategory(category);

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 text-left"
          >
            {/* Category Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={catDetails.image}
                alt={category}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${catDetails.color} opacity-60 group-hover:opacity-70 transition-opacity`}
              ></div>

              {/* Icon */}
              <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-2xl shadow-lg">
                {catDetails.icon}
              </div>
            </div>

            {/* Category Name */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                {category}
              </h3>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
