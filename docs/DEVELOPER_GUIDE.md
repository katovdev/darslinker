# Dasturchilar Qo'llanmasi - Dars Linker Platformasi

## Boshlash

Ushbu qo'llanma sizga ishlab chiqish muhitini sozlash va Dars Linker platformasiga hissa qo'shish uchun kod bazasi strukturasini tushunishda yordam beradi.

## Ishlab Chiqish Muhitini Sozlash

### Oldindan Talab Qilinadigan Shartlar

Ishlab chiqishni boshlashdan oldin quyidagilar o'rnatilganligiga ishonch hosil qiling:

- **Node.js** (v18 yoki undan yuqori)
- **npm** (v8 yoki undan yuqori)
- **Git**
- **MongoDB** (mahalliy o'rnatish yoki Atlas hisobi)
- **Kod Muharriri** (VS Code tavsiya etiladi)

### Repository Sozlash

1. **Repositoriyani Klonlash**
```bash
git clone https://github.com/sizning-foydalanuvchi-nomingiz/dars-linker.git
cd dars-linker
```

2. **Bog'liqliklarni O'rnatish**
```bash
# Backend bog'liqliklari
cd backend
npm install

# Frontend bog'liqliklari
cd ../frontend
npm install

# Moderator bog'liqliklari
cd ../moderator
npm install
```

3. **Environment Configuration**

Create environment files for each component:

**Backend** (`backend/.env`):
```env
# Server Configuration
PORT=8001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/darslinker_dev
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/darslinker_dev

# JWT Configuration
JWT_ACCESS_TOKEN_SECRET_KEY=your_development_secret_key
JWT_REFRESH_TOKEN_SECRET_KEY=your_development_refresh_secret
JWT_ACCESS_TOKEN_EXPIRES_IN=30d
JWT_REFRESH_TOKEN_EXPIRES_IN=90d

# Email Configuration (for development)
NODEMAILER_USER_EMAIL=your-test-email@gmail.com
NODEMAILER_USER_PASSWORD=your_app_password

# File Storage (use local storage for development)
R2_ENDPOINT=https://your-dev-account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_dev_access_key
R2_SECRET_ACCESS_KEY=your_dev_secret_key
R2_BUCKET_NAME=darslinker-dev
R2_PUBLIC_URL=http://localhost:8001

# Telegram Bots (optional for development)
TELEGRAM_BOT_TOKEN=your_dev_bot_token
TEACHER_BOT_TOKEN=your_dev_teacher_bot_token

# URLs
FRONTEND_URL=http://localhost:5173
MODERATOR_URL=http://localhost:5174
BACKEND_URL=http://localhost:8001

# Development Settings
USE_WEBHOOK=false
OTP_LENGTH=6
OTP_EXPIRES_SECONDS=1800
OTP_MAX_ATTEMPTS=5
HASH_OTP=true
BCRYPT_SALT_ROUNDS=10
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8001/api
```

**Moderator** (`moderator/.env`):
```env
VITE_API_URL=http://localhost:8001/api
```

### Running the Development Servers

1. **Start Backend Server**
```bash
cd backend
npm run dev
```
Server will start on `http://localhost:8001`

2. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend will be available on `http://localhost:5173`

3. **Start Moderator Panel**
```bash
cd moderator
npm run dev
```
Moderator panel will be available on `http://localhost:5174`

## Project Architecture

### Backend Architecture

The backend follows a layered architecture pattern:

```
backend/src/
├── controllers/     # Request handlers and business logic
├── models/         # Database models and schemas
├── routes/         # API route definitions
├── services/       # Business logic and external integrations
├── middlewares/    # Custom middleware functions
├── validations/    # Input validation schemas
├── utils/          # Utility functions and helpers
└── __tests__/      # Test files
```

#### Key Components

**Controllers**: Handle HTTP requests and responses
```javascript
// Example: backend/src/controllers/course.controller.js
export const getCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses(req.query);
    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Models**: Define database schemas using Mongoose
```javascript
// Example: backend/src/models/course.model.js
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
```

**Services**: Contain business logic
```javascript
// Example: backend/src/services/course.service.js
export const getAllCourses = async (filters) => {
  const query = buildQuery(filters);
  return await Course.find(query).populate('teacher');
};
```

**Routes**: Define API endpoints
```javascript
// Example: backend/src/routes/course.routes.js
const router = Router();

router.get('/', getCourses);
router.post('/', authenticate, createCourse);
router.get('/:id', getCourse);

export default router;
```

### Frontend Architecture

The frontend uses a component-based architecture with vanilla JavaScript:

```
frontend/src/
├── pages/          # Page components
├── components/     # Reusable UI components
├── services/       # API service layer
├── utils/          # Utility functions
├── config/         # Configuration files
└── __tests__/      # Test files
```

#### Key Concepts

**Page Components**: Handle routing and page-level logic
```javascript
// Example: frontend/src/pages/courses/course-list.js
export class CourseListPage {
  constructor() {
    this.apiService = new ApiService();
    this.courses = [];
  }

  async init() {
    await this.loadCourses();
    this.render();
    this.bindEvents();
  }

  async loadCourses() {
    try {
      const response = await this.apiService.getCourses();
      this.courses = response.data.courses;
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  }

  render() {
    const container = document.getElementById('courses-container');
    container.innerHTML = this.courses.map(course => 
      this.renderCourseCard(course)
    ).join('');
  }
}
```

**API Services**: Handle HTTP communication
```javascript
// Example: frontend/src/services/course.service.js
export class CourseService {
  constructor() {
    this.baseURL = config.api.baseUrl;
  }

  async getCourses(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/courses?${params}`);
    return await response.json();
  }
}
```

## Development Workflow

### Git Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/new-feature-name
```

2. **Make Changes and Commit**
```bash
git add .
git commit -m "feat: add new feature description"
```

3. **Push and Create Pull Request**
```bash
git push origin feature/new-feature-name
```

### Commit Message Convention

Follow conventional commit format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Style Guidelines

#### JavaScript Style
- Use ES6+ features
- Use async/await for asynchronous operations
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Follow consistent indentation (2 spaces)

#### Example Code Style
```javascript
/**
 * Creates a new course with validation
 * @param {Object} courseData - Course information
 * @param {string} courseData.title - Course title
 * @param {string} courseData.description - Course description
 * @returns {Promise<Object>} Created course object
 */
async function createCourse(courseData) {
  try {
    // Validate input data
    const validatedData = await validateCourseData(courseData);
    
    // Create course in database
    const course = await Course.create(validatedData);
    
    // Return success response
    return {
      success: true,
      data: course
    };
  } catch (error) {
    logger.error('Course creation failed:', error);
    throw new Error('Failed to create course');
  }
}
```

## Testing

### Backend Testing

The backend uses Jest for testing with property-based testing support:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- course.test.js
```

#### Unit Test Example
```javascript
// backend/src/__tests__/services/course.service.test.js
import { createCourse } from '../services/course.service.js';
import Course from '../models/course.model.js';

describe('Course Service', () => {
  describe('createCourse', () => {
    it('should create a course with valid data', async () => {
      const courseData = {
        title: 'Test Course',
        description: 'Test Description',
        price: 100000,
        teacherId: 'teacher_id'
      };

      const result = await createCourse(courseData);

      expect(result.success).toBe(true);
      expect(result.data.title).toBe(courseData.title);
    });
  });
});
```

#### Property-Based Test Example
```javascript
// backend/src/__tests__/properties/course.property.test.js
import fc from 'fast-check';
import { validateCourseData } from '../validations/course.validation.js';

describe('Course Validation Properties', () => {
  it('should always return valid data for valid inputs', () => {
    fc.assert(fc.property(
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 10, maxLength: 1000 }),
        price: fc.integer({ min: 0, max: 10000000 })
      }),
      (courseData) => {
        const result = validateCourseData(courseData);
        expect(result.error).toBeUndefined();
      }
    ));
  });
});
```

### Frontend Testing

Frontend testing focuses on component behavior and API integration:

```javascript
// frontend/src/__tests__/services/api.service.test.js
import { ApiService } from '../services/api.service.js';

describe('API Service', () => {
  let apiService;

  beforeEach(() => {
    apiService = new ApiService();
  });

  it('should handle successful API responses', async () => {
    // Mock fetch response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    });

    const result = await apiService.getCourses();
    expect(result.success).toBe(true);
  });
});
```

## Database Management

### MongoDB Schema Design

#### User Hierarchy
```javascript
// Base User Schema
const userSchema = {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  role: ['student', 'teacher', 'admin'],
  isVerified: Boolean
};

// Teacher extends User
const teacherSchema = {
  ...userSchema,
  bio: String,
  specialization: String,
  courses: [ObjectId],
  balance: Number
};

// Student extends User
const studentSchema = {
  ...userSchema,
  enrolledCourses: [ObjectId],
  completedCourses: [ObjectId]
};
```

#### Course Structure
```javascript
const courseSchema = {
  title: String,
  description: String,
  price: Number,
  teacher: ObjectId,
  modules: [ObjectId],
  category: String,
  level: ['Beginner', 'Intermediate', 'Advanced'],
  isPublished: Boolean
};

const moduleSchema = {
  title: String,
  description: String,
  course: ObjectId,
  lessons: [ObjectId],
  order: Number
};

const lessonSchema = {
  title: String,
  description: String,
  module: ObjectId,
  type: ['video', 'document', 'quiz'],
  content: Object,
  order: Number
};
```

### Database Migrations

For schema changes, create migration scripts:

```javascript
// backend/scripts/migrations/001_add_course_categories.js
import mongoose from 'mongoose';
import Course from '../src/models/course.model.js';

export async function up() {
  // Add category field to existing courses
  await Course.updateMany(
    { category: { $exists: false } },
    { $set: { category: 'General' } }
  );
}

export async function down() {
  // Remove category field
  await Course.updateMany(
    {},
    { $unset: { category: 1 } }
  );
}
```

## API Development

### Creating New Endpoints

1. **Define Route**
```javascript
// backend/src/routes/example.routes.js
import { Router } from 'express';
import { getExamples, createExample } from '../controllers/example.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getExamples);
router.post('/', authenticate, createExample);

export default router;
```

2. **Create Controller**
```javascript
// backend/src/controllers/example.controller.js
import { exampleService } from '../services/example.service.js';

export const getExamples = async (req, res) => {
  try {
    const examples = await exampleService.getAllExamples(req.query);
    res.json({
      success: true,
      data: examples
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

3. **Implement Service**
```javascript
// backend/src/services/example.service.js
import Example from '../models/example.model.js';

export const exampleService = {
  async getAllExamples(filters) {
    const query = this.buildQuery(filters);
    return await Example.find(query);
  },

  buildQuery(filters) {
    const query = {};
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    return query;
  }
};
```

4. **Add Validation**
```javascript
// backend/src/validations/example.validation.js
import Joi from 'joi';

export const createExampleSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  description: Joi.string().required().min(10).max(1000)
});
```

### Error Handling

Implement consistent error handling:

```javascript
// backend/src/middlewares/error.middleware.js
export const globalErrorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: error.code || 'SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
```

## Frontend Development

### Creating New Pages

1. **Create Page Component**
```javascript
// frontend/src/pages/example/example-list.js
export class ExampleListPage {
  constructor() {
    this.examples = [];
    this.loading = false;
  }

  async init() {
    this.render();
    await this.loadExamples();
    this.bindEvents();
  }

  async loadExamples() {
    this.loading = true;
    this.updateLoadingState();

    try {
      const response = await apiService.getExamples();
      this.examples = response.data;
      this.render();
    } catch (error) {
      this.showError('Failed to load examples');
    } finally {
      this.loading = false;
      this.updateLoadingState();
    }
  }

  render() {
    const container = document.getElementById('main-content');
    container.innerHTML = `
      <div class="page-header">
        <h1>Examples</h1>
        <button id="create-example-btn" class="btn btn-primary">
          Create Example
        </button>
      </div>
      <div id="examples-grid" class="grid">
        ${this.examples.map(example => this.renderExampleCard(example)).join('')}
      </div>
    `;
  }

  renderExampleCard(example) {
    return `
      <div class="card" data-id="${example.id}">
        <h3>${example.title}</h3>
        <p>${example.description}</p>
        <div class="card-actions">
          <button class="btn btn-secondary edit-btn">Edit</button>
          <button class="btn btn-danger delete-btn">Delete</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById('create-example-btn')
      .addEventListener('click', () => this.showCreateModal());

    document.querySelectorAll('.edit-btn')
      .forEach(btn => btn.addEventListener('click', this.handleEdit.bind(this)));
  }
}
```

2. **Add to Router**
```javascript
// frontend/src/utils/router.js
import { ExampleListPage } from '../pages/example/example-list.js';

const routes = {
  '/examples': ExampleListPage,
  // ... other routes
};
```

### State Management

For complex state, use a simple state management pattern:

```javascript
// frontend/src/utils/state.js
class StateManager {
  constructor() {
    this.state = {};
    this.listeners = {};
  }

  setState(key, value) {
    this.state[key] = value;
    this.notifyListeners(key, value);
  }

  getState(key) {
    return this.state[key];
  }

  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }

  notifyListeners(key, value) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(value));
    }
  }
}

export const stateManager = new StateManager();
```

## Performance Optimization

### Backend Optimization

1. **Database Indexing**
```javascript
// Add indexes to frequently queried fields
courseSchema.index({ teacher: 1, isPublished: 1 });
courseSchema.index({ title: 'text', description: 'text' });
```

2. **Query Optimization**
```javascript
// Use projection to limit returned fields
const courses = await Course.find(query)
  .select('title description price teacher')
  .populate('teacher', 'firstName lastName');
```

3. **Caching**
```javascript
// Simple in-memory cache
const cache = new Map();

export const getCachedCourses = async (key) => {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const courses = await Course.find();
  cache.set(key, courses);
  
  // Expire cache after 5 minutes
  setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  
  return courses;
};
```

### Frontend Optimization

1. **Lazy Loading**
```javascript
// Lazy load page components
const loadPage = async (pageName) => {
  const module = await import(`../pages/${pageName}/${pageName}.js`);
  return module.default;
};
```

2. **Image Optimization**
```javascript
// Lazy load images
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};
```

## Security Best Practices

### Backend Security

1. **Input Validation**
```javascript
// Always validate input data
import Joi from 'joi';

const validateInput = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details
    });
  }
  next();
};
```

2. **Authentication Middleware**
```javascript
// Verify JWT tokens
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

### Frontend Security

1. **XSS Prevention**
```javascript
// Sanitize user input
const sanitizeHTML = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};
```

2. **CSRF Protection**
```javascript
// Include CSRF token in requests
const makeSecureRequest = async (url, options = {}) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  
  return fetch(url, {
    ...options,
    headers: {
      'X-CSRF-Token': csrfToken,
      ...options.headers
    }
  });
};
```

## Debugging and Troubleshooting

### Backend Debugging

1. **Logging**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in code
logger.info('User logged in', { userId: user.id });
logger.error('Database connection failed', { error: error.message });
```

2. **Error Tracking**
```javascript
// Global error handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### Frontend Debugging

1. **Console Logging**
```javascript
// Structured logging
const log = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }
};
```

2. **Error Boundaries**
```javascript
// Global error handler
window.addEventListener('error', (event) => {
  log.error('Global error:', event.error);
  // Send to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  log.error('Unhandled promise rejection:', event.reason);
});
```

## Contributing

### Pull Request Process

1. **Fork and Clone**: Fork the repository and clone your fork
2. **Create Branch**: Create a feature branch from `main`
3. **Make Changes**: Implement your changes with tests
4. **Test**: Run all tests and ensure they pass
5. **Commit**: Use conventional commit messages
6. **Push**: Push your branch to your fork
7. **Pull Request**: Create a pull request with detailed description

### Code Review Guidelines

- **Functionality**: Does the code work as intended?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security vulnerabilities?
- **Testing**: Are there adequate tests?
- **Documentation**: Is the code well-documented?
- **Style**: Does the code follow project conventions?

---

This developer guide provides a comprehensive foundation for contributing to the Dars Linker platform. For specific questions or clarifications, refer to the API documentation or reach out to the development team.