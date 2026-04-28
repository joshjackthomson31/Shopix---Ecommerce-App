import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import Fuse from 'fuse.js';
import { useProducts } from '../hooks';
import ProductCard from '../components/ProductCard';
import { getCategory } from '../utils/constants';
import { LoadingWrapper } from '../components/ui';

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'brand', weight: 0.3 },
    { name: 'category', weight: 0.2 },
    { name: 'description', weight: 0.1 }
  ],
  threshold: 0.4,      // 0 = exact match, 1 = match anything
  distance: 100,       // How close matches must be
  includeScore: true,
  minMatchCharLength: 2
};

const SCROLL_POSITION_KEY = 'homepageScrollPosition';
const SEARCH_QUERY_KEY = 'homepageSearchQuery';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories: _apiCategories, loading, error, fetchProducts } = useProducts({ immediate: false });
  const [categories, setCategories] = useState([]);
  
  // Get category from URL
  const selectedCategory = searchParams.get('category');
  
  // Search state - global (home) and category-specific
  // Initialize from sessionStorage if available
  const [globalSearch, setGlobalSearch] = useState(() => {
    return sessionStorage.getItem(SEARCH_QUERY_KEY) || '';
  });
  const [categorySearch, setCategorySearch] = useState('');
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState(() => {
    return sessionStorage.getItem(SEARCH_QUERY_KEY) || '';
  });

  // Save search query to sessionStorage whenever it changes
  useEffect(() => {
    if (globalSearch) {
      sessionStorage.setItem(SEARCH_QUERY_KEY, globalSearch);
    } else {
      sessionStorage.removeItem(SEARCH_QUERY_KEY);
    }
  }, [globalSearch]);

  // Debounce global search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGlobalSearch(globalSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [globalSearch]);

  // Restore scroll position when returning from category view or product detail
  useEffect(() => {
    // Only restore scroll when going back to home (no category selected)
    if (!selectedCategory && !loading && (categories.length > 0 || products.length > 0)) {
      const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        // Wait for DOM to render, then scroll
        requestAnimationFrame(() => {
          window.scrollTo({ top: position, behavior: 'instant' });
        });
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
      }
    }
  }, [selectedCategory, loading, categories.length, products.length]);

  // Save scroll position before leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
    };
    
    // Save scroll position when clicking links (before navigation)
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href && link.href.includes('/product/')) {
        sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
      }
    };
    
    document.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Fetch all products (filtering done on frontend for better category matching)
  useEffect(() => {
    fetchProducts().then(result => {
      if (result.success && result.categories) {
        setCategories(result.categories.filter(c => c !== 'All'));
      }
    });
  }, [fetchProducts]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped = {};
    products.forEach((product) => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  }, [products]);

  // Create Fuse instance for all products (global search)
  const fuse = useMemo(() => {
    return new Fuse(products, fuseOptions);
  }, [products]);

  // Filter products within selected category using fuzzy search
  const filteredCategoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryProducts = productsByCategory[selectedCategory] || [];
    if (!categorySearch.trim()) return categoryProducts;
    
    // Use Fuse.js for fuzzy search within category
    const categoryFuse = new Fuse(categoryProducts, fuseOptions);
    const results = categoryFuse.search(categorySearch);
    return results.map(result => result.item);
  }, [selectedCategory, productsByCategory, categorySearch]);

  // Handle category click - updates URL
  const viewCategory = (category) => {
    // Save current scroll position before navigating
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
    setSearchParams({ category });
    setCategorySearch('');
    window.scrollTo(0, 0);
  };

  // Back to all categories - clears URL param (scroll restored via useEffect)
  const backToCategories = () => {
    setSearchParams({});
    setCategorySearch('');
  };

  // Filter products for global search using fuzzy search
  const searchResults = useMemo(() => {
    if (!debouncedGlobalSearch) return [];
    
    // Use Fuse.js for fuzzy search
    const results = fuse.search(debouncedGlobalSearch);
    return results.map(result => result.item);
  }, [debouncedGlobalSearch, fuse]);
  
  const isSearching = debouncedGlobalSearch.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        {selectedCategory && (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={backToCategories}
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
        
        {/* Search Bar - Different for home vs category view */}
        {selectedCategory ? (
          /* Category Search - filters products within the category */
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
            />
            {categorySearch && (
              <button
                onClick={() => setCategorySearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          /* Global Search - searches categories and products */
          <div className="relative max-w-xl">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      <LoadingWrapper loading={loading}>
        {error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : isSearching ? (
        /* Search Results - Products only */
        <>
          <div className="mb-6">
            <p className="text-gray-500">
              Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} for "{debouncedGlobalSearch}"
            </p>
          </div>
          
          {searchResults.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No products found matching your search.</p>
              <button
                onClick={() => setGlobalSearch('')}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      ) : selectedCategory ? (
        /* Single Category View */
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-500">
              {categorySearch 
                ? `${filteredCategoryProducts.length} result${filteredCategoryProducts.length !== 1 ? 's' : ''} for "${categorySearch}"`
                : `${filteredCategoryProducts.length} products in ${selectedCategory}`
              }
            </p>
          </div>
          
          {filteredCategoryProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No products found matching your search.</p>
              <button
                onClick={() => setCategorySearch('')}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCategoryProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Category Cards Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category) => {
            const catDetails = getCategory(category);
            
            return (
              <button
                key={category}
                onClick={() => viewCategory(category)}
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
                  <div className={`absolute inset-0 bg-gradient-to-t ${catDetails.color} opacity-60 group-hover:opacity-70 transition-opacity`}></div>
                  
                  {/* Icon */}
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    {catDetails.icon}
                  </div>
                </div>
                
                {/* Category Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {category}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      )}
      </LoadingWrapper>
    </div>
  );
};

export default HomePage;
