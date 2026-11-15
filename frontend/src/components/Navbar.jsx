import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>LearnHub</Link>
      <div style={styles.links}>
        <Link to="/courses" style={styles.link}>Courses</Link>
        {user ? (
          <>
            {user.role === 'instructor' ? (
              <Link to="/instructor" style={styles.link}>Dashboard</Link>
            ) : (
              <Link to="/my-learning" style={styles.link}>My Learning</Link>
            )}
            <span style={styles.user}>{user.name}</span>
            <button onClick={handleLogout} style={styles.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.btnLink}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1a1a2e', color: '#fff' },
  brand: { fontSize: '1.5rem', fontWeight: 'bold', color: '#e94560', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  link: { color: '#ccc', textDecoration: 'none' },
  user: { color: '#e94560' },
  btn: { background: 'transparent', border: '1px solid #e94560', color: '#e94560', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer' },
  btnLink: { background: '#e94560', color: '#fff', padding: '0.4rem 1rem', borderRadius: '4px', textDecoration: 'none' },
};
