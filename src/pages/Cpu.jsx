import React, { useState } from 'react';
import {
  fcfs,
  sjfNonPreemptive,
  sjfPreemptive,
  priorityNonPreemptive,
  roundRobin,
} from '../utils/cpuAlgorithms';

// Pastel palette for Gantt segments
const COLORS = [
  '#238636', '#da3633', '#388bfd', '#a371f7', '#e3b341',
  '#3fb950', '#f78166', '#79c0ff', '#d2a8ff', '#ffa657',
  '#56d364', '#ff7b72', '#58a6ff', '#d29922', '#bc8cff',
];
const getColor = (idx) => COLORS[idx % COLORS.length];

// Generate a random set of processes
function randomProcesses(n = 5) {
  return Array.from({ length: n }, (_, i) => ({
    pid: i,
    arrival: i,
    burst: Math.floor(Math.random() * 9) + 1,
    priority: Math.floor(Math.random() * 5) + 1,
  }));
}

// Full metrics including completion time
function computeFullMetrics(schedule, processes) {
  const completionMap = {};
  const firstStartMap = {};
  for (const s of schedule) {
    if (firstStartMap[s.pid] === undefined) firstStartMap[s.pid] = s.start;
    completionMap[s.pid] = s.end;
  }
  const procMap = {};
  for (const p of processes) procMap[p.pid] = p;

  const results = Object.keys(completionMap).map((pid) => {
    const p = procMap[pid];
    const completion = completionMap[pid];
    const turnaround = completion - p.arrival;
    const waiting = turnaround - p.burst;
    const response = firstStartMap[pid] - p.arrival;
    return {
      pid: Number(pid),
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      completion,
      turnaround,
      waiting,
      response,
    };
  });
  results.sort((a, b) => a.pid - b.pid);

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    results,
    avgWaiting: avg(results.map((r) => r.waiting)),
    avgTurnaround: avg(results.map((r) => r.turnaround)),
    avgResponse: avg(results.map((r) => r.response)),
  };
}

const ALGORITHMS = {
  FCFS: (p) => fcfs(p),
  SJF: (p) => sjfNonPreemptive(p),
  SRTF: (p) => sjfPreemptive(p),
  Priority: (p) => priorityNonPreemptive(p),
  'Round Robin': (p, q) => roundRobin(p, q),
};

const DEFAULT_PROCESSES = [
  { pid: 0, arrival: 0, burst: 8, priority: 3 },
  { pid: 1, arrival: 1, burst: 4, priority: 1 },
  { pid: 2, arrival: 2, burst: 9, priority: 4 },
  { pid: 3, arrival: 3, burst: 5, priority: 2 },
  { pid: 4, arrival: 4, burst: 2, priority: 5 },
];

