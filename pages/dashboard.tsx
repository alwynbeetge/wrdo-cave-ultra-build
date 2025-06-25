
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    [key: string]: {
      status: string;
      message?: string;
    };
  };
}

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ 
        marginLeft: '250px', 
        padding: '2rem', 
        flex: 1,
        backgroundColor: '#f5f5f5'
      }}>
        <h1>WRDO Dashboard</h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2>System Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : healthStatus ? (
            <div>
              <p>
                <strong>Overall Status:</strong> 
                <span style={{ 
                  color: healthStatus.status === 'healthy' ? 'green' : 'red',
                  marginLeft: '0.5rem'
                }}>
                  {healthStatus.status.toUpperCase()}
                </span>
              </p>
              <p><strong>Last Updated:</strong> {new Date(healthStatus.timestamp).toLocaleString()}</p>
              
              <h3>Services</h3>
              <ul>
                {Object.entries(healthStatus.services).map(([service, info]) => (
                  <li key={service} style={{ marginBottom: '0.5rem' }}>
                    <strong>{service}:</strong> 
                    <span style={{ 
                      color: info.status === 'up' ? 'green' : 'red',
                      marginLeft: '0.5rem'
                    }}>
                      {info.status.toUpperCase()}
                    </span>
                    {info.message && (
                      <span style={{ color: 'orange', marginLeft: '0.5rem' }}>
                        ({info.message})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ color: 'red' }}>Failed to load system status</p>
          )}
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button style={{ 
              padding: '1rem', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: '#007bff', 
              color: 'white',
              cursor: 'pointer'
            }}>
              Test AI Chat
            </button>
            <button style={{ 
              padding: '1rem', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: '#28a745', 
              color: 'white',
              cursor: 'pointer'
            }}>
              Analyze Emotions
            </button>
            <button style={{ 
              padding: '1rem', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: '#ffc107', 
              color: 'black',
              cursor: 'pointer'
            }}>
              Synthesize Voice
            </button>
            <button 
              onClick={fetchHealthStatus}
              style={{ 
                padding: '1rem', 
                border: 'none', 
                borderRadius: '4px', 
                backgroundColor: '#6c757d', 
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Refresh Status
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
