# Blog Moderator (Admin Interface)

Admin dashboard for managing blog content, posts, categories, and settings.

## Features

- Dashboard with statistics
- Post management (Create, Read, Update, Delete)
- Category management
- Draft and publish functionality
- SEO-friendly slug generation
- Responsive admin interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update API URL in `.env` if needed

4. Run development server:
```bash
npm run dev
```

The admin interface will be available at `http://localhost:3001`

5. Build for production:
```bash
npm run build
```

## Features

- Clean and intuitive admin interface
- Post editor with auto-slug generation
- Statistics dashboard
- Responsive design
- Authentication ready (add JWT handling)

## Tech Stack

- Vite
- Vanilla JavaScript
- Axios for API calls
- date-fns for date formatting
- Modern CSS (Grid, Flexbox)

## Security Notes

- This interface should be protected behind authentication
- Add JWT token handling in production
- Use HTTPS in production
- Implement proper role-based access control
