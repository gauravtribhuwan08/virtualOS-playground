import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Animated mini Gantt preview (CPU) ─────────────────────── */
function MiniGantt() {
  const segments = [
    { label: 'P1', color: '#7c3aed' },
    { label: 'P3', color: '#0ea5e9' },
    { label: 'P2', color: '#10b981' },
    { label: 'P1', color: '#7c3aed' },
    { label: 'P4', color: '#f59e0b' },
    { label: 'P3', color: '#0ea5e9' },
  ];
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= segments.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), 380);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="mini-gantt">
      {segments.map((s, i) => (
        <div
          key={i}
          className="mini-gantt-seg"
          style={{
            background: s.color,
            opacity: i < visible ? 1 : 0,
            transform: i < visible ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}

/* ─── Animated mini memory frame preview ─────────────────────── */
function MiniMemory() {
  const steps = [
    [7, null, null],
    [7, 0, null],
    [7, 0, 1],
    [2, 0, 1],
    [2, 0, 3],
    [2, 4, 3],
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mini-memory">
      {steps[step].map((v, i) => (
        <div
          key={i}
          className={`mini-frame ${v !== null ? 'filled' : ''}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {v !== null ? v : '–'}
        </div>
      ))}
      <div className="mini-memory-label">
        Page refs: 7 0 1 2 0 3 0 4…
      </div>
    </div>
  );
}

/* ─── Animated disk seek preview ─────────────────────────────── */
function MiniDisk() {
  const points = [53, 98, 37, 14, 124, 65, 67];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % points.length), 600);
    return () => clearInterval(t);
  }, []);

  const maxTrack = 200;
  return (
    <div className="mini-disk">
      <div className="mini-disk-track">
        <div
          className="mini-disk-head"
          style={{ left: `${(points[idx] / maxTrack) * 100}%` }}
        />
        {points.slice(0, idx + 1).map((p, i) => (
          <div
            key={i}
            className="mini-disk-dot"
            style={{ left: `${(p / maxTrack) * 100}%`, opacity: i === idx ? 1 : 0.35 }}
          />
        ))}
      </div>
      <div className="mini-disk-seek">
        Cylinder: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{points[idx]}</span>
      </div>
    </div>
  );
}

/* ─── Feature cards data ─────────────────────────────────────── */
const features = [
  {
    path: '/cpu',
    icon: '⚡',
    title: 'CPU Scheduling',
    description:
      'Simulate FCFS, SJF, Round Robin, Priority and more. Visualize Gantt charts, compare wait times and turnaround times side by side.',
    tags: ['FCFS', 'SJF', 'Round Robin', 'Priority'],
    accent: '#7c3aed',
    preview: <MiniGantt />,
  },
  {
    path: '/memory',
    icon: '🧠',
    title: 'Memory Paging',
    description:
      'Run FIFO, LRU and Optimal page replacement algorithms. Track page faults, hits and hit ratios across every reference.',
    tags: ['FIFO', 'LRU', 'Optimal'],
    accent: '#0ea5e9',
    preview: <MiniMemory />,
  },
  {
    path: '/disk',
    icon: '💾',
    title: 'Disk Scheduling',
    description:
      'Animate the disk arm across FCFS, SSTF, SCAN, C-SCAN and LOOK. Measure total seek distance and efficiency.',
    tags: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK'],
    accent: '#10b981',
    preview: <MiniDisk />,
  },
];

/* ─── Particle canvas background ─────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;
    let particles = [];

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };

    const spawn = () => {
      particles = Array.from({ length: 55 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.4,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        color: ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)],
      }));
    };

    resize();
    spawn();
    window.addEventListener('resize', () => { resize(); spawn(); });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + '99';
        ctx.fill();
      });
      // draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139,148,158,${(1 - dist / 120) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" />;
}

/* ─── Typewriter effect ──────────────────────────────────────── */
function Typewriter({ texts, speed = 65, pause = 1800 }) {
  const [display, setDisplay] = useState('');
  const [tIdx, setTIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[tIdx];
    let t;
    if (!deleting && charIdx < current.length) {
      t = setTimeout(() => setCharIdx(c => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      t = setTimeout(() => setCharIdx(c => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setTIdx(i => (i + 1) % texts.length);
    }
    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(t);
  }, [charIdx, deleting, tIdx, texts, speed, pause]);

  return (
    <span className="typewriter">
      {display}
      <span className="typewriter-cursor">|</span>
    </span>
  );
}

/* ─── Stats ticker ───────────────────────────────────────────── */
function StatTicker({ end, suffix = '', label }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(end / 40);
        const t = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(t); }
          else setVal(start);
        }, 30);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);

  return (
    <div className="stat-ticker" ref={ref}>
      <span className="stat-num">{val}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ─── Main Home Component ────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <section className="hero">
        <ParticleCanvas />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Interactive OS Algorithm Simulator
          </div>
          <h1 className="hero-title">
            VirtualOS{' '}
            <span className="hero-gradient-text">Playground</span>
          </h1>
          <p className="hero-sub">
            <Typewriter
              texts={[
                'Visualize CPU scheduling algorithms…',
                'Simulate page replacement & memory…',
                'Animate disk seek strategies…',
                'Compare algorithms side by side…',
              ]}
            />
          </p>
          <div className="hero-cta-row">
            <button
              className="cta-btn cta-primary"
              id="start-cpu-btn"
              onClick={() => navigate('/cpu')}
            >
              <span>Start Simulating</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              className="cta-btn cta-secondary"
              id="learn-more-btn"
              onClick={() => document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </button>
          </div>
          <div className="hero-stats">
            <StatTicker end={3} label="Algorithm Categories" />
            <div className="stat-divider" />
            <StatTicker end={12} suffix="+" label="Algorithms Supported" />
            <div className="stat-divider" />
            <StatTicker end={100} suffix="%" label="Browser Native" />
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="features-section" id="features-section">
        <div className="section-header">
          <p className="section-eyebrow">What you can simulate</p>
          <h2 className="section-title">Three pillars of OS resource management</h2>
          <p className="section-desc">
            Pick a module, enter your own inputs, and watch algorithms run step-by-step
            with full visualizations and side-by-side comparisons.
          </p>
        </div>
        <div className="feature-cards">
          {features.map((f, i) => (
            <div
              key={f.path}
              className={`feature-card ${hoveredCard === i ? 'hovered' : ''}`}
              id={`feature-card-${i}`}
              style={{ '--accent': f.accent, animationDelay: `${i * 0.12}s` }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(f.path)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(f.path)}
            >
              <div className="card-glow" />
              <div className="card-icon-wrap">
                <span className="card-icon">{f.icon}</span>
              </div>
              <div className="card-body">
                <h3 className="card-title">{f.title}</h3>
                <p className="card-desc">{f.description}</p>
                <div className="card-tags">
                  {f.tags.map(t => (
                    <span key={t} className="card-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="card-preview">{f.preview}</div>
              <div className="card-footer">
                <span className="card-cta">Open simulator</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section">
        <div className="section-header">
          <p className="section-eyebrow">Getting started</p>
          <h2 className="section-title">Run a simulation in 3 steps</h2>
        </div>
        <div className="steps-row">
          {[
            { n: '01', title: 'Choose a module', desc: 'Select CPU Scheduling, Memory Paging, or Disk Scheduling from the navigation tabs.' },
            { n: '02', title: 'Enter your input', desc: 'Type in your own process list, page reference string, or disk request queue.' },
            { n: '03', title: 'Run & compare', desc: 'Hit "Run simulation" to visualize results. All algorithms run in parallel so you can compare them instantly.' },
          ].map((s, i) => (
            <div key={i} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-number">{s.n}</div>
              <h4 className="step-title">{s.title}</h4>
              <p className="step-desc">{s.desc}</p>
              {i < 2 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick launch ── */}
      <section className="quicklaunch-section">
        <div className="quicklaunch-card">
          <div className="ql-glow ql-glow-1" />
          <div className="ql-glow ql-glow-2" />
          <h2 className="ql-title">Ready to dive in?</h2>
          <p className="ql-sub">Choose your first simulator and start exploring OS concepts interactively.</p>
          <div className="ql-buttons">
            {features.map(f => (
              <button
                key={f.path}
                className="ql-btn"
                id={`ql-${f.path.replace('/', '')}-btn`}
                style={{ '--accent': f.accent }}
                onClick={() => navigate(f.path)}
              >
                <span className="ql-icon">{f.icon}</span>
                {f.title}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
