
### Muvaffaqiyatli Javob
```json
{
  "success": true,
  "message": "Operatsiya muvaffaqiyatli yakunlandi",
  "data": {
    // Javob ma'lumotlari
  }
}
```

### Xato Javobi
```json
{
  "success": false,
  "message": "Xato tavsifi",
  "error": "XATO_KODI",
  "details": {
    // Qo'shimcha xato ma'lumotlari
  }
}
```

## Autentifikatsiya Endpointlari

### Foydalanuvchini Ro'yxatdan O'tkazish
**POST** `/auth/register`

Yangi foydalanuvchi hisobini ro'yxatdan o'tkazish.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+998901234567",
  "password": "securePassword123",
  "role": "student" // or "teacher"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your account.",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john.doe@example.com",
      "role": "student",
      "isVerified": false
    }
  }
}
```

### Verify Registration OTP
**POST** `/auth/verify-registration-otp`

Verify the OTP sent during registration.

**Request Body:**
```json
{
  "identifier": "john.doe@example.com", // email or phone
  "otp": "123456"
}
```

### Login
**POST** `/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "identifier": "john.doe@example.com", // email or phone
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "student"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### Logout
**POST** `/auth/logout`

Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

### Change Password
**PATCH** `/auth/change-password`

Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### Check User Exists
**POST** `/auth/check-user`

Check if user exists by email or phone.

**Request Body:**
```json
{
  "identifier": "john.doe@example.com"
}
```

## Teacher Endpoints

### Get All Teachers
**GET** `/teachers`

Retrieve list of all teachers.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or specialization

**Response:**
```json
{
  "success": true,
  "data": {
    "teachers": [
      {
        "id": "teacher_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "bio": "Experienced mathematics teacher",
        "specialization": "Mathematics",
        "profileImage": "https://example.com/image.jpg",
        "ratingAverage": 4.8,
        "reviewsCount": 25,
        "courseCount": 5,
        "studentCount": 150
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Teacher Profile
**GET** `/teachers/:id`

Get detailed teacher profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "teacher": {
      "id": "teacher_id",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "phone": "+998901234567",
      "bio": "Experienced mathematics teacher with 10+ years",
      "specialization": "Mathematics",
      "profileImage": "https://example.com/image.jpg",
      "ratingAverage": 4.8,
      "reviewsCount": 25,
      "certificates": [
        {
          "title": "Mathematics Degree",
          "issuer": "University Name",
          "issueDate": "2020-06-15",
          "url": "https://example.com/cert.pdf"
        }
      ],
      "courses": ["course_id_1", "course_id_2"],
      "socialLinks": {
        "linkedin": "https://linkedin.com/in/janesmith",
        "github": "https://github.com/janesmith"
      },
      "paymentMethods": {
        "click": "998901234567",
        "payme": "998901234567"
      }
    }
  }
}
```

### Update Teacher Profile
**PATCH** `/teachers/:id`

Update teacher profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bio": "Updated bio text",
  "specialization": "Advanced Mathematics",
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/janesmith",
    "website": "https://janesmith.com"
  }
}
```

### Get Teacher Dashboard
**GET** `/teachers/:id/dashboard`

Get teacher dashboard data including statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCourses": 5,
      "totalStudents": 150,
      "totalEarnings": 2500000,
      "currentBalance": 500000,
      "monthlyEarnings": 300000,
      "newStudentsThisMonth": 25
    },
    "recentCourses": [],
    "recentStudents": [],
    "pendingPayments": []
  }
}
```

## Student Endpoints

### Get All Students
**GET** `/students`

Retrieve list of all students.

**Headers:** `Authorization: Bearer <token>` (Admin/Teacher only)

### Get Student Profile
**GET** `/students/:id`

Get student profile information.

**Headers:** `Authorization: Bearer <token>`

### Update Student Profile
**PATCH** `/students/:id`

Update student profile.

**Headers:** `Authorization: Bearer <token>`

## Course Endpoints

### Get All Courses
**GET** `/courses`

Retrieve list of courses.

**Query Parameters:**
- `teacherId` (optional): Filter by teacher
- `category` (optional): Filter by category
- `level` (optional): Filter by difficulty level
- `search` (optional): Search in title and description
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "course_id",
        "title": "Advanced Mathematics",
        "description": "Comprehensive mathematics course",
        "price": 500000,
        "teacher": {
          "id": "teacher_id",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "category": "Mathematics",
        "level": "Advanced",
        "duration": 40,
        "studentsCount": 25,
        "rating": 4.8,
        "thumbnail": "https://example.com/thumb.jpg",
        "isPublished": true,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
}
```

### Get Course Details
**GET** `/courses/:id`

Get detailed course information.

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "course_id",
      "title": "Advanced Mathematics",
      "description": "Comprehensive mathematics course covering...",
      "price": 500000,
      "teacher": {
        "id": "teacher_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "profileImage": "https://example.com/profile.jpg"
      },
      "modules": [
        {
          "id": "module_id",
          "title": "Introduction to Calculus",
          "order": 1,
          "lessons": [
            {
              "id": "lesson_id",
              "title": "Basic Derivatives",
              "type": "video",
              "duration": 1800,
              "order": 1
            }
          ]
        }
      ],
      "requirements": ["Basic algebra knowledge"],
      "whatYouWillLearn": ["Advanced calculus", "Problem solving"],
      "category": "Mathematics",
      "level": "Advanced",
      "duration": 40,
      "studentsCount": 25,
      "rating": 4.8,
      "reviewsCount": 12,
      "isPublished": true
    }
  }
}
```

