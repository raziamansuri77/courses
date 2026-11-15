const router = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect, instructor } = require('../middleware/auth');
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getInstructorCourses, addLesson, deleteLesson, uploadLessonPdf
} = require('../controllers/courseController');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'learnhub-pdfs', resource_type: 'raw', type: 'upload', format: 'pdf' },
});
const upload = multer({ storage, fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf') });

router.get('/', getCourses);
router.get('/my', protect, instructor, getInstructorCourses);
router.get('/:id', getCourse);
router.post('/', protect, instructor, createCourse);
router.put('/:id', protect, instructor, updateCourse);
router.delete('/:id', protect, instructor, deleteCourse);
router.post('/:id/lessons', protect, instructor, addLesson);
router.delete('/:id/lessons/:lessonId', protect, instructor, deleteLesson);
router.post('/:id/lessons/:lessonId/pdf', protect, instructor, upload.single('pdf'), uploadLessonPdf);

module.exports = router;
