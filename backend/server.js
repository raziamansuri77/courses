const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'https://courses-iads.onrender.com', /\.vercel\.app$/], exposedHeaders: ['Content-Disposition'] }));
app.use(express.json());
// /uploads is NOT served statically — PDFs only accessible via /api/pdf proxy

app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));

// PDF proxy — fetches from Cloudinary server-side, streams to authenticated user
const jwt = require('jsonwebtoken');
const https = require('https');
const Course = require('./models/Course');
app.get('/api/pdf/:courseId/:lessonId', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).end();
  try { jwt.verify(token, process.env.JWT_SECRET); }
  catch { return res.status(401).end(); }
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).end();
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson || !lesson.pdfUrl) return res.status(404).end();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store');
    https.get(lesson.pdfUrl, cloudRes => cloudRes.pipe(res))
      .on('error', () => res.status(500).end());
  } catch { res.status(500).end(); }
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.error(err));
