import React from 'react';
import { Monitor, Coffee, Code, Wrench, Zap, Terminal, Clock } from 'lucide-react';
import './Maintenance.css';

function App() {
  return (
    <div className="maintenance-container">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      {/* Floating elements */}
      <div className="floating-elements">
        <div className="float-icon icon-1"><Code size={20} /></div>
        <div className="float-icon icon-2"><Coffee size={18} /></div>
        <div className="float-icon icon-3"><Wrench size={16} /></div>
        <div className="float-icon icon-4"><Terminal size={22} /></div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Hero Section */}
        <div className="hero">
          <div className="status-badge">
            <div className="status-dot"></div>
            <span>Under Maintenance</span>
          </div>
          
          <h1 className="hero-title">
            <span className="word">Intern</span>
            <span className="word">at</span>
            <span className="word">Work</span>
          </h1>
          
          <p className="hero-desc">
            Our developer is crafting something amazing. We'll be back shortly with improvements.
          </p>
        </div>

        {/* Main Animation */}
        <div className="workspace">
          <div className="workspace-glow"></div>
          
          {/* Desk Setup */}
          <div className="desk-container">
            <div className="monitor-setup">
              <div className="monitor">
                <div className="screen">
                  <div className="screen-glow"></div>
                  <div className="terminal">
                    <div className="terminal-header">
                      <div className="terminal-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div className="terminal-title">terminal</div>
                    </div>
                    <div className="terminal-body">
                      <div className="code-line">
                        <span className="prompt">$</span>
                        <span className="text">npm run build</span>
                      </div>
                      <div className="code-line">
                        <span className="comment">// Optimizing performance...</span>
                      </div>
                      <div className="code-line">
                        <span className="keyword">const</span>
                        <span className="variable">magic</span>
                        <span className="operator">=</span>
                        <span className="string">'happening'</span>
                      </div>
                      <div className="code-line">
                        <span className="success">✓ Build successful</span>
                      </div>
                      <div className="cursor-line">
                        <span className="prompt">$</span>
                        <div className="cursor"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="monitor-stand"></div>
              </div>
            </div>

            {/* Developer Character */}
            <div className="developer">
              <div className="dev-head">
                <div className="dev-hair"></div>
                <div className="dev-face">
                  <div className="dev-eyes">
                    <div className="eye">
                      <div className="pupil"></div>
                    </div>
                    <div className="eye">
                      <div className="pupil"></div>
                    </div>
                  </div>
                  <div className="dev-glasses">
                    <div className="glass"></div>
                    <div className="glass"></div>
                    <div className="bridge"></div>
                  </div>
                </div>
              </div>
              <div className="dev-body">
                <div className="dev-arms">
                  <div className="arm left-arm"></div>
                  <div className="arm right-arm typing-arm"></div>
                </div>
              </div>
            </div>

            {/* Desk Items */}
            <div className="desk-items">
              <div className="coffee-cup">
                <div className="cup-body">
                  <div className="coffee-liquid"></div>
                  <div className="cup-handle"></div>
                </div>
                <div className="steam">
                  <div className="steam-line"></div>
                  <div className="steam-line"></div>
                  <div className="steam-line"></div>
                </div>
              </div>
              
              <div className="keyboard">
                <div className="key-rows">
                  <div className="key-row">
                    <div className="key active"></div>
                    <div className="key"></div>
                    <div className="key active"></div>
                    <div className="key"></div>
                  </div>
                  <div className="key-row">
                    <div className="key"></div>
                    <div className="key active"></div>
                    <div className="key"></div>
                    <div className="key"></div>
                  </div>
                  <div className="spacebar active"></div>
                </div>
              </div>
            </div>

            <div className="desk-surface"></div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-info">
            <Clock size={16} />
            <span>Estimated completion</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill"></div>
            <div className="progress-glow"></div>
          </div>
          <div className="progress-text">
            <span>Almost there...</span>
            <span className="progress-percent">78%</span>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="loading-indicator">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <p>Hang tight, we'll be back soon</p>
        </div>
      </div>
    </div>
  );
}

export default App;