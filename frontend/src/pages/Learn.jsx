import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import PdfViewer from '../components/PdfViewer';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getPdfProxyUrl(pdfUrl) {
  const filename = pdfUrl?.split('/uploads/')[1];
  const token = localStorage.getItem('token');
  if (!filename || !token) return null;
  return `${API_BASE}/api/pdf/${filename}?token=${token}`;
}

export default function Learn() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    api.get(`/courses/${courseId}`).then(res => { setCourse(res.data); setActiveLesson(res.data.lessons[0]); });
    api.get(`/enrollments/${courseId}`).then(res => setEnrollment(res.data));
  }, [courseId]);

  const markComplete = async (lessonId) => {
    const { data } = await api.put(`/enrollments/${courseId}/progress`, { lessonId });
    setEnrollment(data);
  };

  const isCompleted = (lessonId) => enrollment?.completedLessons?.includes(lessonId);

  if (!course) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>{course.title}</h3>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${enrollment?.progress || 0}%` }} />
        </div>
        <p style={styles.progressText}>{enrollment?.progress || 0}% complete</p>
        <div style={styles.lessonList}>
          {course.lessons.map((lesson, i) => (
            <div key={lesson._id} onClick={() => setActiveLesson(lesson)}
              style={{ ...styles.lessonItem, ...(activeLesson?._id === lesson._id ? styles.activeLesson : {}), ...(isCompleted(lesson._id) ? styles.completedLesson : {}) }}>
              <span>{isCompleted(lesson._id) ? '✅' : `${i + 1}.`}</span>
              <span style={styles.lessonTitle}>{lesson.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.main}>
        {activeLesson ? (
          <>
            <h2 style={styles.lessonHeading}>{activeLesson.title}</h2>
            {activeLesson.videoUrl && (
              <div style={styles.videoWrapper}>
                <iframe src={activeLesson.videoUrl} style={styles.video} allowFullScreen title={activeLesson.title} />
              </div>
            )}
            <div style={styles.lessonContent}>{activeLesson.content}</div>
            {activeLesson.pdfUrl && getPdfProxyUrl(activeLesson.pdfUrl) && <PdfViewer proxyUrl={getPdfProxyUrl(activeLesson.pdfUrl)} />}
            {!isCompleted(activeLesson._id) && (
              <button onClick={() => markComplete(activeLesson._id)} style={styles.completeBtn}>Mark as Complete ✓</button>
            )}
          </>
        ) : <p>Select a lesson to start learning</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: 'calc(100vh - 64px)' },
  sidebar: { width: '300px', background: '#1a1a2e', color: '#fff', padding: '1.5rem', overflowY: 'auto', flexShrink: 0 },
  sidebarTitle: { fontSize: '1rem', marginBottom: '1rem', color: '#e94560' },
  progressBar: { background: '#333', borderRadius: '4px', height: '6px', marginBottom: '0.3rem' },
  progressFill: { background: '#e94560', height: '100%', borderRadius: '4px', transition: 'width 0.3s' },
  progressText: { fontSize: '0.8rem', color: '#aaa', marginBottom: '1rem' },
  lessonList: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  lessonItem: { display: 'flex', gap: '0.5rem', padding: '0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', alignItems: 'flex-start' },
  activeLesson: { background: '#e94560' },
  completedLesson: { opacity: 0.7 },
  lessonTitle: { flex: 1 },
  main: { flex: 1, padding: '2rem', overflowY: 'auto' },
  lessonHeading: { color: '#1a1a2e', marginBottom: '1.5rem' },
  videoWrapper: { marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', background: '#000' },
  video: { width: '100%', height: '400px', border: 'none' },
  lessonContent: { lineHeight: 1.8, color: '#444', marginBottom: '2rem', whiteSpace: 'pre-wrap' },
  completeBtn: { background: '#1a1a2e', color: '#fff', padding: '0.7rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
};
