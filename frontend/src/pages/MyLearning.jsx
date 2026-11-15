import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my/all').then(res => setEnrollments(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Learning</h1>
      {enrollments.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" style={styles.btn}>Browse Courses</Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {enrollments.map(({ course, progress, _id }) => (
            <div key={_id} style={styles.card}>
              <div style={styles.cardThumb}>{course?.category}</div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{course?.title}</h3>
                <p style={styles.cardInstructor}>by {course?.instructor?.name}</p>
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
                <p style={styles.progressText}>{progress}% complete</p>
                <Link to={`/learn/${course?._id}`} style={styles.continueBtn}>
                  {progress === 0 ? 'Start Learning' : progress === 100 ? 'Review Course' : 'Continue'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  title: { color: '#1a1a2e', marginBottom: '2rem' },
  empty: { textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  btn: { background: '#e94560', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '4px', textDecoration: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  card: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardThumb: { height: '120px', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e94560', fontWeight: 'bold', fontSize: '1.1rem' },
  cardBody: { padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cardTitle: { margin: 0, fontSize: '1rem', color: '#1a1a2e' },
  cardInstructor: { margin: 0, color: '#888', fontSize: '0.85rem' },
  progressBar: { background: '#eee', borderRadius: '4px', height: '6px' },
  progressFill: { background: '#e94560', height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  progressText: { margin: 0, fontSize: '0.8rem', color: '#888' },
  continueBtn: { background: '#1a1a2e', color: '#fff', padding: '0.6rem', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', marginTop: '0.5rem' },
};
