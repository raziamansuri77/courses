import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PdfViewer({ proxyUrl }) {
  const [numPages, setNumPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfDocRef = useRef(null);
  const wrapperRef = useRef(null);
  const canvasRefs = useRef([]);
  const renderTasksRef = useRef([]);

  const renderAllPages = useCallback(async (doc, fullscreen) => {
    const scale = fullscreen ? 2.0 : 1.5;
    for (let i = 1; i <= doc.numPages; i++) {
      // cancel any in-progress render for this page
      if (renderTasksRef.current[i]) {
        renderTasksRef.current[i].cancel();
        renderTasksRef.current[i] = null;
      }
      try {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRefs.current[i];
        if (!canvas) continue;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const task = page.render({ canvasContext: canvas.getContext('2d'), viewport });
        renderTasksRef.current[i] = task;
        await task.promise;
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') console.error('PDF render error:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!proxyUrl) return;
    let cancelled = false;
    pdfjsLib.getDocument({ url: proxyUrl }).promise.then(doc => {
      if (cancelled) return;
      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
    }).catch(err => console.error('PDF load error:', err));
    return () => {
      cancelled = true;
      renderTasksRef.current.forEach(t => t?.cancel());
    };
  }, [proxyUrl]);

  // render all pages once canvases are mounted (numPages > 0)
  useEffect(() => {
    if (!numPages || !pdfDocRef.current) return;
    renderAllPages(pdfDocRef.current, isFullscreen);
  }, [numPages]); // eslint-disable-line react-hooks/exhaustive-deps

  // re-render at new scale on fullscreen toggle
  useEffect(() => {
    if (!pdfDocRef.current || !numPages) return;
    renderAllPages(pdfDocRef.current, isFullscreen);
  }, [isFullscreen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onFsChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      wrapperRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  if (!proxyUrl) return null;

  return (
    <div ref={wrapperRef} style={{ ...s.wrapper, ...(isFullscreen ? s.wrapperFs : {}) }}>
      <div style={s.header}>
        <span style={s.label}>📄 Lesson Notes {numPages > 0 && <span style={s.pageCount}>({numPages} pages)</span>}</span>
        <button style={s.fsBtn} onClick={toggleFullscreen}>
          {isFullscreen ? '✕ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
      </div>
      <div style={{ ...s.scrollContainer, ...(isFullscreen ? s.scrollContainerFs : {}) }}>
        {numPages === 0 && <p style={s.loading}>Loading PDF...</p>}
        {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNum => (
          <div key={pageNum} style={s.pageWrapper}>
            <canvas
              ref={el => { canvasRefs.current[pageNum] = el; }}
              style={s.canvas}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrapper: { marginBottom: '2rem', background: '#fffbf0', border: '1px solid #ffe082', borderRadius: '8px', overflow: 'hidden' },
  wrapperFs: { position: 'fixed', inset: 0, zIndex: 9999, borderRadius: 0, marginBottom: 0, display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1.2rem', borderBottom: '1px solid #ffe082', background: '#fffbf0', flexShrink: 0 },
  label: { fontWeight: '600', color: '#856404', fontSize: '0.95rem' },
  pageCount: { fontWeight: 'normal', color: '#aaa', fontSize: '0.85rem' },
  fsBtn: { background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  scrollContainer: { background: '#525659', padding: '1rem', maxHeight: '700px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  scrollContainerFs: { flex: 1, maxHeight: 'none' },
  pageWrapper: { width: '100%', display: 'flex', justifyContent: 'center' },
  canvas: { maxWidth: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.4)', display: 'block' },
  loading: { color: '#ccc', fontSize: '0.9rem' },
};
