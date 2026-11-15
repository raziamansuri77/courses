# LearnHub - MERN Stack Online Learning Platform

## Project Structure
```
courses/
├── backend/          # Express + MongoDB API
└── frontend/         # React + Vite
```

## Prerequisites
- Node.js >= 18
- MongoDB running locally on port 27017

## Setup & Run

### Backend
```bash
cd backend
npm install
npm start
```
Server runs on http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on http://localhost:5173

## Features
- JWT Authentication (register/login)
- Role-based access: Student & Instructor
- Instructors: Create/edit/delete courses, add/remove lessons, publish/draft
- Students: Browse & search courses by category, enroll, track progress
- Lesson viewer with video support and progress tracking

## API Endpoints
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Auth |
| GET | /api/courses | Public |
| GET | /api/courses/:id | Public |
| POST | /api/courses | Instructor |
| PUT | /api/courses/:id | Instructor |
| DELETE | /api/courses/:id | Instructor |
| GET | /api/courses/my | Instructor |
| POST | /api/courses/:id/lessons | Instructor |
| DELETE | /api/courses/:id/lessons/:lessonId | Instructor |
| POST | /api/enrollments/:courseId | Student |
| GET | /api/enrollments/my/all | Student |
| GET | /api/enrollments/:courseId | Student |
| PUT | /api/enrollments/:courseId/progress | Student |
