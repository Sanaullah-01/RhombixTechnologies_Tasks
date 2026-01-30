import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/photos');
      setPhotos(res.data);
    } catch (err) {
      console.error("Error fetching photos", err);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);

    try {
      const { data } = await axios.get('http://localhost:5000/api/upload-url');
      await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      alert("Upload successful!");
      setFile(null);
      fetchPhotos();
    } catch (err) {
      alert("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoUrl) => {
    const key = photoUrl.split('/').pop();
    if (!window.confirm("Are you sure you want to delete this photo?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/photos/${key}`);
      alert("Photo deleted!");
      fetchPhotos();
    } catch (err) {
      alert("Delete failed!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.glassCard}>
          <header>
            <h1 style={styles.title}>Cloud Photo Gallery</h1>
            <p style={styles.subtitle}>Rhombix Technologies Internship - Task 1</p>
          </header>

          <div style={styles.uploadSection}>
            <label style={styles.fileLabel}>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])} 
                style={styles.hiddenInput}
              />
              <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '5px' }}>📁</span>
              {file ? file.name : "Click to select or drag an image"}
            </label>
            
            <button 
              onClick={handleUpload} 
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Uploading to AWS...' : 'Upload to Cloud'}
            </button>
          </div>
        </div>

        <div style={styles.gallerySection}>
           <h2 style={styles.galleryTitle}>Your Cloud Collection</h2>
           <div style={styles.galleryGrid}>
            {photos.map((url, index) => (
              <div key={index} style={styles.imageCard}>
                <img src={url} alt="Gallery item" style={styles.image} />
                <button 
                  onClick={() => handleDelete(url)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    margin: 0,
    padding: 0,
    overflowX: 'hidden',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 5%',
    width: '100%',
    boxSizing: 'border-box',
  },
  glassCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    marginBottom: '60px',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: '900',
    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitFillColor: 'transparent',
    margin: '0 0 10px 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  uploadSection: {
    marginTop: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  hiddenInput: {
    display: 'none',
  },
  fileLabel: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    border: '2px dashed #334155',
    borderRadius: '16px',
    padding: '30px',
    cursor: 'pointer',
    color: '#94a3b8',
    transition: 'all 0.3s ease',
    display: 'block',
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
    transition: 'all 0.3s ease',
  },
  gallerySection: {
    width: '100%',
  },
  galleryTitle: {
    fontSize: '1.8rem',
    marginBottom: '30px',
    textAlign: 'left',
    borderLeft: '4px solid #3b82f6',
    paddingLeft: '15px',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px',
    width: '100%',
  },
  imageCard: {
    position: 'relative', // Added to contain the absolute Delete button
    borderRadius: '20px',
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    height: '250px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'scale 0.5s ease',
  },
  deleteBtn: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    transition: 'background 0.3s ease',
  },
};

export default App;