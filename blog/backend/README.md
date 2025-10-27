# Darslinker Blog Backend (NestJS)

Professional blog API with advanced SEO features and analytics.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Edit `.env` file and replace with your MongoDB credentials:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/darslinker_blog
```

### 3. Start Development Server
```bash
npm run start:dev
```

Server will run on: **http://localhost:5000/api**

## 📊 API Endpoints

### Public Endpoints (Blog Frontend)
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get blog by ID
- `GET /api/blogs/:id/related` - Get related blogs
- `POST /api/blogs/:id/view` - Track blog view
- `GET /api/categories` - Get all categories

### Admin Endpoints (Moderator)
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `PUT /api/blogs/:id/archive` - Archive blog
- `PUT /api/blogs/:id/unarchive` - Unarchive blog
- `DELETE /api/blogs/:id` - Delete blog
- `GET /api/blogs/archive` - Get archived blogs

## 🎯 SEO Features

✅ **View Tracking** - Multi-views and unique views
✅ **Meta Tags** - Title, description, keywords
✅ **Related Posts** - Tag-based recommendations
✅ **Search** - Title/subtitle search
✅ **Archive System** - Content lifecycle management

## 🔧 Tech Stack

- **NestJS** - Enterprise Node.js framework
- **TypeScript** - Type safety
- **MongoDB** - Document database
- **Mongoose** - ODM with validation
- **Class Validator** - DTO validation
