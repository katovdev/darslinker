import Blog from "../models/blog.model.js";
import Category from "../models/category.model.js";
import { catchAsync } from "../middlewares/error.middleware.js";
import { ValidationError, NotFoundError } from "../utils/error.utils.js";
import mongoose from "mongoose";
import crypto from "crypto";

/**
 * Get all blogs with optional search and filtering
 * @route GET /api/blogs
 * @access Public
 */
const findAll = catchAsync(async (req, res) => {
  const { search, category, limit = 10, page = 1, archived } = req.query;
  
  const filter = {};
  
  // Handle archived filter
  if (archived !== undefined) {
    filter.isArchive = archived === 'true';
  } else {
    // Default: only non-archived blogs for public access
    filter.isArchive = false;
  }

  // Handle search
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subtitle: { $regex: search, $options: 'i' } },
      { 'seo.keywords': { $regex: search, $options: 'i' } }
    ];
  }

  // Handle category filter
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.categoryId = category;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate({
        path: 'categoryId',
        select: 'name slug description',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Blog.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    message: 'Blogs retrieved successfully',
    data: blogs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * Get featured blogs for landing page
 * @route GET /api/blogs/featured
 * @access Public
 */
const getFeatured = catchAsync(async (req, res) => {
  const { limit = 6 } = req.query;
  
  const blogs = await Blog.find({ isArchive: false })
    .populate({
      path: 'categoryId',
      select: 'name slug',
      options: { strictPopulate: false }
    })
    .sort({ multiViews: -1, createdAt: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'Featured blogs retrieved successfully',
    data: blogs
  });
});

/**
 * Get archived blogs
 * @route GET /api/blogs/archive
 * @access Private (Admin only)
 */
const getArchived = catchAsync(async (req, res) => {
  const blogs = await Blog.find({ isArchive: true })
    .populate('categoryId', 'name slug description')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Archived blogs retrieved successfully',
    data: blogs
  });
});

/**
 * Get single blog by ID
 * @route GET /api/blogs/:id
 * @access Public
 */
const findOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid blog ID format');
  }

  const blog = await Blog.findById(id)
    .populate('categoryId', 'name slug description');

  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  // Check if request wants HTML (for SEO)
  const acceptHeader = req.get('Accept') || '';
  const isHtmlRequest = acceptHeader.includes('text/html') || 
                       acceptHeader.includes('application/xhtml+xml');

  if (isHtmlRequest) {
    // Generate SEO-optimized HTML
    const html = generateBlogHTML(blog);
    res.set('Content-Type', 'text/html');
    return res.send(html);
  }

  // Return JSON for API calls
  res.status(200).json({
    success: true,
    message: 'Blog retrieved successfully',
    blog: blog
  });
});

/**
 * Get related blogs by same tags
 * @route GET /api/blogs/:id/related
 * @access Public
 */
const getRelated = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid blog ID format');
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  const tagValues = blog.tags.map(tag => tag.value);

  if (!tagValues.length) {
    return res.status(200).json({
      success: true,
      message: 'No related blogs found',
      data: [],
      count: 0
    });
  }

  const relatedBlogs = await Blog.find({
    _id: { $ne: blog._id },
    'tags.value': { $in: tagValues },
    isArchive: false
  })
    .populate('categoryId', 'name slug')
    .limit(parseInt(limit))
    .sort({ multiViews: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Related blogs retrieved successfully',
    data: relatedBlogs,
    count: relatedBlogs.length
  });
});

/**
 * Create new blog
 * @route POST /api/blogs
 * @access Private (Admin only)
 */
const create = catchAsync(async (req, res) => {
  const { header, sections, tags, seo, categoryId } = req.body;

  if (!header || !header.title || !header.subtitle) {
    throw new ValidationError('Title and subtitle are required');
  }

  let validCategoryId = null;

  // Validate category if provided
  if (categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new ValidationError('Invalid category ID format');
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ValidationError('Category not found');
    }
    validCategoryId = categoryId;
  }

  const blogData = {
    title: header.title,
    subtitle: header.subtitle,
    sections: sections || [],
    tags: tags || [],
    seo: seo || {},
    categoryId: validCategoryId
  };

  const newBlog = await Blog.create(blogData);
  
  // Populate category for response
  await newBlog.populate('categoryId', 'name slug description');

  res.status(201).json({
    success: true,
    message: 'Blog created successfully',
    blog: newBlog
  });
});

/**
 * Update existing blog
 * @route PUT /api/blogs/:id
 * @access Private (Admin only)
 */
