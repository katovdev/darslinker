import Category from "../models/category.model.js";
import Blog from "../models/blog.model.js";
import { catchAsync } from "../middlewares/error.middleware.js";
import { ValidationError, NotFoundError } from "../utils/error.utils.js";
import mongoose from "mongoose";

/**
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
const findAll = catchAsync(async (req, res) => {
  const { active } = req.query;
  
  const filter = {};
  
  // Handle active filter
  if (active !== undefined) {
    filter.isActive = active === 'true';
  } else {
    // Default: only active categories for public access
    filter.isActive = true;
  }

  const categories = await Category.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: categories
  });
});

/**
 * Get category by ID
 * @route GET /api/categories/:id
 * @access Public
 */
const findOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid category ID format');
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Category retrieved successfully',
    category: category
  });
});

/**
 * Get category by slug
 * @route GET /api/categories/slug/:slug
 * @access Public
 */
const findBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;

  if (!slug || slug.trim() === '') {
    throw new ValidationError('Category slug is required');
  }

  const category = await Category.findOne({ slug: slug.trim(), isActive: true });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Category retrieved successfully',
    category: category
  });
});

/**
 * Get blogs by category
 * @route GET /api/categories/:id/blogs
 * @access Public
 */
const getBlogsByCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { limit = 10, page = 1 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid category ID format');
  }

  // Verify category exists
  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [blogs, total] = await Promise.all([
    Blog.find({ categoryId: id, isArchive: false })
      .populate('categoryId', 'name slug description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Blog.countDocuments({ categoryId: id, isArchive: false })
  ]);

  res.status(200).json({
    success: true,
    message: 'Category blogs retrieved successfully',
    data: blogs,
    category: category,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Create new category
 * @route POST /api/categories
 * @access Private (Admin only)
 */
const create = catchAsync(async (req, res) => {
  const { name, description, slug } = req.body;

  if (!name || name.trim() === '') {
    throw new ValidationError('Category name is required');
  }

  // Check if category with same name already exists
  const existingCategory = await Category.findOne({ 
    name: name.trim(),
    isActive: true 
  });

  if (existingCategory) {
    throw new ValidationError('Category with this name already exists');
  }

  // Check if slug is provided and unique
  if (slug && slug.trim() !== '') {
    const existingSlug = await Category.findOne({ 
      slug: slug.trim(),
      isActive: true 
    });

    if (existingSlug) {
      throw new ValidationError('Category with this slug already exists');
    }
  }

  const categoryData = {
    name: name.trim(),
    description: description ? description.trim() : '',
    slug: slug ? slug.trim() : undefined // Let pre-save middleware generate if not provided
  };

  const newCategory = await Category.create(categoryData);

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category: newCategory
  });
});

/**
 * Update existing category
 * @route PUT /api/categories/:id
 * @access Private (Admin only)
 */
const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, slug } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid category ID format');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const updateData = {};

  // Update name if provided
  if (name !== undefined) {
    if (!name || name.trim() === '') {
      throw new ValidationError('Category name cannot be empty');
    }

    const trimmedName = name.trim();
    
    // Check if another category with same name exists
    const existingCategory = await Category.findOne({ 
      name: trimmedName,
      _id: { $ne: id },
      isActive: true 
    });

    if (existingCategory) {
      throw new ValidationError('Category with this name already exists');
    }

    updateData.name = trimmedName;
  }

  // Update description if provided
  if (description !== undefined) {
    updateData.description = description ? description.trim() : '';
  }

  // Update slug if provided
  if (slug !== undefined) {
    if (slug && slug.trim() !== '') {
      const trimmedSlug = slug.trim();
      
      // Check if another category with same slug exists
      const existingSlug = await Category.findOne({ 
        slug: trimmedSlug,
        _id: { $ne: id },
        isActive: true 
      });

      if (existingSlug) {
        throw new ValidationError('Category with this slug already exists');
      }

      updateData.slug = trimmedSlug;
    } else {
      // If slug is empty, regenerate from name
      if (updateData.name) {
        updateData.slug = updateData.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category: updatedCategory
  });
});

/**
 * Deactivate category (soft delete)
 * @route PUT /api/categories/:id/deactivate
 * @access Private (Admin only)
 */
const deactivate = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid category ID format');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (!category.isActive) {
    throw new ValidationError('Category is already deactivated');
  }

  // Check if category has active blogs
  const blogCount = await Blog.countDocuments({ 
    categoryId: id, 
    isArchive: false 
  });

  if (blogCount > 0) {
    throw new ValidationError(
      `Cannot deactivate category. It has ${blogCount} active blog(s). Please move or archive the blogs first.`
    );
  }

  category.isActive = false;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category deactivated successfully'
  });
});

/**
 * Activate category
 * @route PUT /api/categories/:id/activate
 * @access Private (Admin only)
 */
const activate = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid category ID format');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  if (category.isActive) {
    throw new ValidationError('Category is already active');
  }

  category.isActive = true;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category activated successfully'
  });
});

/**
 * Delete category (hard delete)
 * @route DELETE /api/categories/:id
 * @access Private (Admin only)
 */
const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid category ID format');
  }

  // Check if category has any blogs (active or archived)
  const blogCount = await Blog.countDocuments({ categoryId: id });

  if (blogCount > 0) {
    throw new ValidationError(
      `Cannot delete category. It has ${blogCount} blog(s) associated with it. Please remove or reassign the blogs first.`
    );
  }

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    throw new NotFoundError('Category not found');
  }

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * Get category statistics
 * @route GET /api/categories/:id/stats
 * @access Public
 */
const getStats = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid category ID format');
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new NotFoundError('Category not found');
  }

  const [activeBlogCount, archivedBlogCount, totalViews] = await Promise.all([
    Blog.countDocuments({ categoryId: id, isArchive: false }),
    Blog.countDocuments({ categoryId: id, isArchive: true }),
    Blog.aggregate([
      { $match: { categoryId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, totalViews: { $sum: '$multiViews' } } }
    ])
  ]);

  const stats = {
    category: category,
    activeBlogCount,
    archivedBlogCount,
    totalBlogCount: activeBlogCount + archivedBlogCount,
    totalViews: totalViews.length > 0 ? totalViews[0].totalViews : 0
  };

  res.status(200).json({
    success: true,
    message: 'Category statistics retrieved successfully',
    stats: stats
  });
});

export {
  findAll,
  findOne,
  findBySlug,
  getBlogsByCategory,
  create,
  update,
  deactivate,
  activate,
  deleteCategory,
  getStats
};