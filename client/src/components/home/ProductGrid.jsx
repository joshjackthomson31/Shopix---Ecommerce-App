import ProductCard from '../ProductCard';

const ProductGrid = ({
  products,
  emptyMessage = 'No products found.',
  onClear,
  clearLabel = 'Clear search',
  countLabel,
}) => {
  return (
    <>
      {countLabel && (
        <div className="mb-6">
          <p className="text-gray-500">{countLabel}</p>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
          {onClear && (
            <button
              onClick={onClear}
              className="mt-4 text-indigo-600 hover:underline"
            >
              {clearLabel}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </>
  );
};

export default ProductGrid;
