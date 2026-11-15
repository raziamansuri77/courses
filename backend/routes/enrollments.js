const router = require('express').Router();
const { protect, instructor } = require('../middleware/auth');
const { enroll, getMyEnrollments, updateProgress, getEnrollment, getPendingRequests, updateEnrollmentStatus, getEnrollmentOverview } = require('../controllers/enrollmentController');

router.post('/:courseId', protect, enroll);
router.get('/my/all', protect, getMyEnrollments);
router.get('/requests/pending', protect, instructor, getPendingRequests);
router.get('/overview', protect, instructor, getEnrollmentOverview);
router.put('/requests/:enrollmentId', protect, instructor, updateEnrollmentStatus);
router.get('/:courseId', protect, getEnrollment);
router.put('/:courseId/progress', protect, updateProgress);

module.exports = router;
