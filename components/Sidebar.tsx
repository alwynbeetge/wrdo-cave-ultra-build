
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    description: 'Main dashboard overview',
  },
  {
    path: '/chat',
    label: 'AI Chat',
    icon: '💬',
    description: 'Chat with AI assistant',
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: '📈',
    description: 'View analytics and insights',
  },
  {
    path: '/hume',
    label: 'Emotion Analysis',
    icon: '😊',
    description: 'Hume.ai emotion analysis',
  },
  {
    path: '/voice',
    label: 'Voice Synthesis',
    icon: '🔊',
    description: 'ElevenLabs voice synthesis',
  },
  {
    path: '/logs',
    label: 'Logs',
    icon: '📋',
    description: 'System logs and monitoring',
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: '⚙️',
    description: 'Application settings',
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const router = useRouter();
  const [activeRoute, setActiveRoute] = useState<string>('');

  useEffect(() => {
    setActiveRoute(router.pathname);
  }, [router.pathname]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">WRDO</h2>
        {onToggle && (
          <button
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label="Toggle sidebar"
          >
            {isOpen ? '←' : '→'}
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <div key={item.path} className="nav-item-container">
            <Link href={item.path} passHref>
              <button
                className={`nav-item ${activeRoute === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                {isOpen && (
                  <span className="nav-label">{item.label}</span>
                )}
              </button>
            </Link>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className="status-dot healthy"></span>
          {isOpen && <span className="status-text">System Healthy</span>}
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          background: #1a1a1a;
          color: white;
          transition: width 0.3s ease;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .sidebar.open {
          width: 250px;
        }

        .sidebar.closed {
          width: 60px;
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
        }

        .sidebar-toggle:hover {
          background: #333;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item-container {
          margin-bottom: 0.5rem;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: white;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s ease;
          text-decoration: none;
        }

        .nav-item:hover {
          background: #333;
        }

        .nav-item.active {
          background: #007acc;
        }

        .nav-icon {
          font-size: 1.2rem;
          margin-right: 0.75rem;
          min-width: 1.5rem;
        }

        .nav-label {
          font-size: 0.9rem;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #333;
        }

        .status-indicator {
          display: flex;
          align-items: center;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .status-dot.healthy {
          background: #4caf50;
        }

        .status-text {
          font-size: 0.8rem;
          color: #ccc;
        }

        @media (max-width: 768px) {
          .sidebar.open {
            width: 200px;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
