import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiSearch } from 'react-icons/fi';
import { useProducts } from '../../hooks';
import { getImageUrl } from '../../utils/imageUrl';
import { LoadingWrapper, Alert } from '../../components/ui';

const AdminProducts = () => {
  const { 
    products, 
    loading, 
    fetchProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    uploadImage 
  } = useProducts({ immediate: false });
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    countInStock: '',
  });
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, inStock, outOfStock

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  // Get brands based on selected category (cascading filter)
  const brands = useMemo(() => {
    const filteredByCategory = categoryFilter === 'all' 
      ? products 
      : products.filter(p => p.category === categoryFilter);
    const brandList = [...new Set(filteredByCategory.map(p => p.brand))];
    return brandList.sort();
  }, [products, categoryFilter]);

  // Reset brand filter when category changes and current brand is not in new category
  const handleCategoryChange = (newCategory) => {
    setCategoryFilter(newCategory);
    // Reset brand if it's not available in the new category
    if (newCategory !== 'all') {
      const brandsInCategory = products
        .filter(p => p.category === newCategory)
        .map(p => p.brand);
      if (!brandsInCategory.includes(brandFilter)) {
        setBrandFilter('all');
      }
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = !search ||
        product.name.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesBrand = brandFilter === 'all' || product.brand === brandFilter;
      
      let matchesStock = true;
      if (stockFilter === 'inStock') matchesStock = product.countInStock > 0;
      else if (stockFilter === 'outOfStock') matchesStock = product.countInStock === 0;
      
      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    });
  }, [products, searchTerm, categoryFilter, brandFilter, stockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        image: product.image,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: product.price.toString(),
        countInStock: product.countInStock.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        image: '',
        brand: '',
        category: '',
        description: '',
        price: '',
        countInStock: '',
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploading(true);
    setError('');

    const result = await uploadImage(formDataUpload);

    if (result.success) {
      setFormData({
        ...formData,
        image: result.data,
      });
    } else {
      setError(result.error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      countInStock: parseInt(formData.countInStock),
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct._id, productData);
    } else {
      result = await createProduct(productData);
    }

    if (result.success) {
      handleCloseModal();
    } else {
      setError(result.error);
    }
    setSaving(false);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    setActionError('');

    const result = await deleteProduct(productId);
    if (!result.success) {
      setActionError(result.error || 'Failed to delete product');
    }
  };

  if (loading) {
    return <LoadingWrapper loading={true}><div /></LoadingWrapper>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Add Product
        </button>
      </div>

      {actionError && <Alert type="error" message={actionError} className="mb-4" />}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Brands</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Stock</option>
          <option value="inStock">In Stock</option>
          <option value="outOfStock">Out of Stock</option>
        </select>
      </div>

      <p className="text-gray-500 text-sm mb-4">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Image</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Brand</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">{product.brand}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.countInStock > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.countInStock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <Alert type="error" message={error} />

              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Product Image
                    </label>
                    
                    {/* Image Preview */}
                    {formData.image && (
                      <div className="mb-3">
                        <img
                          src={getImageUrl(formData.image)}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}

                    {/* File Upload */}
                    <div className="flex items-center space-x-4 mb-2">
                      <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                        <FiUpload className="mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <span className="text-gray-500 text-sm">or</span>
                    </div>

                    {/* URL Input */}
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter image URL"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a file or paste an image URL
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Count In Stock
                    </label>
                    <input
                      type="number"
                      name="countInStock"
                      value={formData.countInStock}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
