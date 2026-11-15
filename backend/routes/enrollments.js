const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { enroll, getMyEnrollments, updateProgress, getEnrollment } = require('../controllers/enrollmentController');

router.post('/:courseId', protect, enroll);
router.get('/my/all', protect, getMyEnrollments);
router.get('/:courseId', protect, getEnrollment);
router.put('/:courseId/progress', protect, updateProgress);

module.exports = router;
