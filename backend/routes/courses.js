const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { protect, instructor } = require('../middleware/auth');
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getInstructorCourses, addLesson, deleteLesson, uploadLessonPdf
} = require('../controllers/courseController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
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
