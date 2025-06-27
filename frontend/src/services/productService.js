// src/services/productService.js
import { apiClient } from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Product Service - All product-related API calls
 */
export const productService = {
  /**
   * PUBLIC PRODUCT METHODS
   */

  // Get all public products (for website visitors)
  async getPublicProducts() {
    try {
      console.log('📦 Fetching public products...');
      const products = await apiClient.get(API_ENDPOINTS.PRODUCTS.PUBLIC);
      
      if (!Array.isArray(products)) {
        throw new Error('Invalid response format: expected array of products');
      }

      // Process and validate product data
      const processedProducts = products
        .filter(product => !product.suspended && product.id)
        .map(product => ({
          id: product.id,
          name: product.name || `Product ${product.id}`,
          price: parseFloat(product.price || 0),
          formattedPrice: `KSh ${parseFloat(product.price || 0).toLocaleString()}`,
          originalPrice: product.original_price ? parseFloat(product.original_price) : null,
          image: product.image || '/assets/images/product-placeholder.jpg',
          images: Array.isArray(product.images) ? product.images : [],
          category: product.category || 'General',
          description: product.description || '',
          detail: product.detail || '',
          inStock: Boolean(product.in_stock),
          stockQuantity: parseInt(product.stock_quantity || 0),
          discount: Boolean(product.discount),
          discountAmount: product.discount_amount ? parseFloat(product.discount_amount) : 0,
          discountReason: product.discount_reason || null,
          shareLink: product.share_link || null,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          // Add computed fields
          isOnSale: Boolean(product.discount && product.discount_amount > 0),
          savingsAmount: product.original_price && product.price ? 
            parseFloat(product.original_price) - parseFloat(product.price) : 0,
          savingsPercentage: product.original_price && product.price ?
            Math.round(((parseFloat(product.original_price) - parseFloat(product.price)) / parseFloat(product.original_price)) * 100) : 0
        }));

      console.log(`✅ Successfully processed ${processedProducts.length} products`);
      return processedProducts;
    } catch (error) {
      console.error('❌ Error fetching public products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // Get products by category
  async getProductsByCategory(category) {
    try {
      console.log(`📦 Fetching products for category: ${category}`);
      return await apiClient.get(API_ENDPOINTS.PRODUCTS.BY_CATEGORY(category));
    } catch (error) {
      console.error(`❌ Error fetching products for category ${category}:`, error);
      throw new Error(`Failed to fetch products for category ${category}: ${error.message}`);
    }
  },

  // Get single product by ID
  async getProductById(id) {
    try {
      console.log(`📦 Fetching product with ID: ${id}`);
      const product = await apiClient.get(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      
      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  // Search products
  async searchProducts(query, filters = {}) {
    try {
      console.log(`🔍 Searching products: "${query}"`);
      const params = {
        q: query,
        ...filters
      };
      return await apiClient.get(API_ENDPOINTS.PRODUCTS.SEARCH, params);
    } catch (error) {
      console.error('❌ Error searching products:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },

  /**
   * ADMIN PRODUCT METHODS (Require authentication)
   */

  // Get all products (admin view)
  async getAllProducts(params = {}) {
    try {
      console.log('📦 Fetching all products (admin)...');
      return await apiClient.get(API_ENDPOINTS.PRODUCTS.ALL, params);
    } catch (error) {
      console.error('❌ Error fetching all products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // Create new product
  async createProduct(productData) {
    try {
      console.log('📦 Creating new product...', productData);
      
      // Validate required fields
      const requiredFields = ['name', 'price', 'category'];
      for (const field of requiredFields) {
        if (!productData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      const product = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, productData);
      console.log('✅ Product created successfully:', product);
      return product;
    } catch (error) {
      console.error('❌ Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  // Update existing product
  async updateProduct(id, productData) {
    try {
      console.log(`📦 Updating product ${id}...`, productData);
      const product = await apiClient.put(API_ENDPOINTS.PRODUCTS.BY_ID(id), productData);
      console.log('✅ Product updated successfully:', product);
      return product;
    } catch (error) {
      console.error(`❌ Error updating product ${id}:`, error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      console.log(`📦 Deleting product ${id}...`);
      await apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      console.log('✅ Product deleted successfully');
      return true;
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },

  // Suspend/Unsuspend product
  async toggleProductStatus(id, suspended = true) {
    try {
      console.log(`📦 ${suspended ? 'Suspending' : 'Activating'} product ${id}...`);
      const product = await apiClient.patch(API_ENDPOINTS.PRODUCTS.BY_ID(id), { 
        suspended 
      });
      console.log(`✅ Product ${suspended ? 'suspended' : 'activated'} successfully`);
      return product;
    } catch (error) {
      console.error(`❌ Error toggling product status:`, error);
      throw new Error(`Failed to update product status: ${error.message}`);
    }
  },

  /**
   * STOCK MANAGEMENT
   */

  // Update product stock
  async updateStock(id, stockData) {
    try {
      console.log(`📦 Updating stock for product ${id}...`, stockData);
      const result = await apiClient.put(API_ENDPOINTS.PRODUCTS.STOCK(id), stockData);
      console.log('✅ Stock updated successfully');
      return result;
    } catch (error) {
      console.error(`❌ Error updating stock for product ${id}:`, error);
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  },

  // Get low stock products
  async getLowStockProducts(threshold = 10) {
    try {
      console.log(`📦 Fetching low stock products (threshold: ${threshold})...`);
      return await apiClient.get(API_ENDPOINTS.PRODUCTS.LOW_STOCK, { threshold });
    } catch (error) {
      console.error('❌ Error fetching low stock products:', error);
      throw new Error(`Failed to fetch low stock products: ${error.message}`);
    }
  },

  /**
   * IMAGE MANAGEMENT
   */

  // Upload product image
  async uploadProductImage(productId, file, isPrimary = false) {
    try {
      console.log(`📦 Uploading image for product ${productId}...`);
      const result = await apiClient.uploadFile(
        API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGE(productId),
        file,
        { is_primary: isPrimary }
      );
      console.log('✅ Image uploaded successfully');
      return result;
    } catch (error) {
      console.error('❌ Error uploading product image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  },

  // Delete product image
  async deleteProductImage(productId, imageId) {
    try {
      console.log(`📦 Deleting image ${imageId} for product ${productId}...`);
      await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE_IMAGE(productId, imageId));
      console.log('✅ Image deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting product image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  },

  /**
   * ANALYTICS & REPORTING
   */

  // Get product analytics
  async getProductAnalytics(id, period = '30d') {
    try {
      console.log(`📊 Fetching analytics for product ${id} (${period})...`);
      return await apiClient.get(API_ENDPOINTS.PRODUCTS.ANALYTICS(id), { period });
    } catch (error) {
      console.error('❌ Error fetching product analytics:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  },

  // Get popular products
  async getPopularProducts(limit = 10) {
    try {
      console.log(`📊 Fetching popular products (limit: ${limit})...`);
      return await apiClient.get(API_ENDPOINTS.PRODUCTS.POPULAR, { limit });
    } catch (error) {
      console.error('❌ Error fetching popular products:', error);
      throw new Error(`Failed to fetch popular products: ${error.message}`);
    }
  },

  /**
   * UTILITY METHODS
   */

  // Get product categories
  async getCategories() {
    try {
      console.log('📦 Fetching product categories...');
      return await apiClient.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  },

  // Validate product data
  validateProductData(productData) {
    const errors = [];

    if (!productData.name || productData.name.trim().length < 2) {
      errors.push('Product name must be at least 2 characters long');
    }

    if (!productData.price || parseFloat(productData.price) <= 0) {
      errors.push('Product price must be greater than 0');
    }

    if (!productData.category || productData.category.trim().length === 0) {
      errors.push('Product category is required');
    }

    if (productData.description && productData.description.length > 1000) {
      errors.push('Product description must be less than 1000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};