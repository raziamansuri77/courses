import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  return (
    <div style={styles.card}>
      <div style={styles.thumb}>
        {course.thumbnail ? <img src={course.thumbnail} alt={course.title} style={styles.img} /> : <div style={styles.placeholder}>{course.category}</div>}
      </div>
      <div style={styles.body}>
        <span style={styles.category}>{course.category}</span>
        <h3 style={styles.title}>{course.title}</h3>
        <p style={styles.desc}>{course.description.substring(0, 80)}...</p>
        <div style={styles.footer}>
          <span style={styles.instructor}>by {course.instructor?.name}</span>
          <span style={styles.price}>{course.price === 0 ? 'Free' : `$${course.price}`}</span>
        </div>
        <Link to={`/courses/${course._id}`} style={styles.btn}>View Course</Link>
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' },
  thumb: { height: '160px', overflow: 'hidden' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e94560', fontSize: '1.2rem', fontWeight: 'bold' },
  body: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  category: { fontSize: '0.75rem', background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px', width: 'fit-content' },
  title: { margin: 0, fontSize: '1rem', fontWeight: '600' },
  desc: { margin: 0, color: '#666', fontSize: '0.85rem', flex: 1 },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  instructor: { fontSize: '0.8rem', color: '#888' },
  price: { fontWeight: 'bold', color: '#e94560' },
  btn: { background: '#e94560', color: '#fff', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', textAlign: 'center', marginTop: '0.5rem' },
};
