/* src/utils/cpuAlgorithms.js */
/**
 * Process shape:
 * { pid: string|number, arrival: number, burst: number, priority?: number }
 */

/** FCFS scheduling */
export function fcfs(processes) {
  // Sort by arrival time
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  let time = 0;
  const schedule = [];
  for (const p of sorted) {
    const start = Math.max(time, p.arrival);
    const end = start + p.burst;
    schedule.push({ pid: p.pid, start, end, burst: p.burst });
    time = end;
  }
  return schedule;
}

/** SJF (non‑preemptive) */
export function sjfNonPreemptive(processes) {
  const remaining = [...processes];
  const schedule = [];
  let time = 0;
  while (remaining.length) {
    // pick arrived processes
    const arrived = remaining.filter(p => p.arrival <= time);
    const next = arrived.length
      ? arrived.reduce((a, b) => (a.burst < b.burst ? a : b))
      : null;
    if (!next) {
      // no process has arrived yet, jump time
      time = Math.min(...remaining.map(p => p.arrival));
      continue;
    }
    const idx = remaining.findIndex(p => p.pid === next.pid);
    remaining.splice(idx, 1);
    const start = Math.max(time, next.arrival);
    const end = start + next.burst;
    schedule.push({ pid: next.pid, start, end, burst: next.burst });
    time = end;
  }
  return schedule;
}

/** SJF (preemptive) – Shortest Remaining Time First */
export function sjfPreemptive(processes) {
  const procMap = processes.map(p => ({ ...p, remaining: p.burst }));
  const schedule = [];
  let time = 0;
  let current = null;
  while (procMap.some(p => p.remaining > 0)) {
    // get candidates that have arrived and still have remaining time
    const candidates = procMap.filter(p => p.arrival <= time && p.remaining > 0);
    if (!candidates.length) {
      time = Math.min(...procMap.filter(p => p.remaining > 0).map(p => p.arrival));
      continue;
    }
    // pick with smallest remaining
    const next = candidates.reduce((a, b) => (a.remaining < b.remaining ? a : b));
    if (current && current.pid !== next.pid) {
      // finish previous slice
      const last = schedule[schedule.length - 1];
      last.end = time;
    }
    if (!schedule.length || schedule[schedule.length - 1].pid !== next.pid) {
      schedule.push({ pid: next.pid, start: time, end: null, burst: null });
    }
    // execute 1 unit of time (we could use smallest quantum, here 1) – for simplicity use 1
    next.remaining -= 1;
    time += 1;
    current = next;
  }
  // close final slice
  const last = schedule[schedule.length - 1];
  if (last && last.end === null) last.end = time;
  // compute burst for each slice (optional). For visualization it's okay.
  return schedule;
}

/** Priority (non‑preemptive) */
export function priorityNonPreemptive(processes) {
  const remaining = [...processes];
  const schedule = [];
  let time = 0;
  while (remaining.length) {
    const arrived = remaining.filter(p => p.arrival <= time);
    const next = arrived.length
      ? arrived.reduce((a, b) => (a.priority < b.priority ? a : b))
      : null;
    if (!next) {
      time = Math.min(...remaining.map(p => p.arrival));
      continue;
    }
    const idx = remaining.findIndex(p => p.pid === next.pid);
    remaining.splice(idx, 1);
    const start = Math.max(time, next.arrival);
    const end = start + next.burst;
    schedule.push({ pid: next.pid, start, end, burst: next.burst });
    time = end;
  }
  return schedule;
}

/** Round Robin */
export function roundRobin(processes, quantum = 2) {
  const queue = [];
  const remaining = processes.map(p => ({ ...p, remaining: p.burst }));
  const schedule = [];
  let time = 0;
  while (remaining.some(p => p.remaining > 0) || queue.length) {
    // enqueue newly arrived processes
    for (const p of remaining) {
      if (!p.enqueued && p.arrival <= time && p.remaining > 0) {
        queue.push(p);
        p.enqueued = true;
      }
    }
    if (!queue.length) {
      time = Math.min(...remaining.filter(p => p.remaining > 0).map(p => p.arrival));
      continue;
    }
    const current = queue.shift();
    const exec = Math.min(quantum, current.remaining);
    const start = time;
    const end = start + exec;
    schedule.push({ pid: current.pid, start, end, burst: exec });
    current.remaining -= exec;
    time = end;
    // enqueue any newly arrived while we were executing
    for (const p of remaining) {
      if (!p.enqueued && p.arrival <= time && p.remaining > 0) {
        queue.push(p);
        p.enqueued = true;
      }
    }
    if (current.remaining > 0) {
      queue.push(current);
    }
  }
  return schedule;
}

/** Helper to compute metrics */
export function computeMetrics(schedule, processes) {
  const procMap = {};
  for (const p of processes) {
    procMap[p.pid] = { arrival: p.arrival, burst: p.burst };
  }
  const results = [];
  for (const s of schedule) {
    const wait = s.start - procMap[s.pid].arrival;
    const turnaround = s.end - procMap[s.pid].arrival;
    const response = s.start - procMap[s.pid].arrival; // same as wait for non‑preemptive
    results.push({ pid: s.pid, wait, turnaround, response, burst: procMap[s.pid].burst });
  }
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const waits = results.map(r => r.wait);
  const turnarounds = results.map(r => r.turnaround);
  const responses = results.map(r => r.response);
  return { results, averages: { wait: avg(waits), turnaround: avg(turnarounds), response: avg(responses) } };
}
