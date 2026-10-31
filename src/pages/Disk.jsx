import React, { useState, useRef, useEffect } from 'react';
import {
  diskFCFS, diskSSTF, diskSCAN, diskCSCAN, diskLOOK
} from '../utils/diskAlgorithms';

const ALGORITHMS = {
  FCFS: diskFCFS,
  SSTF: diskSSTF,
  SCAN: diskSCAN,
  'C-SCAN': diskCSCAN,
  LOOK: diskLOOK,
};

const LINE_COLOR = '#3fb950';
const DOT_COLOR = '#e3b341';

export default function Disk() {
  const [requestInput, setRequestInput] = useState('98 183 37 122 14 124 65 67');
  const [headStart, setHeadStart] = useState(53);
  const [diskSize, setDiskSize] = useState(200);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [result, setResult] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const canvasRef = useRef(null);

  const parseRequests = (str) =>
    str.trim().split(/[\s,]+/).filter(Boolean).map(Number);

  const run = () => {
    const requests = parseRequests(requestInput);
    if (!requests.length) return;
    const fn = ALGORITHMS[algorithm];
    const r = fn(requests, headStart, diskSize);
    setResult(r);

    const compare = Object.entries(ALGORITHMS).map(([name, f]) => {
      const res = f(requests, headStart, diskSize);
      return { name, totalSeek: res.totalSeek };
    });
    setCompareData(compare);
  };

  // Draw head movement line chart on canvas
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const seq = result.sequence;
    const padL = 40, padR = 40, padT = 20, padB = 20;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const xOf = (i) => padL + (i / (seq.length - 1)) * chartW;
    const yOf = (val) => padT + ((diskSize - val) / diskSize) * chartH;

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Axis labels
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px Roboto Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('0', padL - 18, yOf(0) + 4);
    ctx.fillText(String(diskSize - 1), W - padR + 4, yOf(0) + 4);
    ctx.textAlign = 'right';

    // Horizontal guides
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach(t => {
      const y = padT + t * chartH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
    });

    // Line
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    seq.forEach((val, i) => {
      const x = xOf(i);
      const y = yOf(val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Dots + labels
    seq.forEach((val, i) => {
      const x = xOf(i);
      const y = yOf(val);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = DOT_COLOR;
      ctx.fill();

      // Label
      ctx.fillStyle = '#c9d1d9';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(val), x + 18, y + 3);
    });
  }, [result, diskSize]);

  const bestSeek = compareData
    ? Math.min(...compareData.map(c => c.totalSeek))
    : null;

  return (
    <div className="fade-in">
      {/* Input */}
      <div className="sim-box">
        <div className="input-row">
          <div className="input-group grow">
            <label>Request queue (cylinders)</label>
            <input
              type="text"
              value={requestInput}
              onChange={e => setRequestInput(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ minWidth: 80 }}>
            <label>Head start</label>
            <input
              type="number"
              min="0"
              value={headStart}
              onChange={e => setHeadStart(Number(e.target.value))}
            />
          </div>
          <div className="input-group" style={{ minWidth: 80 }}>
            <label>Disk size</label>
            <input
              type="number"
              min="1"
              value={diskSize}
              onChange={e => setDiskSize(Number(e.target.value))}
            />
          </div>
          <div className="input-group" style={{ minWidth: 100 }}>
            <label>Algorithm</label>
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              {Object.keys(ALGORITHMS).map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ justifyContent: 'flex-end' }}>
            <label style={{ opacity: 0 }}>Run</label>
            <button className="btn btn-run" onClick={run}>Run simulation</button>
          </div>
        </div>
        {(algorithm === 'SCAN' || algorithm === 'C-SCAN') && (
          <p className="note">
            SCAN and C-SCAN start moving toward higher cylinders. C-SCAN counts the return jump to cylinder 0.
          </p>
        )}
      </div>

      {/* Head Movement Chart */}
      {result && (
        <div className="sim-box">
          <h3>Head movement</h3>
          <canvas
            ref={canvasRef}
            width={900}
            height={320}
            style={{ width: '100%', height: 'auto', borderRadius: 6, display: 'block' }}
          />
          <div className="stats-row">
            <span>Total seek distance <span className="val" style={{ color: '#e3b341' }}>{result.totalSeek}</span></span>
            <span>Average per request <span className="val" style={{ color: '#e3b341' }}>
              {(result.totalSeek / parseRequests(requestInput).length).toFixed(1)}
            </span></span>
          </div>
        </div>
      )}

      {/* Compare */}
      {compareData && (
        <div className="sim-box">
          <h3>Compare all algorithms</h3>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Total seek</th>
              </tr>
            </thead>
            <tbody>
              {compareData.map(c => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td className={c.totalSeek === bestSeek ? 'best' : ''}>{c.totalSeek}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