const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { header, sections, tags, seo, categoryId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid blog ID format');
  }

  const updateData = {};

  // Update header fields
  if (header) {
    if (header.title) updateData.title = header.title;
    if (header.subtitle) updateData.subtitle = header.subtitle;
  }

  // Update other fields
  if (sections !== undefined) updateData.sections = sections;
  if (tags !== undefined) updateData.tags = tags;
  if (seo !== undefined) updateData.seo = seo;

  // Validate and update category
  if (categoryId !== undefined) {
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new ValidationError('Invalid category ID format');
      }

      const category = await Category.findById(categoryId);
      if (!category) {
        throw new ValidationError('Category not found');
      }
      updateData.categoryId = categoryId;
    } else {
      updateData.categoryId = null;
    }
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('categoryId', 'name slug description');

  if (!updatedBlog) {
    throw new NotFoundError('Blog not found');
  }

  res.status(200).json({
    success: true,
    message: 'Blog updated successfully',
    blog: updatedBlog
  });
});

/**
 * Track blog view
 * @route POST /api/blogs/:id/view
 * @access Public
 */
const trackView = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid blog ID format');
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  // Extract user identification data
  const userId = req.ip || req.socket?.remoteAddress || 'anonymous';
  const userAgent = req.get('User-Agent') || '';
  const forwardedFor = req.get('X-Forwarded-For');
  const realIp = forwardedFor ? forwardedFor.split(',')[0].trim() : userId;

  console.log('📊 View tracking request:', {
    blogId: id,
    blogTitle: blog.title,
    userIp: realIp,
    currentViews: blog.multiViews || 0,
    uniqueViewsCount: blog.uniqueViews?.length || 0
  });

  // Always increment total views (this represents all page loads after 10 seconds)
  blog.multiViews = (blog.multiViews || 0) + 1;

  // Create unique identifier for this visitor
  const dataToHash = `${realIp}-${userAgent}`;
  const uniqueId = crypto.createHash('md5').update(dataToHash).digest('hex').substring(0, 16);

  // Initialize uniqueViews array if it doesn't exist
  if (!blog.uniqueViews) {
    blog.uniqueViews = [];
  }

  // Check if this unique visitor has already viewed this blog
  let isNewUniqueView = false;
  if (!blog.uniqueViews.includes(uniqueId)) {
    blog.uniqueViews.push(uniqueId);
    isNewUniqueView = true;
  }

  await blog.save();

  console.log('✅ View tracked successfully:', {
    blogId: id,
    newTotalViews: blog.multiViews,
    newUniqueViewsCount: blog.uniqueViews.length,
    wasNewUniqueView: isNewUniqueView
  });

  res.status(200).json({
    success: true,
    message: 'View tracked successfully',
    data: {
      totalViews: blog.multiViews,
      uniqueViews: blog.uniqueViews.length,
      isNewUniqueView: isNewUniqueView
    }
  });
});

/**
 * Archive blog
 * @route PUT /api/blogs/:id/archive
 * @access Private (Admin only)
 */
const archive = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid blog ID format');
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  if (blog.isArchive) {
    throw new ValidationError('Blog is already archived');
  }

  blog.isArchive = true;
  await blog.save();

  res.status(200).json({
    success: true,
    message: 'Blog archived successfully'
  });
});

/**
 * Unarchive blog
 * @route PUT /api/blogs/:id/unarchive
 * @access Private (Admin only)
 */
const unarchive = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid blog ID format');
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new NotFoundError('Blog not found');
  }

  if (!blog.isArchive) {
    throw new ValidationError('Blog is not archived');
  }

  blog.isArchive = false;
  await blog.save();

  res.status(200).json({
    success: true,
    message: 'Blog unarchived successfully'
  });
});

/**
 * Delete blog
 * @route DELETE /api/blogs/:id
 * @access Private (Admin only)
 */
const deleteBlog = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid blog ID format');
  }

  const deletedBlog = await Blog.findByIdAndDelete(id);

  if (!deletedBlog) {
    throw new NotFoundError('Blog not found');
  }

  res.status(200).json({
    success: true,
    message: 'Blog deleted successfully'
  });
});

/**
 * Generate sitemap
 * @route GET /api/blogs/sitemap.xml
 * @access Public
 */
