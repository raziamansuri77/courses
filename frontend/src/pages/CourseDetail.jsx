import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`).then(res => setCourse(res.data));
    if (user) api.get(`/enrollments/${id}`).then(res => setEnrollment(res.data)).catch(() => {});
    setLoading(false);
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      await api.post(`/enrollments/${id}`);
      navigate(`/learn/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally { setEnrolling(false); }
  };

  if (loading || !course) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>;

  return (
    <div>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.category}>{course.category}</span>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.desc}>{course.description}</p>
          <p style={styles.instructor}>Instructor: <strong>{course.instructor?.name}</strong></p>
        </div>
        <div style={styles.card}>
          <div style={styles.price}>{course.price === 0 ? 'Free' : `$${course.price}`}</div>
          {enrollment ? (
            <button onClick={() => navigate(`/learn/${id}`)} style={styles.btn}>Continue Learning</button>
          ) : (
            <button onClick={handleEnroll} disabled={enrolling} style={styles.btn}>{enrolling ? 'Enrolling...' : 'Enroll Now'}</button>
          )}
          <ul style={styles.features}>
            <li>✅ {course.lessons?.length || 0} lessons</li>
            <li>✅ Full lifetime access</li>
            <li>✅ Certificate of completion</li>
          </ul>
        </div>
      </div>
      <div style={styles.content}>
        <h2>Course Content</h2>
        {course.lessons?.length === 0 ? <p>No lessons yet.</p> : (
          <div style={styles.lessonList}>
            {course.lessons?.map((lesson, i) => (
              <div key={lesson._id} style={styles.lesson}>
                <span style={styles.lessonNum}>{i + 1}</span>
                <span>{lesson.title}</span>
                {lesson.duration && <span style={styles.duration}>{lesson.duration} min</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  hero: { background: '#1a1a2e', color: '#fff', padding: '3rem 2rem', display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' },
  heroContent: { maxWidth: '600px' },
  category: { background: '#e94560', padding: '0.2rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem' },
  title: { fontSize: '2rem', margin: '1rem 0' },
  desc: { color: '#ccc', lineHeight: 1.6 },
  instructor: { color: '#aaa' },
  card: { background: '#fff', color: '#333', padding: '1.5rem', borderRadius: '8px', width: '280px', height: 'fit-content' },
  price: { fontSize: '2rem', fontWeight: 'bold', color: '#e94560', marginBottom: '1rem' },
  btn: { width: '100%', background: '#e94560', color: '#fff', padding: '0.8rem', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: '600' },
  features: { listStyle: 'none', padding: 0, marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  content: { maxWidth: '800px', margin: '2rem auto', padding: '0 2rem' },
  lessonList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  lesson: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' },
  lessonNum: { background: '#1a1a2e', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 },
  duration: { marginLeft: 'auto', color: '#888', fontSize: '0.85rem' },
};
