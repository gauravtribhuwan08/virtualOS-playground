// src/utils/memoryAlgorithms.js

/**
 * Page-replacement algorithms.
 * Each returns { frames, faults, hits, faultHistory }.
 *
 * `frames`       – 2D array [step][frameIndex] = page number (or null)
 * `faultHistory` – boolean array: true = page fault at that step
 *
 * Strategy: maintain a single live `current` frame array and
 * snapshot it after every reference. This avoids the propagation
 * bugs that arise from pre-allocating a 2-D matrix and trying to
 * copy rows after the fact.
 */

/* ─── FIFO ──────────────────────────────────────────────────
   Replace the page that has been in memory the longest.
   ─────────────────────────────────────────────────────────── */
export function fifo(refs, frameCount) {
  const current = Array(frameCount).fill(null); // live frame state
  const queue   = [];                            // insertion-order queue
  const frames  = [];
  const faultHistory = [];
  let faults = 0;

  for (const page of refs) {
    const hit = current.includes(page);

    if (!hit) {
      faults++;
      if (queue.length < frameCount) {
        // Frames not yet full – place in first empty slot
        const slot = current.indexOf(null);
        current[slot] = page;
        queue.push(page);
      } else {
        // Evict the oldest page (front of queue)
        const evict = queue.shift();
        const slot  = current.indexOf(evict);
        current[slot] = page;
        queue.push(page);
      }
    }
    // On a hit nothing changes in `current`

    frames.push([...current]);       // snapshot
    faultHistory.push(!hit);
  }

  return { frames, faults, hits: refs.length - faults, faultHistory };
}

/* ─── LRU ───────────────────────────────────────────────────
   Replace the page that was least recently used.
   ─────────────────────────────────────────────────────────── */
export function lru(refs, frameCount) {
  const current  = Array(frameCount).fill(null);
  const lastUsed = new Map(); // page → step index of last access
  const frames   = [];
  const faultHistory = [];
  let faults = 0;

  refs.forEach((page, step) => {
    const hit = current.includes(page);

    if (!hit) {
      faults++;
      const emptySlot = current.indexOf(null);
      if (emptySlot !== -1) {
        // Empty slot available
        current[emptySlot] = page;
      } else {
        // Evict the page with the smallest lastUsed timestamp
        let lruPage = null;
        let lruTime = Infinity;
        for (const p of current) {
          const t = lastUsed.has(p) ? lastUsed.get(p) : -1;
          if (t < lruTime) {
            lruTime = t;
            lruPage = p;
          }
        }
        const evictSlot = current.indexOf(lruPage);
        current[evictSlot] = page;
      }
    }
    // Update access time on both hit and miss
    lastUsed.set(page, step);

    frames.push([...current]);
    faultHistory.push(!hit);
  });

  return { frames, faults, hits: refs.length - faults, faultHistory };
}

/* ─── Optimal (OPT / Bélády's algorithm) ───────────────────
   Replace the page that will not be used for the longest time
   in the future.
   ─────────────────────────────────────────────────────────── */
export function optimal(refs, frameCount) {
  const current = Array(frameCount).fill(null);
  const frames  = [];
  const faultHistory = [];
  let faults = 0;

  // Returns the next position (strictly after `from`) where `page`
  // will be referenced, or Infinity if never again.
  const nextUse = (page, from) => {
    const idx = refs.indexOf(page, from + 1);
    return idx === -1 ? Infinity : idx;
  };

  refs.forEach((page, step) => {
    const hit = current.includes(page);

    if (!hit) {
      faults++;
      const emptySlot = current.indexOf(null);
      if (emptySlot !== -1) {
        current[emptySlot] = page;
      } else {
        // Evict the page whose next use is furthest in the future
        let farthest  = -1;
        let evictSlot = 0;
        for (let f = 0; f < frameCount; f++) {
          const nu = nextUse(current[f], step);
          if (nu > farthest) {
            farthest  = nu;
            evictSlot = f;
          }
        }
        current[evictSlot] = page;
      }
    }
    // On a hit nothing changes in `current`

    frames.push([...current]);
    faultHistory.push(!hit);
  });

  return { frames, faults, hits: refs.length - faults, faultHistory };
}

/* ─── Allocation helpers (unchanged) ────────────────────── */
export function firstFit(requests, holeSizes) {
  const allocations = Array(requests.length).fill(null);
  const holes = holeSizes.map((size, idx) => ({ size, idx }));
  requests.forEach((req, i) => {
    const hole = holes.find(h => h.size >= req);
    if (hole) { allocations[i] = hole.idx; hole.size -= req; }
  });
  return allocations;
}

export function bestFit(requests, holeSizes) {
  const allocations = Array(requests.length).fill(null);
  const holes = holeSizes.map((size, idx) => ({ size, idx }));
  requests.forEach((req, i) => {
    const candidates = holes.filter(h => h.size >= req);
    if (candidates.length) {
      const best = candidates.reduce((a, b) => (a.size < b.size ? a : b));
      allocations[i] = best.idx; best.size -= req;
    }
  });
  return allocations;
}

export function worstFit(requests, holeSizes) {
  const allocations = Array(requests.length).fill(null);
  const holes = holeSizes.map((size, idx) => ({ size, idx }));
  requests.forEach((req, i) => {
    const candidates = holes.filter(h => h.size >= req);
    if (candidates.length) {
      const worst = candidates.reduce((a, b) => (a.size > b.size ? a : b));
      allocations[i] = worst.idx; worst.size -= req;
    }
  });
  return allocations;
}
