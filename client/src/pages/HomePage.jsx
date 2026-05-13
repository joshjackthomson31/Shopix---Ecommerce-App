import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Fuse from 'fuse.js';
import { useProducts } from '../hooks';
import { LoadingWrapper } from '../components/ui';
import SearchBar from '../components/home/SearchBar';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductGrid from '../components/home/ProductGrid';

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'brand', weight: 0.3 },
    { name: 'category', weight: 0.2 },
    { name: 'description', weight: 0.1 },
  ],
  threshold: 0.4,
  distance: 100,
  includeScore: true,
  minMatchCharLength: 2,
};

const SCROLL_POSITION_KEY = 'homepageScrollPosition';
const SEARCH_QUERY_KEY = 'homepageSearchQuery';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, fetchProducts } = useProducts({ immediate: false });
  const [categories, setCategories] = useState([]);

  const selectedCategory = searchParams.get('category');

  // Search state — persisted in sessionStorage
  const [globalSearch, setGlobalSearch] = useState(
    () => sessionStorage.getItem(SEARCH_QUERY_KEY) || ''
  );
  const [categorySearch, setCategorySearch] = useState('');
  const [debouncedGlobalSearch, setDebouncedGlobalSearch] = useState(
    () => sessionStorage.getItem(SEARCH_QUERY_KEY) || ''
  );

  // Persist global search query across navigations
  useEffect(() => {
    if (globalSearch) {
      sessionStorage.setItem(SEARCH_QUERY_KEY, globalSearch);
    } else {
      sessionStorage.removeItem(SEARCH_QUERY_KEY);
    }
  }, [globalSearch]);

  // Debounce global search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedGlobalSearch(globalSearch), 300);
    return () => clearTimeout(timer);
  }, [globalSearch]);

  // Restore scroll position when returning to home from category/product
  useEffect(() => {
    if (!selectedCategory && !loading && (categories.length > 0 || products.length > 0)) {
      const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedPosition) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: parseInt(savedPosition, 10), behavior: 'instant' });
        });
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
      }
    }
  }, [selectedCategory, loading, categories.length, products.length]);

  // Save scroll position before leaving this page
  useEffect(() => {
    const saveScroll = () =>
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());

    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link?.href?.includes('/product/')) saveScroll();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('beforeunload', saveScroll);
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, []);

  // Initial product fetch
  useEffect(() => {
    fetchProducts().then((result) => {
      if (result.success && result.categories) {
        setCategories(result.categories.filter((c) => c !== 'All'));
      }
    });
  }, [fetchProducts]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    return products.reduce((grouped, product) => {
      if (!grouped[product.category]) grouped[product.category] = [];
      grouped[product.category].push(product);
      return grouped;
    }, {});
  }, [products]);

  // Fuse instance for global fuzzy search
  const fuse = useMemo(() => new Fuse(products, fuseOptions), [products]);

  // Global search results
  const searchResults = useMemo(() => {
    if (!debouncedGlobalSearch) return [];
    return fuse.search(debouncedGlobalSearch).map((r) => r.item);
  }, [debouncedGlobalSearch, fuse]);

  // Category-scoped search results
  const filteredCategoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    const categoryProducts = productsByCategory[selectedCategory] || [];
    if (!categorySearch.trim()) return categoryProducts;
    const categoryFuse = new Fuse(categoryProducts, fuseOptions);
    return categoryFuse.search(categorySearch).map((r) => r.item);
  }, [selectedCategory, productsByCategory, categorySearch]);

  const handleSelectCategory = (category) => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
    setSearchParams({ category });
    setCategorySearch('');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSearchParams({});
    setCategorySearch('');
  };

  const isSearching = debouncedGlobalSearch.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchBar
        selectedCategory={selectedCategory}
        globalSearch={globalSearch}
        categorySearch={categorySearch}
        onGlobalSearchChange={setGlobalSearch}
        onCategorySearchChange={setCategorySearch}
        onBack={handleBack}
      />

      <LoadingWrapper loading={loading}>
        {error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : isSearching ? (
          <ProductGrid
            products={searchResults}
            emptyMessage="No products found matching your search."
            onClear={() => setGlobalSearch('')}
            clearLabel="Clear search"
            countLabel={`Found ${searchResults.length} product${searchResults.length !== 1 ? 's' : ''} for "${debouncedGlobalSearch}"`}
          />
        ) : selectedCategory ? (
          <ProductGrid
            products={filteredCategoryProducts}
            emptyMessage="No products found matching your search."
            onClear={() => setCategorySearch('')}
            clearLabel="Clear search"
            countLabel={
              categorySearch
                ? `${filteredCategoryProducts.length} result${filteredCategoryProducts.length !== 1 ? 's' : ''} for "${categorySearch}"`
                : `${filteredCategoryProducts.length} products in ${selectedCategory}`
            }
          />
        ) : (
          <CategoryGrid
            categories={categories}
            onSelectCategory={handleSelectCategory}
          />
        )}
      </LoadingWrapper>
    </div>
  );
};

export default HomePage;
