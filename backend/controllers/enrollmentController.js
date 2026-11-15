const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enroll = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const enrollment = await Enrollment.create({ student: req.user._id, course: req.params.courseId });
    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already enrolled' });
    res.status(500).json({ message: err.message });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name' } });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      const course = await Course.findById(req.params.courseId);
      enrollment.progress = Math.round((enrollment.completedLessons.length / course.lessons.length) * 100);
      await enrollment.save();
    }
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
