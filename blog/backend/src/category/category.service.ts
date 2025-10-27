import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Category, CategoryDocument } from './models/category.model';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async getAll() {
    const categories = await this.categoryModel.find({ isActive: true }).sort({ createdAt: -1 });
    return {
      message: 'success',
      data: categories,
    };
  }

  async getById(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'success',
      data: category,
    };
  }

  async create(payload: { name: string; description?: string; slug?: string }) {
    try {
      const category = await this.categoryModel.create({
        name: payload.name,
        description: payload.description || '',
        slug: payload.slug || payload.name.toLowerCase().replace(/\s+/g, '-'),
      });

      return {
        message: 'success',
        data: category,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Category with this name already exists');
      }
      throw new BadRequestException(error.message || 'Error creating category');
    }
  }

  async update(id: string, payload: { name?: string; description?: string; slug?: string }) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const updated = await this.categoryModel.findByIdAndUpdate(
      id,
      payload,
      { new: true, runValidators: true },
    );

    if (!updated) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'success',
      data: updated,
    };
  }

  async delete(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    const deleted = await this.categoryModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'success',
    };
  }
}