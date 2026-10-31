import React, { useState } from 'react';
import { fifo, lru, optimal } from '../utils/memoryAlgorithms';

const algMap = { FIFO: fifo, LRU: lru, Optimal: optimal };

export default function Memory() {
  const [refString, setRefString] = useState('7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1');
  const [frameCount, setFrameCount] = useState(3);
  const [algorithm, setAlgorithm] = useState('FIFO');
  const [result, setResult] = useState(null);
  const [compareData, setCompareData] = useState(null);

  const parseRefs = (str) =>
    str.trim().split(/[\s,]+/).filter(Boolean).map(Number);

  const run = () => {
    const refs = parseRefs(refString);
    if (!refs.length) return;

    const out = algMap[algorithm](refs, frameCount);
    setResult({ refs, frameCount, ...out });

    // Compare all
    const compare = Object.entries(algMap).map(([name, fn]) => {
      const r = fn(refs, frameCount);
      return {
        name,
        faults: r.faults,
        hits: r.hits,
        hitRatio: ((r.hits / refs.length) * 100).toFixed(1),
      };
    });
    setCompareData(compare);
  };

  const refs = result ? result.refs : [];
  const frames = result ? result.frames : [];
  const fc = result ? result.frameCount : frameCount;

  // Fix the frame state matrix: carry forward previous state on hits
  // The existing algorithm already does this; we just render result.frames[step][frame]
  // Each frames[i] is an array of frameCount values

  return (
    <div className="fade-in">
      {/* Input */}
      <div className="sim-box">
        <div className="input-row">
          <div className="input-group grow">
            <label>Page reference string (space separated)</label>
            <input
              type="text"
              value={refString}
              onChange={e => setRefString(e.target.value)}
              style={{ fontFamily: 'Roboto Mono, monospace' }}
            />
          </div>
          <div className="input-group" style={{ minWidth: 80 }}>
            <label>Frames</label>
            <input
              type="number"
              min="1"
              max="10"
              value={frameCount}
              onChange={e => setFrameCount(Number(e.target.value))}
            />
          </div>
          <div className="input-group" style={{ minWidth: 110 }}>
            <label>Algorithm</label>
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              {Object.keys(algMap).map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ justifyContent: 'flex-end' }}>
            <label style={{ opacity: 0 }}>Run</label>
            <button className="btn btn-run" onClick={run}>Run simulation</button>
          </div>
        </div>
      </div>

      {/* Frame Table */}
      {result && (
        <div className="sim-box">
          <h3>Frame table</h3>
          <div className="frame-table-wrap">
            <table className="frame-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingLeft: '0.8rem' }}>Page</th>
                  {refs.map((r, i) => (
                    <td key={i} style={{
                      color: result.faultHistory[i] ? '#f85149' : '#3fb950',
                      fontWeight: 700,
                      borderBottom: '1px solid #21262d',
                      background: '#1c2128',
                      padding: '0.4rem 0.5rem',
                    }}>
                      {r}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: fc }, (_, fi) => (
                  <tr key={fi}>
                    <td className="row-header">Frame {fi + 1}</td>
                    {refs.map((_, i) => (
                      <td key={i}>
                        {frames[i]?.[fi] !== null && frames[i]?.[fi] !== undefined
                          ? frames[i][fi]
                          : ''}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="row-header">Result</td>
                  {result.faultHistory.map((isFault, i) => (
                    <td key={i} style={{ padding: '0.35rem 0.4rem' }}>
                      {isFault
                        ? <span className="badge-fault">fault</span>
                        : <span className="badge-hit">hit</span>
                      }
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="stats-row">
            <span>Page faults <span className="val" style={{ color: '#f85149' }}>{result.faults}</span></span>
            <span>Hits <span className="val">{result.hits}</span></span>
            <span>Hit ratio <span className="val">{((result.hits / refs.length) * 100).toFixed(1)}%</span></span>
          </div>
        </div>
      )}

      {/* Compare */}
      {compareData && (
        <div className="sim-box">
          <h3>Compare algorithms</h3>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Page faults</th>
                <th>Hits</th>
                <th>Hit ratio</th>
              </tr>
            </thead>
            <tbody>
              {compareData.map(c => {
                const bestFaults = Math.min(...compareData.map(x => x.faults));
                return (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td className={c.faults === bestFaults ? 'best' : ''}>{c.faults}</td>
                    <td>{c.hits}</td>
                    <td className={c.faults === bestFaults ? 'best' : ''}>{c.hitRatio}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
