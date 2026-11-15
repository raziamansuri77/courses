import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Learn Without Limits</h1>
        <p style={styles.heroSub}>Explore thousands of courses taught by expert instructors</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/courses" style={styles.primaryBtn}>Browse Courses</Link>
          {!user && <Link to="/register" style={styles.secondaryBtn}>Start Teaching</Link>}
        </div>
      </section>
      <section style={styles.features}>
        {[
          { icon: '🎓', title: 'Expert Instructors', desc: 'Learn from industry professionals' },
          { icon: '📱', title: 'Learn Anywhere', desc: 'Access courses on any device' },
          { icon: '🏆', title: 'Track Progress', desc: 'Monitor your learning journey' },
        ].map(f => (
          <div key={f.title} style={styles.featureCard}>
            <div style={styles.featureIcon}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p style={{ color: '#666' }}>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

const styles = {
  hero: { background: 'linear-gradient(135deg, #1a1a2e, #16213e)', color: '#fff', padding: '5rem 2rem', textAlign: 'center' },
  heroTitle: { fontSize: '3rem', margin: '0 0 1rem', fontWeight: '800' },
  heroSub: { fontSize: '1.2rem', color: '#ccc', marginBottom: '2rem' },
  primaryBtn: { background: '#e94560', color: '#fff', padding: '0.8rem 2rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '600' },
  secondaryBtn: { background: 'transparent', color: '#fff', padding: '0.8rem 2rem', borderRadius: '4px', textDecoration: 'none', border: '2px solid #fff' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' },
  featureCard: { textAlign: 'center', padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  featureIcon: { fontSize: '2.5rem', marginBottom: '1rem' },
};