const generateSitemap = catchAsync(async (req, res) => {
  const blogs = await Blog.find({ isArchive: false }).sort({ updatedAt: -1 });

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main blog page -->
  <url>
    <loc>https://darslinker.uz/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Home page -->
  <url>
    <loc>https://darslinker.uz/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Individual blog posts -->`;

  for (const blog of blogs) {
    const lastmod = blog.updatedAt ? blog.updatedAt.toISOString() : new Date().toISOString();
    sitemap += `
  <url>
    <loc>https://darslinker.uz/blog/${blog._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  sitemap += `
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(sitemap);
});

/**
 * Generate SEO-optimized HTML for blog post
 */
function generateBlogHTML(blog) {
  const baseUrl = 'https://darslinker.uz';
  const blogUrl = `${baseUrl}/blog/${blog._id}`;

  // Get SEO data
  let title = blog.title;
  let description = blog.subtitle || '';
  let keywords = '';
  let canonicalUrl = blogUrl;

  // Use admin-entered SEO data if available
  if (blog.seo) {
    title = blog.seo.metaTitle || blog.title;
    description = blog.seo.metaDescription || blog.subtitle || '';
    canonicalUrl = blog.seo.canonicalUrl || blogUrl;

    if (blog.seo.keywords) {
      if (Array.isArray(blog.seo.keywords)) {
        keywords = blog.seo.keywords.join(', ');
      } else if (typeof blog.seo.keywords === 'string') {
        keywords = blog.seo.keywords;
      }
    }
  }

  // Add default keywords if none provided
  if (!keywords) {
    const tagValues = blog.tags ? blog.tags.map(tag => tag.value || tag).join(', ') : '';
    keywords = `${blog.title}, ${tagValues}, ta'lim, o'qituvchi, dars, Darslinker`.replace(/,\\s*,/g, ',').trim();
  }

  const pageTitle = title.includes(blog.title) ? title : `${blog.title} - ${title}`;
  const fullTitle = pageTitle.includes('Darslinker') ? pageTitle : `${pageTitle} | Darslinker`;

  // Generate sections HTML
  const sectionsHTML = blog.sections ? blog.sections.map(section => {
    let sectionContent = '';

    if (section.header) {
      sectionContent += `<h2>${escapeHtml(section.header)}</h2>`;
    }
    if (section.h2) {
      sectionContent += `<h3>${escapeHtml(section.h2)}</h3>`;
    }
    if (section.h3) {
      sectionContent += `<h4>${escapeHtml(section.h3)}</h4>`;
    }
    if (section.content) {
      sectionContent += `<p>${escapeHtml(section.content).replace(/\\n/g, '<br>')}</p>`;
    }

    return sectionContent;
  }).join('') : '';

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "description": description,
    "url": blogUrl,
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "author": {
      "@type": "Organization",
      "name": "Darslinker"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Darslinker",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/og-image.jpg`
      }
    },
    "image": {
      "@type": "ImageObject",
      "url": `${baseUrl}/og-image.jpg`,
      "width": 1200,
      "height": 630
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": blogUrl
    }
  };

  if (blog.tags && blog.tags.length > 0) {
    structuredData['keywords'] = blog.tags.map(tag => tag.value || tag).join(', ');
  }

  return `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(fullTitle)}</title>

    <!-- SEO Meta Tags -->
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="${escapeHtml(keywords)}">
    <meta name="author" content="Darslinker">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph Tags -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(fullTitle)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${blogUrl}">
    <meta property="og:image" content="${baseUrl}/og-image.jpg">
    <meta property="og:site_name" content="Darslinker">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${baseUrl}/og-image.jpg">

    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>

    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #232323;
            color: #ffffff;
        }
        h1 { color: #7EA2D4; font-size: 2.5rem; margin-bottom: 1rem; }
        h2 { color: #7EA2D4; font-size: 1.8rem; margin: 2rem 0 1rem 0; }
        h3 { color: #a0c4e0; font-size: 1.4rem; margin: 1.5rem 0 0.8rem 0; }
        h4 { color: #c0d4e8; font-size: 1.2rem; margin: 1rem 0 0.5rem 0; }
        p { margin-bottom: 1.5rem; line-height: 1.8; }
        .meta { color: #7EA2D4; margin-bottom: 2rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: #7EA2D4; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
    </style>

    <script>
        setTimeout(function() {
            if (window.navigator && !window.navigator.userAgent.includes('bot')) {
                window.location.href = '${baseUrl}/blog?article=${blog._id}';
            }
        }, 3000);
    </script>
</head>
<body>
    <a href="${baseUrl}/blog" class="back-link">← Barcha maqolalar</a>
    <article>
        <h1>${escapeHtml(blog.title)}</h1>
        <div class="meta">
            <time datetime="${blog.createdAt}">${new Date(blog.createdAt).toLocaleDateString('uz-UZ')}</time>
            ${blog.multiViews ? ` • ${blog.multiViews} ko'rildi` : ''}
        </div>
        ${blog.subtitle ? `<p style="font-size: 1.2rem; color: #a0c4e0;"><strong>${escapeHtml(blog.subtitle)}</strong></p>` : ''}
        <div class="content">${sectionsHTML}</div>
    </article>
    <footer style="margin-top: 3rem; text-align: center; color: #888;">
        <p><a href="${baseUrl}" style="color: #7EA2D4;">Darslinker</a> - O'qituvchilar uchun platforma</p>
    </footer>
</body>
</html>`;
}

/**
 * Escape HTML characters
 */
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

export {
  findAll,
  getFeatured,
  getArchived,
  findOne,
  getRelated,
  create,
  update,
  trackView,
  archive,
  unarchive,
  deleteBlog,
  generateSitemap
};