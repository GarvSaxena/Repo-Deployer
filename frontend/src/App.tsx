import { useState, useEffect } from 'react';
import axios from 'axios';
import { Github, Rocket, CheckCircle2, ArrowRight } from 'lucide-react';

const API_URL = 'http://localhost:3000';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [deployId, setDeployId] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'deployed' | 'error'>('idle');

  const handleDeploy = async () => {
    if (!repoUrl) return;
    setStatus('uploading');
    try {
      const res = await axios.post(`${API_URL}/deploy`, { repoUrl });
      setDeployId(res.data.id);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (deployId && status !== 'deployed' && status !== 'error') {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/deploy/status?id=${deployId}`);
          if (res.data.status === 'deployed') {
            setStatus('deployed');
            clearInterval(interval);
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [deployId, status]);

  return (
    <div className="container">
      <div className="card">
        {status === 'idle' || status === 'error' ? (
          <>
            <div className="header">
              <h1>Deploy your repo</h1>
              <p>Enter a public GitHub URL to instantly deploy it to our global edge network.</p>
            </div>
            <div className="input-group">
              <div className="input-wrapper">
                <Github className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="https://github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
              </div>
              <button onClick={handleDeploy} disabled={!repoUrl}>
                <Rocket size={18} />
                Deploy Now
              </button>
              {status === 'error' && (
                <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>
                  Deployment failed. Please check the URL and try again.
                </p>
              )}
            </div>
          </>
        ) : status === 'uploading' ? (
          <div className="status-card">
            <div className="spinner"></div>
            <h2>Building Project</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Cloning repository, installing dependencies, and building...
            </p>
          </div>
        ) : (
          <div className="status-card">
            <CheckCircle2 className="success-icon" />
            <h2>Deployment Successful!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Your project is now live on our edge network.</p>
            
            <div className="url-box">
              <a href={`http://${deployId}.100xdevs.com:3001`} target="_blank" rel="noopener noreferrer">
                http://{deployId}.100xdevs.com:3001
              </a>
              <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
            
            <button 
              onClick={() => {
                setStatus('idle');
                setRepoUrl('');
                setDeployId('');
              }}
              style={{ marginTop: '24px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Deploy Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
