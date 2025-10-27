import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoryService } from './category.service';

export class CreateCategoryDto {
  name: string;
  description?: string;
  slug?: string;
}

export class UpdateCategoryDto {
  name?: string;
  description?: string;
  slug?: string;
}

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Get all categories (public)
  @Get()
  async getAllCategories() {
    return this.categoryService.getAll();
  }

  // Get category by ID (public)
  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoryService.getById(id);
  }

  // Create new category (admin only)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  // Update category (admin only)
  @Put(':id')
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  // Delete category (admin only)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id') id: string) {
    return this.categoryService.delete(id);
  }
}