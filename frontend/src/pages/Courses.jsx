import { useState, useEffect } from 'react';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Photography'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    api.get('/courses', { params }).then(res => setCourses(res.data)).finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>All Courses</h1>
        <input style={styles.search} type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={styles.categories}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{ ...styles.catBtn, ...(category === c ? styles.catActive : {}) }}>{c}</button>
        ))}
      </div>
      {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
        <div style={styles.grid}>
          {courses.length === 0 ? <p>No courses found.</p> : courses.map(c => <CourseCard key={c._id} course={c} />)}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { margin: 0, color: '#1a1a2e' },
  search: { padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', width: '280px' },
  categories: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' },
  catBtn: { padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' },
  catActive: { background: '#1a1a2e', color: '#fff', border: '1px solid #1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
};
