import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Photography'];
const emptyForm = { title: '', description: '', category: 'Web Development', price: 0, thumbnail: '', published: false };
const emptyLesson = { title: '', content: '', videoUrl: '', duration: '' };
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [lessonForm, setLessonForm] = useState(null);
  const [lessonData, setLessonData] = useState(emptyLesson);

  useEffect(() => { fetchCourses(); fetchRequests(); }, []);

  const fetchCourses = () => api.get('/courses/my').then(res => setCourses(res.data));
  const fetchRequests = () => api.get('/enrollments/requests/pending').then(res => setRequests(res.data));

  const handleApproval = async (enrollmentId, status) => {
    await api.put(`/enrollments/requests/${enrollmentId}`, { status });
    fetchRequests();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/courses/${editId}`, form);
    else await api.post('/courses', form);
    setShowForm(false); setForm(emptyForm); setEditId(null);
    fetchCourses();
  };

  const handleEdit = (course) => {
    setForm({ title: course.title, description: course.description, category: course.category, price: course.price, thumbnail: course.thumbnail, published: course.published });
    setEditId(course._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    fetchCourses();
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    const { data: course } = await api.post(`/courses/${lessonForm}/lessons`, lessonData);
    // upload PDF if selected
    if (lessonData._pdfFile) {
      const newLesson = course.lessons[course.lessons.length - 1];
      const fd = new FormData();
      fd.append('pdf', lessonData._pdfFile);
      await api.post(`/courses/${lessonForm}/lessons/${newLesson._id}/pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    setLessonForm(null); setLessonData(emptyLesson);
    fetchCourses();
  };

  const handleDeleteLesson = async (courseId, lessonId) => {
    await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
    fetchCourses();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Instructor Dashboard</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} style={styles.btn}>
          {showForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3>{editId ? 'Edit Course' : 'Create New Course'}</h3>
          <input style={styles.input} placeholder="Course Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <textarea style={{ ...styles.input, height: '100px' }} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          <select style={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input style={styles.input} type="number" placeholder="Price (0 for free)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input style={styles.input} placeholder="Thumbnail URL (optional)" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />
          <label style={styles.checkLabel}>
            <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
            Publish Course
          </label>
          <button type="submit" style={styles.btn}>{editId ? 'Update' : 'Create'} Course</button>
        </form>
      )}

      {lessonForm && (
        <form onSubmit={handleAddLesson} style={styles.form}>
          <h3>Add Lesson</h3>
          <input style={styles.input} placeholder="Lesson Title" value={lessonData.title} onChange={e => setLessonData({ ...lessonData, title: e.target.value })} required />
          <textarea style={{ ...styles.input, height: '120px' }} placeholder="Lesson Content" value={lessonData.content} onChange={e => setLessonData({ ...lessonData, content: e.target.value })} required />
          <input style={styles.input} placeholder="Video URL (optional)" value={lessonData.videoUrl} onChange={e => setLessonData({ ...lessonData, videoUrl: e.target.value })} />
          <input style={styles.input} type="number" placeholder="Duration (minutes)" value={lessonData.duration} onChange={e => setLessonData({ ...lessonData, duration: e.target.value })} />
          <label style={styles.fileLabel}>
            📄 Upload PDF Notes (optional)
            <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => setLessonData({ ...lessonData, _pdfFile: e.target.files[0] })} />
          </label>
          {lessonData._pdfFile && <span style={{ fontSize: '0.85rem', color: '#28a745' }}>✓ {lessonData._pdfFile.name}</span>}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={styles.btn}>Add Lesson</button>
            <button type="button" onClick={() => setLessonForm(null)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </form>
      )}

      <div style={styles.courseList}>
        {requests.length > 0 && (
          <div style={styles.requestsSection}>
            <h2 style={styles.sectionTitle}>📋 Enrollment Requests ({requests.length})</h2>
            {requests.map(req => (
              <div key={req._id} style={styles.requestCard}>
                <div>
                  <strong>{req.student?.name}</strong> <span style={styles.email}>{req.student?.email}</span>
                  <p style={styles.reqCourse}>Course: {req.course?.title}</p>
                </div>
                <div style={styles.reqActions}>
                  <button onClick={() => handleApproval(req._id, 'approved')} style={styles.approveBtn}>✓ Approve</button>
                  <button onClick={() => handleApproval(req._id, 'rejected')} style={styles.rejectBtn}>✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <h2 style={styles.sectionTitle}>My Courses</h2>
        {courses.length === 0 ? <p>No courses yet. Create your first course!</p> : courses.map(course => (
          <div key={course._id} style={styles.courseCard}>
            <div style={styles.courseHeader}>
              <div>
                <h3 style={styles.courseName}>{course.title}</h3>
                <span style={styles.badge}>{course.category}</span>
                <span style={{ ...styles.badge, background: course.published ? '#d4edda' : '#fff3cd', color: course.published ? '#155724' : '#856404' }}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div style={styles.actions}>
                <Link to={`/courses/${course._id}`} style={styles.viewBtn}>View</Link>
                <button onClick={() => handleEdit(course)} style={styles.editBtn}>Edit</button>
                <button onClick={() => { setLessonForm(course._id); setLessonData(emptyLesson); }} style={styles.lessonBtn}>+ Lesson</button>
                <button onClick={() => handleDelete(course._id)} style={styles.deleteBtn}>Delete</button>
              </div>
            </div>
            {course.lessons?.length > 0 && (
              <div style={styles.lessons}>
                {course.lessons.map((lesson, i) => (
                  <div key={lesson._id} style={styles.lessonRow}>
                    <span>{i + 1}. {lesson.title}</span>
                    {lesson.duration && <span style={styles.duration}>{lesson.duration} min</span>}
                    {lesson.pdfUrl && <a href={lesson.pdfUrl} target="_blank" rel="noreferrer" style={styles.pdfBadge}>📄 PDF</a>}
                    <button onClick={() => handleDeleteLesson(course._id, lesson._id)} style={styles.deleteLessonBtn}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { margin: 0, color: '#1a1a2e' },
  btn: { background: '#e94560', color: '#fff', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { background: '#6c757d', color: '#fff', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  form: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  input: { padding: '0.7rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  courseList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  courseCard: { background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  courseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
  courseName: { margin: '0 0 0.5rem', color: '#1a1a2e' },
  badge: { fontSize: '0.75rem', background: '#f0f0f0', padding: '0.2rem 0.6rem', borderRadius: '4px', marginRight: '0.5rem' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  viewBtn: { background: '#1a1a2e', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem' },
  editBtn: { background: '#007bff', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  lessonBtn: { background: '#28a745', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  deleteBtn: { background: '#dc3545', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  lessons: { marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  lessonRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#555' },
  duration: { marginLeft: 'auto', color: '#888', fontSize: '0.8rem' },
  deleteLessonBtn: { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.9rem', padding: '0 0.3rem' },
  fileLabel: { display: 'inline-block', padding: '0.6rem 1rem', background: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', border: '1px dashed #ccc' },
  pdfBadge: { fontSize: '0.75rem', background: '#fff3cd', color: '#856404', padding: '0.15rem 0.5rem', borderRadius: '4px', textDecoration: 'none', marginLeft: 'auto' },
  requestsSection: { marginBottom: '2rem' },
  sectionTitle: { color: '#1a1a2e', marginBottom: '1rem', fontSize: '1.2rem' },
  requestCard: { background: '#fff', border: '1px solid #ffe082', borderRadius: '8px', padding: '1rem 1.5rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  email: { color: '#888', fontSize: '0.85rem', marginLeft: '0.5rem' },
  reqCourse: { margin: '0.3rem 0 0', color: '#555', fontSize: '0.9rem' },
  reqActions: { display: 'flex', gap: '0.5rem' },
  approveBtn: { background: '#28a745', color: '#fff', padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  rejectBtn: { background: '#dc3545', color: '#fff', padding: '0.4rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
};
