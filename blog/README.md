# SEO-Friendly Blog Project

A complete blog platform with separate frontend, backend, and admin interface. Designed for quick deployment and SEO optimization.

## Project Structure

```
blog/
├── backend/          # Node.js + Express API
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   ├── .env.example  # Environment variables template
│   └── README.md     # Backend documentation
│
└── frontend/         # Vite frontend application
    ├── index.html    # Main HTML file (SEO optimized)
    ├── src/
    │   ├── main.js   # Application entry point
    │   └── style.css # Styles
    ├── package.json  # Frontend dependencies
    ├── vite.config.js # Vite configuration
    ├── .env.example  # Environment variables template
    └── README.md     # Frontend documentation
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3. Moderator (Admin) Setup

See `/moderator` directory in the parent folder.

```bash
cd ../../moderator
npm install
cp .env.example .env
npm run dev
```

Admin interface will run on `http://localhost:3001`

## Features

### Backend (API)
- RESTful API with Express
- MongoDB database support
- JWT authentication ready
- Security headers with Helmet
- CORS configuration
- Rate limiting
- Request logging with Morgan

### Frontend
- Fast development with Vite
- SEO-optimized HTML structure
- Meta tags for social media (Open Graph, Twitter Cards)
- Responsive design
- API integration with Axios
- Modern CSS with Grid and Flexbox

### Moderator (Admin)
- Dashboard with statistics
- Post management (CRUD operations)
- Category management
- Draft and publish workflow
- Auto-slug generation from titles
- Responsive admin interface

## SEO Features

- Semantic HTML structure
- Proper heading hierarchy (H1, H2, H3)
- Meta descriptions
- Open Graph tags for social sharing
- Twitter Card tags
- Clean, readable URLs
- Fast page load times with Vite
- Mobile-responsive design

## Deployment Checklist

- [ ] Set up MongoDB database
- [ ] Configure environment variables
- [ ] Set up HTTPS/SSL
- [ ] Configure domain and DNS
- [ ] Build frontend for production (`npm run build`)
- [ ] Deploy backend API
- [ ] Deploy frontend static files
- [ ] Deploy moderator interface (protect with auth)
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Test all features in production

## Tech Stack

### Backend
- Node.js
- Express 5
- MongoDB with Mongoose
- JWT for authentication
- Helmet for security
- CORS
- Morgan for logging

### Frontend
- Vite
- Vanilla JavaScript
- Axios
- date-fns
- CSS3

### Moderator
- Vite
- Vanilla JavaScript
- Axios
- Modern CSS

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Health Check
- `GET /api/health` - API health status

## Development Timeline

This project is designed to be deployed in **3 days**:

**Day 1**: Backend API + Database
- Set up MongoDB
- Implement all API endpoints
- Add authentication
- Test with Postman/Thunder Client

**Day 2**: Frontend + SEO
- Create all pages
- Integrate with API
- Optimize for SEO
- Test responsive design

**Day 3**: Admin Interface + Deployment
- Set up admin dashboard
- Deploy to production
- Configure domain
- Final testing

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
