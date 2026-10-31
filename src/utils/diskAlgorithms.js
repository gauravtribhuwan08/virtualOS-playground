// src/utils/diskAlgorithms.js

/** FCFS disk scheduling */
export function diskFCFS(requests, head) {
  const order = [...requests];
  let totalSeek = 0;
  let pos = head;
  const sequence = [head];
  for (const r of order) {
    totalSeek += Math.abs(r - pos);
    pos = r;
    sequence.push(r);
  }
  return { sequence, totalSeek, order };
}

/** SSTF – Shortest Seek Time First */
export function diskSSTF(requests, head) {
  const remaining = [...requests];
  let pos = head;
  let totalSeek = 0;
  const sequence = [head];
  const order = [];
  while (remaining.length) {
    const closest = remaining.reduce((a, b) =>
      Math.abs(a - pos) <= Math.abs(b - pos) ? a : b
    );
    const idx = remaining.indexOf(closest);
    remaining.splice(idx, 1);
    totalSeek += Math.abs(closest - pos);
    pos = closest;
    sequence.push(closest);
    order.push(closest);
  }
  return { sequence, totalSeek, order };
}

/** SCAN */
export function diskSCAN(requests, head, diskSize = 200) {
  const sorted = [...requests].sort((a, b) => a - b);
  const left = sorted.filter(r => r < head).reverse();
  const right = sorted.filter(r => r >= head);
  let pos = head;
  let totalSeek = 0;
  const sequence = [head];
  const order = [];
  // Move right first
  for (const r of right) {
    totalSeek += Math.abs(r - pos);
    pos = r;
    sequence.push(r);
    order.push(r);
  }
  // Go to end
  if (right.length) {
    totalSeek += Math.abs((diskSize - 1) - pos);
    pos = diskSize - 1;
    sequence.push(pos);
  }
  for (const r of left) {
    totalSeek += Math.abs(r - pos);
    pos = r;
    sequence.push(r);
    order.push(r);
  }
  return { sequence, totalSeek, order };
}

/** C-SCAN */
export function diskCSCAN(requests, head, diskSize = 200) {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter(r => r >= head);
  const left = sorted.filter(r => r < head);
  let pos = head;
  let totalSeek = 0;
  const sequence = [head];
  const order = [];
  for (const r of right) {
    totalSeek += Math.abs(r - pos);
    pos = r;
    sequence.push(r);
    order.push(r);
  }
  // jump to 0
  totalSeek += Math.abs((diskSize - 1) - pos) + (diskSize - 1);
  pos = 0;
  sequence.push(diskSize - 1, 0);
  for (const r of left) {
    totalSeek += Math.abs(r - pos);
    pos = r;
    sequence.push(r);
    order.push(r);
  }
  return { sequence, totalSeek, order };
}

/** LOOK */
export function diskLOOK(requests, head) {
  const sorted = [...requests].sort((a, b) => a - b);
  const left = sorted.filter(r => r < head).reverse();
  const right = sorted.filter(r => r >= head);
  let pos = head;
  let totalSeek = 0;
  const sequence = [head];
  const order = [];
  for (const r of right) {
    totalSeek += Math.abs(r - pos);
    pos = r;
    sequence.push(r);
    order.push(r);
  }
  for (const r of left) {
    totalSeek += Math.abs(r - pos);
    pos = r;
    sequence.push(r);
    order.push(r);
  }
  return { sequence, totalSeek, order };
}
