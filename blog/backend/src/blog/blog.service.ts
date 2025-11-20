import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './models';
import { isValidObjectId, Model } from 'mongoose';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto } from './dtos';
import { Category, CategoryDocument } from '../category/models/category.model';
import { Request } from 'express';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async getAll(search?: string) {
    const filter: any = { isArchive: false };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
      ];
    }

    const data = await this.blogModel.find(filter).populate('categoryId', 'name slug').sort({ createdAt: -1 });

    return {
      message: 'success',
      data,
    };
  }

  async getArchive() {
    const data = await this.blogModel.find({ isArchive: true }).populate('categoryId', 'name slug').sort({ createdAt: -1 });
    return {
      message: 'success',
      data,
    };
  }

  async getById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Noto'g'ri ID format");
    }

    const foundBlog = await this.blogModel.findById(id).populate('categoryId', 'name slug description');

    if (!foundBlog) {
      throw new NotFoundException('Blog topilmadi');
    }

    return {
      message: 'success',
      blog: foundBlog,
    };
  }

  async create(payload: CreateBlogDto) {
    let categoryId = null;

    // Only validate and check category if categoryId is provided
    if (payload.categoryId) {
      if (!isValidObjectId(payload.categoryId)) {
        throw new BadRequestException('Error Format ID');
      }

      const foundCategory = await this.categoryModel.findById(payload.categoryId);

      if (!foundCategory) {
        throw new BadRequestException('Bunday kategory topilmadi');
      }

      categoryId = foundCategory._id;
    }

    try {
      const newBlog = await this.blogModel.create({
        title: payload.header.title,
        subtitle: payload.header.subtitle,
        sections: payload.sections,
        tags: payload.tags || [],
        seo: payload.seo || {},
        categoryId: categoryId,
      });

      return {
        message: 'success',
        blog: newBlog,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message || 'Blog yaratishda xatolik');
    }
  }

  async updateBlog(id: string, payload: UpdateBlogDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Noto'g'ri ID format");
    }

    let categoryId = undefined;

    // Only validate and check category if categoryId is provided
    if (payload.categoryId) {
      if (!isValidObjectId(payload.categoryId)) {
        throw new BadRequestException("Noto'g'ri categoryId format");
      }

      const foundCategory = await this.categoryModel.findById(payload.categoryId);

      if (!foundCategory) {
        throw new BadRequestException('Bunday kategory topilmadi');
      }

      categoryId = foundCategory._id;
    }

    const updateData: any = {};

    if (payload.header) {
      updateData.title = payload.header.title;
      updateData.subtitle = payload.header.subtitle;
    }

    if (payload.sections) {
      updateData.sections = payload.sections;
    }

    if (payload.tags) {
      updateData.tags = payload.tags;
    }

    if (payload.seo) {
      updateData.seo = payload.seo;
    }

    // Only update categoryId if it was provided
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;
    }

    const update = await this.blogModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    if (!update) {
      throw new NotFoundException('Blog Topilmadi');
    }

    return {
      message: 'success',
      blog: update,
    };
  }

  async makeArchive(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Noto'g'ri ID format");
    }

    const data = await this.blogModel.findById(id);

    if (data?.isArchive === true) {
      throw new BadRequestException('Bu blog allaqachon arxivda');
    }

    const foundBlog = await this.blogModel.findByIdAndUpdate(
      id,
      { isArchive: true },
      { new: true },
    );
    if (!foundBlog) {
      throw new NotFoundException('Blog Tobilmadi');
    }

    return {
      message: 'success',
    };
  }

  async exitArchive(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Noto'g'ri ID format");
    }

    const data = await this.blogModel.findById(id);

    if (data?.isArchive === false) {
      throw new BadRequestException('Bu blog allaqachon archivedan chiqgan');
    }

    const foundBlog = await this.blogModel.findByIdAndUpdate(
      id,
      { isArchive: false },
      { new: true },
    );
    if (!foundBlog) {
      throw new NotFoundException('Blog Tobilmadi');
    }

    return {
      message: 'success',
    };
  }

  async viewBlog(id: string, payload: { userId: string, userAgent?: string, fingerprint?: string }) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Error ID Format');
    }

    const blog = await this.blogModel.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog Not Found');
    }

    // Always increment total views
    blog.multiViews += 1;

    // Create a unique identifier for this visitor
    let uniqueId = payload.userId || "anonymous";

    // If we have additional data, create a more unique fingerprint
    if (payload.userAgent || payload.fingerprint) {
      const crypto = require('crypto');
      const dataToHash = `${uniqueId}-${payload.userAgent || ''}-${payload.fingerprint || ''}`;
      uniqueId = crypto.createHash('md5').update(dataToHash).digest('hex').substring(0, 16);
    }

    // Check if this unique visitor has already viewed this blog
    if (!blog.uniqueViews.includes(uniqueId)) {
      blog.uniqueViews.push(uniqueId);
    }

    await blog.save();

    return {
      message: 'success',
    };
  }

  async getSameTag(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Error Format ID');
    }

    const foundBlog = await this.blogModel.findById(id);

    if (!foundBlog) {
      throw new NotFoundException('Blog Not Found');
    }

    const tagValues = foundBlog.tags.map((t) => t.value);

    if (!tagValues.length) {
      return {
        message: 'success',
        data: [],
      };
    }

    const sameTagBlogs = await this.blogModel.find({
      _id: { $ne: foundBlog._id },
      'tags.value': { $in: tagValues },
    }).populate('categoryId', 'name slug');

    return {
      message: 'success',
      count: sameTagBlogs.length,
      data: sameTagBlogs,
    };
  }

  async delete(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Noto'g'ri ID format");
    }

    const deleted = await this.blogModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException('Blog topilmadi');
    }

    return {
      message: 'success',
    };
  }

  async generateSitemap(): Promise<string> {
    const blogs = await this.blogModel.find({ isArchive: false }).sort({ updatedAt: -1 });

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

    return sitemap;
  }

  async generateBlogHTML(blog: any): Promise<string> {
    // Generate SEO-optimized HTML for the blog post
    const baseUrl = 'https://darslinker.uz';
    const blogUrl = `${baseUrl}/blog/${blog._id || blog.id}`;

    // Get SEO data from admin input
    let title = blog.title;
    let description = blog.subtitle || '';
    let keywords = '';
    let canonicalUrl = blogUrl;

    // Use admin-entered SEO data if available
    if (blog.seo) {
      title = blog.seo.metaTitle || blog.title;
      description = blog.seo.metaDescription || blog.subtitle || '';
      canonicalUrl = blog.seo.canonicalUrl || blogUrl;

      // Handle keywords - could be array or string
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
      keywords = `${blog.title}, ${tagValues}, ta'lim, o'qituvchi, dars, Darslinker`.replace(/,\s*,/g, ',').trim();
    }

    // Ensure title includes blog title
    const pageTitle = title.includes(blog.title) ? title : `${blog.title} - ${title}`;
    const fullTitle = pageTitle.includes('Darslinker') ? pageTitle : `${pageTitle} | Darslinker`;

    // Generate sections HTML
    const sectionsHTML = blog.sections ? blog.sections.map((section: any) => {
      let sectionContent = '';

      if (section.header) {
        sectionContent += `<h2>${this.escapeHtml(section.header)}</h2>`;
      }
      if (section.h2) {
        sectionContent += `<h3>${this.escapeHtml(section.h2)}</h3>`;
      }
      if (section.h3) {
        sectionContent += `<h4>${this.escapeHtml(section.h3)}</h4>`;
      }
      if (section.content) {
        sectionContent += `<p>${this.escapeHtml(section.content).replace(/\n/g, '<br>')}</p>`;
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
      structuredData['keywords'] = blog.tags.map((tag: any) => tag.value || tag).join(', ');
    }

    const html = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(fullTitle)}</title>

    <!-- SEO Meta Tags -->
    <meta name="description" content="${this.escapeHtml(description)}">
    <meta name="keywords" content="${this.escapeHtml(keywords)}">
    <meta name="author" content="Darslinker">
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    <meta name="bingbot" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">

    <!-- Open Graph Tags -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${this.escapeHtml(fullTitle)}">
    <meta property="og:description" content="${this.escapeHtml(description)}">
    <meta property="og:url" content="${blogUrl}">
    <meta property="og:image" content="${baseUrl}/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Darslinker">
    <meta property="og:locale" content="uz_UZ">

    <!-- Article specific Open Graph -->
    <meta property="article:author" content="Darslinker">
    <meta property="article:section" content="Ta'lim">
    <meta property="article:published_time" content="${blog.createdAt}">
    <meta property="article:modified_time" content="${blog.updatedAt || blog.createdAt}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${this.escapeHtml(fullTitle)}">
    <meta name="twitter:description" content="${this.escapeHtml(description)}">
    <meta name="twitter:image" content="${baseUrl}/og-image.jpg">

    <!-- Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>

    <!-- Styles -->
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
        .content { margin-top: 2rem; }
    </style>

    <!-- Redirect to SPA for interactive experience -->
    <script>
        // Check if this is a user (not bot) and redirect to SPA
        setTimeout(function() {
            if (window.navigator && !window.navigator.userAgent.includes('bot') &&
                !window.navigator.userAgent.includes('crawler') &&
                !window.navigator.userAgent.includes('spider')) {
                window.location.href = '${baseUrl}/blog?article=${blog._id || blog.id}';
            }
        }, 3000);
    </script>
</head>
<body>
    <a href="${baseUrl}/blog" class="back-link">← Barcha maqolalar</a>

    <article>
        <h1>${this.escapeHtml(blog.title)}</h1>

        <div class="meta">
            <time datetime="${blog.createdAt}">${new Date(blog.createdAt).toLocaleDateString('uz-UZ')}</time>
            ${blog.multiViews ? ` • ${blog.multiViews} ko'rildi` : ''}
        </div>

        ${blog.subtitle ? `<p style="font-size: 1.2rem; color: #a0c4e0;"><strong>${this.escapeHtml(blog.subtitle)}</strong></p>` : ''}

        <div class="content">
            ${sectionsHTML}
        </div>
    </article>

    <footer style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #444; text-align: center; color: #888;">
        <p><a href="${baseUrl}" style="color: #7EA2D4;">Darslinker</a> - O'qituvchilar uchun platforma</p>
    </footer>
</body>
</html>`;

    return html;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
}