export default function Cpu() {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES);
  const [algorithm, setAlgorithm] = useState('FCFS');
  const [quantum, setQuantum] = useState(3);
  const [schedule, setSchedule] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [compareData, setCompareData] = useState(null);

  // ── Process table helpers ───────────────────────────────
  const updateField = (pid, field, value) => {
    setProcesses((prev) =>
      prev.map((p) => (p.pid === pid ? { ...p, [field]: Number(value) } : p))
    );
  };

  const addProcess = () => {
    const newPid = processes.length
      ? Math.max(...processes.map((p) => p.pid)) + 1
      : 0;
    setProcesses((prev) => [
      ...prev,
      { pid: newPid, arrival: 0, burst: 1, priority: 1 },
    ]);
  };

  const removeProcess = (pid) =>
    setProcesses((prev) => prev.filter((p) => p.pid !== pid));

  const handleRandom = () => setProcesses(randomProcesses(5));

  // ── Run simulation ─────────────────────────────────────
  const runSimulation = () => {
    if (!processes.length) return;
    try {
      const algoFn = ALGORITHMS[algorithm];
      const result =
        algorithm === 'Round Robin'
          ? algoFn(processes, quantum)
          : algoFn(processes);

      setSchedule(result);
      setMetrics(computeFullMetrics(result, processes));

      const compare = Object.entries(ALGORITHMS).map(([name, fn]) => {
        try {
          const r = name === 'Round Robin' ? fn(processes, quantum) : fn(processes);
          const m = computeFullMetrics(r, processes);
          return { name, avgWaiting: m.avgWaiting, avgTurnaround: m.avgTurnaround };
        } catch {
          return { name, avgWaiting: null, avgTurnaround: null };
        }
      });
      setCompareData(compare);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Gantt helpers ──────────────────────────────────────
  const totalTime = schedule ? Math.max(...schedule.map((s) => s.end)) : 0;
  const pidColorMap = {};
  if (schedule) {
    const seen = [];
    schedule.forEach((s) => {
      if (!pidColorMap[s.pid]) {
        pidColorMap[s.pid] = getColor(seen.length);
        seen.push(s.pid);
      }
    });
  }

  const bestWaiting = compareData
    ? Math.min(...compareData.filter((c) => c.avgWaiting !== null).map((c) => c.avgWaiting))
    : null;
  const bestTurnaround = compareData
    ? Math.min(...compareData.filter((c) => c.avgTurnaround !== null).map((c) => c.avgTurnaround))
    : null;

  return (
    <div className="fade-in">

      {/* ── Process Input Table ─────────────────────────── */}
      <div className="sim-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>Processes</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handleRandom}>Random</button>
            <button className="btn btn-secondary" onClick={addProcess}>+ Add row</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="sim-table" style={{ minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ width: 50 }}>PID</th>
                <th>Arrival Time</th>
                <th>Burst Time</th>
                <th>Priority</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p) => (
                <tr key={p.pid}>
                  <td style={{ color: pidColorMap[p.pid] || '#e6edf3', fontWeight: 700 }}>
                    P{p.pid}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={p.arrival}
                      onChange={(e) => updateField(p.pid, 'arrival', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={p.burst}
                      onChange={(e) => updateField(p.pid, 'burst', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={p.priority}
                      onChange={(e) => updateField(p.pid, 'priority', e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => removeProcess(p.pid)}
                      title="Remove process"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Algorithm + Quantum + Run */}
        <div className="input-row" style={{ marginTop: '1rem', marginBottom: 0 }}>
          <div className="input-group" style={{ minWidth: 140 }}>
            <label>Algorithm</label>
            <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
              {Object.keys(ALGORITHMS).map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>

          {algorithm === 'Round Robin' && (
            <div className="input-group" style={{ minWidth: 100 }}>
              <label>Time quantum</label>
              <input
                type="number"
                min="1"
                value={quantum}
                onChange={(e) => setQuantum(Number(e.target.value))}
              />
            </div>
          )}

          <div className="input-group" style={{ justifyContent: 'flex-end' }}>
            <label style={{ opacity: 0, pointerEvents: 'none' }}>Run</label>
            <button className="btn btn-run" onClick={runSimulation}>
              Run simulation
            </button>
          </div>
        </div>
      </div>

      {/* ── Gantt Chart ─────────────────────────────────── */}
      {schedule && (
        <div className="sim-box">
          <h3>Gantt chart</h3>
          <div className="gantt-wrap">
            <div className="gantt-bar-row">
              {schedule.map((s, i) => {
                const widthPct = ((s.end - s.start) / totalTime) * 100;
                return (
                  <div
                    key={i}
                    className="gantt-segment"
                    title={`P${s.pid}: ${s.start}–${s.end}`}
                    style={{ width: `${widthPct}%`, background: pidColorMap[s.pid] }}
                  >
                    P{s.pid}
                  </div>
                );
              })}
            </div>
            {/* Tick marks */}
            <div style={{ position: 'relative', height: 20 }}>
              {schedule.map((s, i) => (
                <span
                  key={`t${i}`}
                  className="gantt-tick"
                  style={{ left: `${(s.start / totalTime) * 100}%` }}
                >
                  {s.start}
                </span>
              ))}
              <span className="gantt-tick" style={{ left: '100%' }}>
                {totalTime}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Per-process Results ──────────────────────────── */}
      {metrics && (
        <div className="sim-box">
          <h3>Per-process results</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="sim-table">
              <thead>
                <tr>
                  <th>Process</th>
                  <th>Arrival</th>
                  <th>Burst</th>
                  <th>Priority</th>
                  <th>Completion</th>
                  <th>Turnaround</th>
                  <th>Waiting</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                {metrics.results.map((r) => (
                  <tr key={r.pid}>
                    <td style={{ color: pidColorMap[r.pid], fontWeight: 700 }}>P{r.pid}</td>
                    <td>{r.arrival}</td>
                    <td>{r.burst}</td>
                    <td>{r.priority}</td>
                    <td>{r.completion}</td>
                    <td>{r.turnaround}</td>
                    <td>{r.waiting}</td>
                    <td>{r.response}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stats-row">
            <span>Avg waiting <span className="val">{metrics.avgWaiting.toFixed(2)}</span></span>
            <span>Avg turnaround <span className="val">{metrics.avgTurnaround.toFixed(2)}</span></span>
            <span>Avg response <span className="val">{metrics.avgResponse.toFixed(2)}</span></span>
          </div>
        </div>
      )}

      {/* ── Compare All Algorithms ───────────────────────── */}
      {compareData && (
        <div className="sim-box">
          <h3>Compare all algorithms</h3>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Avg waiting</th>
                <th>Avg turnaround</th>
              </tr>
            </thead>
            <tbody>
              {compareData.map((c) => (
                <tr key={c.name}>
                  <td>{c.name}</td>
                  <td className={c.avgWaiting === bestWaiting ? 'best' : ''}>
                    {c.avgWaiting !== null ? c.avgWaiting.toFixed(2) : '—'}
                  </td>
                  <td className={c.avgTurnaround === bestTurnaround ? 'best' : ''}>
                    {c.avgTurnaround !== null ? c.avgTurnaround.toFixed(2) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
