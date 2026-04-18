// pages/index.js

import { useEffect, useState } from 'react';

export default function Home() {
  const [repoInfo, setRepoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRepoInfo() {
      try {
        const response = await fetch('https://api.github.com/repos/OBS-Akuma/oskApi');
        if (!response.ok) throw new Error('Failed to fetch repo info');
        const data = await response.json();
        setRepoInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRepoInfo();
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#2563eb', borderBottom: '3px solid #2563eb', paddingBottom: '0.5rem' }}>
        oskApi - Kirka Skin Price API
      </h1>
      
      <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
          <strong>Created by:</strong> Akuma
        </p>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
          <strong>Data Source:</strong> BOLT Price List Data (Kirka Skins)
        </p>
        <p style={{ margin: '0', fontSize: '1.1rem' }}>
          <strong>Source Code:</strong> <a href="https://github.com/OBS-Akuma/oskApi" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>github.com/OBS-Akuma/oskApi</a>
        </p>
      </div>

      <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>GitHub Repository Info</h2>
        
        {loading && <p>Loading repository information...</p>}
        
        {error && <p style={{ color: '#dc2626' }}>Error loading repo info: {error}</p>}
        
        {repoInfo && (
          <div>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Repository:</strong> {repoInfo.full_name}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Description:</strong> {repoInfo.description || 'No description provided'}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Stars:</strong> {repoInfo.stargazers_count}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Forks:</strong> {repoInfo.forks_count}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Watchers:</strong> {repoInfo.watchers_count}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Open Issues:</strong> {repoInfo.open_issues_count}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Primary Language:</strong> {repoInfo.language}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Last Updated:</strong> {new Date(repoInfo.updated_at).toLocaleString()}
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Created:</strong> {new Date(repoInfo.created_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem' }}>API Endpoint</h2>
        <code style={{
          background: '#1e1e2e',
          color: '#c9d1d9',
          padding: '0.75rem',
          borderRadius: '6px',
          display: 'block',
          overflow: 'auto',
          fontSize: '0.9rem'
        }}>
          GET https://oskapi.vercel.app/api/changeLogs
        </code>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <h2 style={{ fontSize: '1.3rem' }}>How to Use</h2>
        <p>Simply make a GET request to the endpoint above. The API returns JSON data containing:</p>
        <ul>
          <li><code>summary</code> - Total changes, added/removed/modified skins count</li>
          <li><code>currentChanges</code> - List of all detected skin changes with old/new values</li>
          <li><code>recentChangelogs</code> - History of recent changes</li>
          <li><code>timestamp</code> - When the data was last updated</li>
        </ul>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Example Response</h2>
        <pre style={{
          background: '#1e1e2e',
          color: '#c9d1d9',
          padding: '1rem',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '0.8rem'
        }}>
{`{
  "success": true,
  "hasUpdates": true,
  "timestamp": "2026-04-18T17:30:38.871Z",
  "summary": {
    "oldTotal": 937,
    "newTotal": 940,
    "totalChanges": 119,
    "addedSkins": 6,
    "removedSkins": 2,
    "modifiedSkins": 111
  },
  "currentChanges": [...],
  "recentChangelogs": [...]
}`}
        </pre>
      </div>
    </div>
  );
}
