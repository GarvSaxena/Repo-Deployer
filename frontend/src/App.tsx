import { useState, useEffect } from 'react';
import axios from 'axios';
import { Github, Rocket, CheckCircle2, ArrowRight } from 'lucide-react';

const API_URL = 'http://localhost:3000';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [deployId, setDeployId] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'deployed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const handleDeploy = async () => {
    if (!repoUrl) return;
    setStatus('uploading');
    setProgress(0);
    setLogs([]);
    
    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress(p => (p < 40 ? p + 2 : p));
    }, 500);

    try {
      const res = await axios.post(`${API_URL}/deploy`, { repoUrl });
      clearInterval(uploadInterval);
      setProgress(50);
      setDeployId(res.data.id);
    } catch (error) {
      clearInterval(uploadInterval);
      console.error(error);
      setStatus('error');
    }
  };

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval>;
    let progressInterval: ReturnType<typeof setInterval>;
    let logsInterval: ReturnType<typeof setInterval>;
    
    if (deployId && status === 'uploading') {
      // Simulate build progress
      progressInterval = setInterval(() => {
        setProgress(p => (p < 95 ? p + 1 : p));
      }, 500);

      logsInterval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/deploy/logs?id=${deployId}`);
          if (res.data.logs) {
            setLogs(res.data.logs);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);

      pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_URL}/deploy/status?id=${deployId}`);
          if (res.data.status === 'deployed') {
            setProgress(100);
            clearInterval(pollInterval);
            clearInterval(progressInterval);
            clearInterval(logsInterval);
            
            // Final log fetch to get 100% logs
            const logRes = await axios.get(`${API_URL}/deploy/logs?id=${deployId}`);
            if (logRes.data.logs) setLogs(logRes.data.logs);

            setTimeout(() => setStatus('deployed'), 500);
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => {
      clearInterval(pollInterval);
      clearInterval(progressInterval);
      clearInterval(logsInterval);
    };
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
            <h2>Building Project</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Cloning repository, installing dependencies, and building...
            </p>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="progress-text">{progress}%</p>
            
            <div className="terminal">
              {logs.length === 0 && <span style={{color: '#666'}}>Waiting for logs...</span>}
              {logs.map((log, index) => (
                <div key={index} className="log-line">
                  <span className="log-prefix">~</span> {log}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="status-card">
            <CheckCircle2 className="success-icon" />
            <h2>Deployment Successful!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Your project is now live on our edge network.</p>
            
            <div className="url-box">
              <a href={`http://${deployId}.lvh.me:3001`} target="_blank" rel="noopener noreferrer">
                http://{deployId}.lvh.me:3001
              </a>
              <ArrowRight size={20} style={{ color: 'var(--text-secondary)' }} />
            </div>
            
            <button 
              onClick={() => {
                setStatus('idle');
                setRepoUrl('');
                setDeployId('');
                setProgress(0);
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
