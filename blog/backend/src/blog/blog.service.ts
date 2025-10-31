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
}