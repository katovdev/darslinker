import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dtos';
import { Request, Response } from 'express';

@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Get all blogs (public - for frontend)
  @Get()
  async getAllBlogs(@Query('search') search?: string) {
    return this.blogService.getAll(search);
  }

  // Get archived blogs (admin only - for moderator)
  @Get('archive')
  async getArchivedBlogs() {
    return this.blogService.getArchive();
  }

  // Get blog by ID (public - for frontend)
  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return this.blogService.getById(id);
  }

  // Get related blogs by same tags (public - for frontend)
  @Get(':id/related')
  async getRelatedBlogs(@Param('id') id: string) {
    return this.blogService.getSameTag(id);
  }

  // Create new blog (admin only - for moderator)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogService.create(createBlogDto);
  }

  // Update blog (admin only - for moderator)
  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.updateBlog(id, updateBlogDto);
  }

  // Track blog view (public - for frontend)
  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  async viewBlog(@Param('id') id: string, @Req() req: Request) {
    // You can extract user IP or user ID here
    const userId = req.ip || req.connection.remoteAddress || 'anonymous';
    return this.blogService.viewBlog(id, { userId });
  }

  // Archive blog (admin only - for moderator)
  @Put(':id/archive')
  async archiveBlog(@Param('id') id: string) {
    return this.blogService.makeArchive(id);
  }

  // Unarchive blog (admin only - for moderator)
  @Put(':id/unarchive')
  async unarchiveBlog(@Param('id') id: string) {
    return this.blogService.exitArchive(id);
  }

  // Delete blog (admin only - for moderator)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteBlog(@Param('id') id: string) {
    return this.blogService.delete(id);
  }

  // Generate sitemap (public)
  @Get('sitemap.xml')
  async generateSitemap(@Res() res: Response) {
    const sitemap = await this.blogService.generateSitemap();
    res.set('Content-Type', 'application/xml');
    return res.send(sitemap);
  }
}