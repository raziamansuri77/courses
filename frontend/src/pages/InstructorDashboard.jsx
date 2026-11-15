import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Photography'];
const emptyForm = { title: '', description: '', category: 'Web Development', price: 0, thumbnail: '', published: false };
const emptyLesson = { title: '', content: '', videoUrl: '', duration: '' };

export default function InstructorDashboard() {
  const [tab, setTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [overview, setOverview] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [lessonForm, setLessonForm] = useState(null);
  const [lessonData, setLessonData] = useState(emptyLesson);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = () => {
    api.get('/courses/my').then(res => setCourses(res.data));
    api.get('/enrollments/requests/pending').then(res => setRequests(res.data));
    api.get('/enrollments/overview').then(res => setOverview(res.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/courses/${editId}`, form);
    else await api.post('/courses', form);
    setShowForm(false); setForm(emptyForm); setEditId(null);
    fetchAll();
  };

  const handleEdit = (course) => {
    setForm({ title: course.title, description: course.description, category: course.category, price: course.price, thumbnail: course.thumbnail, published: course.published });
    setEditId(course._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    await api.delete(`/courses/${id}`);
    fetchAll();
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    const { data: course } = await api.post(`/courses/${lessonForm}/lessons`, lessonData);
    if (lessonData._pdfFile) {
      const newLesson = course.lessons[course.lessons.length - 1];
      const fd = new FormData();
      fd.append('pdf', lessonData._pdfFile);
      await api.post(`/courses/${lessonForm}/lessons/${newLesson._id}/pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    setLessonForm(null); setLessonData(emptyLesson);
    fetchAll();
  };

  const handleDeleteLesson = async (courseId, lessonId) => {
    await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
    fetchAll();
  };

  const handleApproval = async (enrollmentId, status) => {
    await api.put(`/enrollments/requests/${enrollmentId}`, { status });
    fetchAll();
  };

  const statusBadge = (status) => {
    const map = { pending: { bg: '#fff3cd', color: '#856404', label: '⏳ Pending' }, approved: { bg: '#d4edda', color: '#155724', label: '✓ Approved' }, rejected: { bg: '#f8d7da', color: '#721c24', label: '✕ Rejected' } };
    const s = map[status] || map.pending;
    return <span style={{ ...st.badge, background: s.bg, color: s.color }}>{s.label}</span>;
  };

  return (
    <div style={st.container}>
      <div style={st.header}>
        <h1 style={st.title}>Instructor Dashboard</h1>
        {tab === 'courses' && (
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} style={st.btn}>
            {showForm ? 'Cancel' : '+ New Course'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={st.tabs}>
        {[['courses', '📚 Courses'], ['requests', `📋 Requests${requests.length ? ` (${requests.length})` : ''}`], ['overview', '👥 Enrollment Overview']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ ...st.tabBtn, ...(tab === key ? st.tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {/* ── COURSES TAB ── */}
      {tab === 'courses' && (
        <>
          {showForm && (
            <form onSubmit={handleSubmit} style={st.form}>
              <h3>{editId ? 'Edit Course' : 'Create New Course'}</h3>
              <input style={st.input} placeholder="Course Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <textarea style={{ ...st.input, height: '100px' }} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              <select style={st.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input style={st.input} type="number" placeholder="Price (0 for free)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              <input style={st.input} placeholder="Thumbnail URL (optional)" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />
              <label style={st.checkLabel}>
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
                Publish Course
              </label>
              <button type="submit" style={st.btn}>{editId ? 'Update' : 'Create'} Course</button>
            </form>
          )}
          {lessonForm && (
            <form onSubmit={handleAddLesson} style={st.form}>
              <h3>Add Lesson</h3>
              <input style={st.input} placeholder="Lesson Title" value={lessonData.title} onChange={e => setLessonData({ ...lessonData, title: e.target.value })} required />
              <textarea style={{ ...st.input, height: '120px' }} placeholder="Lesson Content" value={lessonData.content} onChange={e => setLessonData({ ...lessonData, content: e.target.value })} required />
              <input style={st.input} placeholder="Video URL (optional)" value={lessonData.videoUrl} onChange={e => setLessonData({ ...lessonData, videoUrl: e.target.value })} />
              <input style={st.input} type="number" placeholder="Duration (minutes)" value={lessonData.duration} onChange={e => setLessonData({ ...lessonData, duration: e.target.value })} />
              <label style={st.fileLabel}>
                📄 Upload PDF Notes (optional)
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => setLessonData({ ...lessonData, _pdfFile: e.target.files[0] })} />
              </label>
              {lessonData._pdfFile && <span style={{ fontSize: '0.85rem', color: '#28a745' }}>✓ {lessonData._pdfFile.name}</span>}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={st.btn}>Add Lesson</button>
                <button type="button" onClick={() => setLessonForm(null)} style={st.cancelBtn}>Cancel</button>
              </div>
            </form>
          )}
          <div style={st.list}>
            {courses.length === 0 ? <p>No courses yet.</p> : courses.map(course => (
              <div key={course._id} style={st.card}>
                <div style={st.cardHeader}>
                  <div>
                    <h3 style={st.courseName}>{course.title}</h3>
                    <span style={st.catBadge}>{course.category}</span>
                    <span style={{ ...st.catBadge, background: course.published ? '#d4edda' : '#fff3cd', color: course.published ? '#155724' : '#856404' }}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div style={st.actions}>
                    <Link to={`/courses/${course._id}`} style={st.viewBtn}>View</Link>
                    <button onClick={() => handleEdit(course)} style={st.editBtn}>Edit</button>
                    <button onClick={() => { setLessonForm(course._id); setLessonData(emptyLesson); }} style={st.lessonBtn}>+ Lesson</button>
                    <button onClick={() => handleDelete(course._id)} style={st.deleteBtn}>Delete</button>
                  </div>
                </div>
                {course.lessons?.length > 0 && (
                  <div style={st.lessons}>
                    {course.lessons.map((lesson, i) => (
                      <div key={lesson._id} style={st.lessonRow}>
                        <span>{i + 1}. {lesson.title}</span>
                        {lesson.duration && <span style={st.duration}>{lesson.duration} min</span>}
                        {lesson.pdfUrl && <span style={st.pdfBadge}>📄 PDF</span>}
                        <button onClick={() => handleDeleteLesson(course._id, lesson._id)} style={st.deleteLessonBtn}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── REQUESTS TAB ── */}
      {tab === 'requests' && (
        <div style={st.list}>
          {requests.length === 0 ? <p style={st.empty}>No pending requests.</p> : requests.map(req => (
            <div key={req._id} style={st.requestCard}>
              <div>
                <strong style={st.studentName}>{req.student?.name}</strong>
                <span style={st.email}>{req.student?.email}</span>
                <p style={st.reqCourse}>📚 {req.course?.title}</p>
              </div>
              <div style={st.reqActions}>
                <button onClick={() => handleApproval(req._id, 'approved')} style={st.approveBtn}>✓ Approve</button>
                <button onClick={() => handleApproval(req._id, 'rejected')} style={st.rejectBtn}>✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div style={st.list}>
          {overview.length === 0 ? <p style={st.empty}>No courses found.</p> : overview.map(({ course, students }) => (
            <div key={course._id} style={st.card}>
              <div style={st.overviewHeader}>
                <h3 style={st.courseName}>{course.title}</h3>
                <span style={st.countBadge}>{students.length} student{students.length !== 1 ? 's' : ''}</span>
              </div>
              {students.length === 0 ? (
                <p style={st.noStudents}>No enrollments yet.</p>
              ) : (
                <table style={st.table}>
                  <thead>
                    <tr>
                      <th style={st.th}>Student</th>
                      <th style={st.th}>Email</th>
                      <th style={st.th}>Status</th>
                      <th style={st.th}>Progress</th>
                      <th style={st.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(e => (
                      <tr key={e._id} style={st.tr}>
                        <td style={st.td}>{e.student?.name}</td>
                        <td style={st.td}>{e.student?.email}</td>
                        <td style={st.td}>{statusBadge(e.status)}</td>
                        <td style={st.td}>{e.progress}%</td>
                        <td style={st.td}>
                          {e.status !== 'approved' && (
                            <button onClick={() => handleApproval(e._id, 'approved')} style={st.approveBtn}>✓ Approve</button>
                          )}
                          {e.status !== 'rejected' && (
                            <button onClick={() => handleApproval(e._id, 'rejected')} style={{ ...st.rejectBtn, marginLeft: '0.3rem' }}>✕ Revoke</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const st = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { margin: 0, color: '#1a1a2e' },
  btn: { background: '#e94560', color: '#fff', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { background: '#6c757d', color: '#fff', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0' },
  tabBtn: { padding: '0.6rem 1.2rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.95rem', color: '#666', borderBottom: '2px solid transparent', marginBottom: '-2px' },
  tabActive: { color: '#e94560', borderBottom: '2px solid #e94560', fontWeight: '600' },
  form: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  input: { padding: '0.7rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', resize: 'vertical' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  fileLabel: { display: 'inline-block', padding: '0.6rem 1rem', background: '#f0f0f0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', border: '1px dashed #ccc' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
  overviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  courseName: { margin: '0 0 0.5rem', color: '#1a1a2e' },
  catBadge: { fontSize: '0.75rem', background: '#f0f0f0', color: '#333', padding: '0.2rem 0.6rem', borderRadius: '4px', marginRight: '0.5rem' },
  countBadge: { background: '#1a1a2e', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  viewBtn: { background: '#1a1a2e', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem' },
  editBtn: { background: '#007bff', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  lessonBtn: { background: '#28a745', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  deleteBtn: { background: '#dc3545', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  lessons: { marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  lessonRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#555' },
  duration: { marginLeft: 'auto', color: '#888', fontSize: '0.8rem' },
  pdfBadge: { fontSize: '0.75rem', background: '#fff3cd', color: '#856404', padding: '0.15rem 0.5rem', borderRadius: '4px' },
  deleteLessonBtn: { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.9rem', padding: '0 0.3rem' },
  requestCard: { background: '#fff', border: '1px solid #ffe082', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  studentName: { fontSize: '1rem', color: '#1a1a2e' },
  email: { color: '#888', fontSize: '0.85rem', marginLeft: '0.5rem' },
  reqCourse: { margin: '0.3rem 0 0', color: '#555', fontSize: '0.9rem' },
  reqActions: { display: 'flex', gap: '0.5rem' },
  approveBtn: { background: '#28a745', color: '#fff', padding: '0.4rem 0.9rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  rejectBtn: { background: '#dc3545', color: '#fff', padding: '0.4rem 0.9rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  badge: { fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '600' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: { textAlign: 'left', padding: '0.6rem 0.8rem', background: '#f8f9fa', color: '#555', fontWeight: '600', borderBottom: '2px solid #eee' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '0.7rem 0.8rem', color: '#444', verticalAlign: 'middle' },
  noStudents: { color: '#aaa', fontSize: '0.9rem', margin: '0.5rem 0 0' },
  empty: { color: '#888', textAlign: 'center', padding: '2rem' },
};
