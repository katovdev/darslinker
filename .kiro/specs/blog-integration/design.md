# Blog Integration Design Document

## Overview

This design document outlines the integration of the existing NestJS blog backend into the main Express.js education platform backend. The integration will consolidate all backend services into a single system while preserving SEO capabilities, existing functionality, and ensuring zero data loss during migration.

## Architecture

### Current Architecture
```
┌─ backend/ (Express.js) ──── darslinker DB
├─ blog/backend/ (NestJS) ──── darslinker_blog DB  
├─ frontend/ ──── backend API
├─ blog/frontend/ ──── blog/backend API
└─ moderator/ ──── blog/backend API
```

### Target Architecture
```
┌─ backend/ (Express.js + Blog API) ──── darslinker DB (+ blog collections)
├─ frontend/ (+ dynamic blog) ──── backend API
├─ blog/frontend/ ──── backend API (new blog endpoints)
└─ moderator/ ──── backend API (new blog endpoints)
```

### Migration Strategy

The integration will follow a phased approach:

1. **Phase 1**: Create blog models and controllers in Express.js backend
2. **Phase 2**: Implement data migration scripts with validation
3. **Phase 3**: Update frontend applications to use new API endpoints
4. **Phase 4**: Decommission NestJS blog backend after validation

## Components and Interfaces

### Blog Models (Express.js/Mongoose)

#### Blog Model
```javascript
// backend/src/models/blog.model.js
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, required: true, trim: true },
  sections: { type: Array, default: [] },
  tags: [{
    label: { type: String, required: true },
    value: { type: String, required: true }
  }],
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: '' }
  },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  multiViews: { type: Number, default: 0 },
  uniqueViews: { type: [String], default: [] },
  isArchive: { type: Boolean, default: false }
}, { timestamps: true });
```

#### Category Model
```javascript
// backend/src/models/category.model.js
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true },
  slug: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

### API Controllers

#### Blog Controller
```javascript
// backend/src/controllers/blog.controller.js
class BlogController {
  // GET /api/blogs - Get all blogs with pagination and filtering
  async findAll(req, res) { }
  
  // GET /api/blogs/:id - Get single blog by ID
  async findOne(req, res) { }
  
  // POST /api/blogs - Create new blog post
  async create(req, res) { }
  
  // PUT /api/blogs/:id - Update existing blog post
  async update(req, res) { }
  
  // DELETE /api/blogs/:id - Delete blog post
  async delete(req, res) { }
  
  // GET /api/blogs/featured - Get featured blogs for landing page
  async getFeatured(req, res) { }
}
```

#### Category Controller
```javascript
// backend/src/controllers/category.controller.js
class CategoryController {
  async findAll(req, res) { }
  async findOne(req, res) { }
  async create(req, res) { }
  async update(req, res) { }
  async delete(req, res) { }
}
```

### Migration Components

#### Data Migration Service
```javascript
// backend/src/services/blog-migration.service.js
class BlogMigrationService {
  // Create backup of existing blog data
  async createBackup() { }
  
  // Migrate blog posts from NestJS DB to Express DB
  async migrateBlogPosts() { }
  
  // Migrate categories from NestJS DB to Express DB
  async migrateCategories() { }
  
  // Validate data integrity after migration
  async validateMigration() { }
  
  // Generate migration report
  async generateReport() { }
}
```

## Data Models

### Blog Post Data Structure
```javascript
{
  _id: ObjectId,
  title: String,
  subtitle: String,
  sections: [
    {
      type: 'text' | 'image' | 'video' | 'code',
      content: String,
      metadata: Object
    }
  ],
  tags: [
    {
      label: String,
      value: String
    }
  ],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
  },
  categoryId: ObjectId,
  multiViews: Number,
  uniqueViews: [String],
  isArchive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Data Structure
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  slug: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: API Response Consistency
*For any* blog API endpoint, the response structure and data from the new Express.js backend should be identical to the response from the original NestJS backend
**Validates: Requirements 1.2, 2.5**

### Property 2: Complete Data Migration
*For any* blog post or category in the original database, it should exist with identical content in the migrated database
**Validates: Requirements 1.4, 2.1, 2.2**

### Property 3: SEO Metadata Preservation
*For any* blog post with SEO metadata, all meta titles, descriptions, and keywords should be preserved exactly during migration
**Validates: Requirements 2.3, 3.3, 7.1**

### Property 4: URL Structure Preservation
*For any* existing blog post URL, it should continue to resolve to the same content after migration
**Validates: Requirements 2.4, 7.2**

### Property 5: Dynamic Content Loading
*For any* request to the landing page, it should fetch and display real blog content from the database instead of hardcoded text
**Validates: Requirements 4.1, 4.2**

### Property 6: Real-time Content Updates
*For any* blog post modification, the changes should be reflected on the landing page without requiring code deployment
**Validates: Requirements 4.3, 4.4**

### Property 7: Moderator Interface Functionality
*For any* CRUD operation performed through the moderator interface, it should successfully execute against the new backend API
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 8: Migration Data Integrity
*For any* migration step, the system should validate data integrity and halt on errors with detailed reporting
**Validates: Requirements 5.2, 5.3**

### Property 9: Performance Preservation
*For any* blog page request, the response time should be equal to or better than the original system
**Validates: Requirements 3.5, 7.5**

### Property 10: Structured Data Consistency
*For any* blog page with structured data, the JSON-LD and schema markup should be identical to the original system
**Validates: Requirements 7.3, 7.4**

## Error Handling

### Migration Error Handling
- **Data Validation Errors**: Halt migration and provide detailed field-level error reports
- **Connection Errors**: Retry with exponential backoff, fail after 3 attempts
- **Integrity Violations**: Rollback partial changes and restore original state
- **Disk Space Errors**: Check available space before migration, fail gracefully

### Runtime Error Handling
- **Database Connection Failures**: Implement connection pooling and automatic reconnection
- **API Validation Errors**: Return structured error responses with field-specific messages
- **File Upload Errors**: Integrate with existing R2/Cloudinary error handling
- **SEO Generation Errors**: Fallback to basic meta tags, log errors for review

### Rollback Mechanisms
- **Database Rollback**: Restore from backup created before migration
- **API Rollback**: Temporarily redirect traffic back to NestJS backend
- **Frontend Rollback**: Revert API endpoint configurations
- **Configuration Rollback**: Restore original environment variables and settings

## Testing Strategy

### Unit Testing
- Test individual blog and category CRUD operations
- Test migration service functions with mock data
- Test API response formatting and validation
- Test error handling scenarios with invalid inputs

### Property-Based Testing
- Use **fast-check** library for JavaScript property-based testing
- Configure each property test to run minimum 100 iterations
- Test data migration with randomly generated blog posts and categories
- Test API consistency with various input combinations
- Test SEO metadata preservation across different content types

### Integration Testing
- Test complete migration workflow from start to finish
- Test frontend applications against new API endpoints
- Test moderator interface functionality end-to-end
- Test performance benchmarks against original system

### Migration Testing
- Test migration with production-like data volumes
- Test rollback procedures under various failure scenarios
- Test data integrity validation with corrupted data
- Test backup and restore functionality

Each property-based test will be tagged with comments referencing the specific correctness property from this design document using the format: **Feature: blog-integration, Property X: [property description]**