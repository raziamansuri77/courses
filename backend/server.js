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

// PDF proxy — generates signed Cloudinary URL, streams to authenticated user
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const Course = require('./models/Course');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get('/api/pdf/:courseId/:lessonId', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(401).end();
  try { jwt.verify(token, process.env.JWT_SECRET); }
  catch { return res.status(401).end(); }
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).end();
    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson || !lesson.pdfPublicId) return res.status(404).end();
    // generate a signed URL valid for 5 minutes
    const signedUrl = cloudinary.utils.private_download_url(
      lesson.pdfPublicId, 'pdf',
      { resource_type: 'raw', expires_at: Math.floor(Date.now() / 1000) + 300, attachment: false }
    );
    const response = await axios.get(signedUrl, { responseType: 'stream', maxRedirects: 5 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store');
    response.data.pipe(res);
  } catch (err) {
    console.error('PDF proxy error:', err.message);
    res.status(500).end();
  }
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.error(err));
