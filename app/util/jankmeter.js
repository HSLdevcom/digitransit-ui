let counter = 0;
let min;
let max;
let total;
let lastTime;
let rafID = null;

function measure() {
  if (rafID) {
    const newTime = performance.now();
    const duration = newTime - lastTime;
    total += duration;
    lastTime = newTime;

    counter += 1;
    if (duration < min) {
      min = duration;
    }
    if (duration > max) {
      max = duration;
    }
    rafID = requestAnimationFrame(measure);
  }
}

export function startMeasuring() {
  if (!performance.now) {
    return;
  }
  if (!rafID) {
    min = 10000000;
    max = 0;
    total = 0;
    counter = 0;
    lastTime = performance.now();
    rafID = requestAnimationFrame(measure);
  }
}

export function stopMeasuring() {
  if (rafID && counter !== 0) {
    cancelAnimationFrame(rafID);
    rafID = null;
    return { min, max, avg: total / counter };
  }
  return false;
}