### Create Course
**POST** `/courses`

Create a new course.

**Headers:** `Authorization: Bearer <token>` (Teacher only)

**Request Body:**
```json
{
  "title": "New Course Title",
  "description": "Course description",
  "price": 300000,
  "category": "Programming",
  "level": "Beginner",
  "requirements": ["Basic computer knowledge"],
  "whatYouWillLearn": ["Programming basics", "Problem solving"]
}
```

### Update Course
**PATCH** `/courses/:id`

Update course information.

**Headers:** `Authorization: Bearer <token>` (Course owner only)

### Delete Course
**DELETE** `/courses/:id`

Delete a course.

**Headers:** `Authorization: Bearer <token>` (Course owner only)

## Module Endpoints

### Get Course Modules
**GET** `/modules?courseId=:courseId`

Get all modules for a specific course.

### Create Module
**POST** `/modules`

Create a new module.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Module Title",
  "description": "Module description",
  "courseId": "course_id",
  "order": 1
}
```

### Update Module
**PATCH** `/modules/:id`

Update module information.

### Delete Module
**DELETE** `/modules/:id`

Delete a module.

## Lesson Endpoints

### Get Module Lessons
**GET** `/lessons?moduleId=:moduleId`

Get all lessons for a specific module.

### Create Lesson
**POST** `/lessons`

Create a new lesson.

**Request Body:**
```json
{
  "title": "Lesson Title",
  "description": "Lesson description",
  "moduleId": "module_id",
  "type": "video", // "video", "document", "quiz"
  "content": {
    "videoUrl": "https://example.com/video.mp4",
    "duration": 1800
  },
  "order": 1
}
```

## Assignment Endpoints

### Get Course Assignments
**GET** `/assignments?courseId=:courseId`

Get all assignments for a course.

### Create Assignment
**POST** `/assignments`

Create a new assignment.

**Request Body:**
```json
{
  "title": "Assignment Title",
  "description": "Assignment description",
  "courseId": "course_id",
  "dueDate": "2024-02-15T23:59:59Z",
  "maxScore": 100,
  "instructions": "Complete the following tasks..."
}
```

## File Upload Endpoints

### Upload Image
**POST** `/upload/image`

Upload an image file.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
FormData with 'image' field containing the file
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://darslinker.uz/images/filename.jpg",
    "filename": "filename.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

### Upload Video
**POST** `/upload/video`

Upload a video file.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

### Upload Document
**POST** `/upload/document`

Upload a document file (PDF, DOC, etc.).

## Blog Endpoints

### Get All Blog Posts
**GET** `/blogs`

Get all published blog posts.

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in title and content
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Blog Post
**GET** `/blogs/:id`

Get a specific blog post.

### Create Blog Post
**POST** `/blogs`

Create a new blog post.

**Headers:** `Authorization: Bearer <token>` (Admin only)

**Request Body:**
```json
{
  "header": {
    "title": "Blog Post Title",
    "subtitle": "Blog post subtitle"
  },
  "sections": [
    {
      "header": "Section Title",
      "content": "Section content..."
    },
    {
      "h2": "Subsection Title",
      "content": "Subsection content..."
    }
  ],
  "tags": [
    {
      "label": "Programming",
      "value": "programming"
    }
  ],
  "seo": {
    "keywords": ["programming", "tutorial", "javascript"]
  }
}
```

### Update Blog Post
**PATCH** `/blogs/:id`

Update a blog post.

### Delete Blog Post
**DELETE** `/blogs/:id`

Delete a blog post.

## Payment Endpoints

### Submit Payment
**POST** `/payments/submit`

Submit a payment for course enrollment.

**Request Body:**
```json
{
  "courseId": "course_id",
  "studentId": "student_id",
  "amount": 500000,
  "paymentMethod": "click",
  "transactionId": "transaction_id_from_payment_system"
}
```

### Get Teacher Payments
**GET** `/payments/teacher/:teacherId`

Get payment history for a teacher.

**Query Parameters:**
- `status` (optional): Filter by payment status

### Approve Payment
**PATCH** `/payments/:id/approve`

Approve a pending payment.

**Headers:** `Authorization: Bearer <token>` (Teacher/Admin only)

## Notification Endpoints

### Get User Notifications
**GET** `/notifications`

Get notifications for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

### Mark Notification as Read
**PATCH** `/notifications/:id/read`

Mark a notification as read.

## Sub-Admin Endpoints

### Admin Login
**POST** `/sub-admins/admin-login`

Login for moderator panel.

**Request Body:**
```json
{
  "phone": "+998990009900",
  "password": "moderator_password"
}
```

### Create Sub-Admin
**POST** `/sub-admins/teachers/:teacherId/sub-admins`

Create a sub-admin for a teacher.

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication required or failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ERROR` | Resource already exists |
| `PAYMENT_ERROR` | Payment processing failed |
| `UPLOAD_ERROR` | File upload failed |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

| Endpoint Category | Limit |
|------------------|-------|
| Authentication | 5 requests/minute |
| File Upload | 10 requests/minute |
| General API | 100 requests/minute |
| Blog Endpoints | 50 requests/minute |
