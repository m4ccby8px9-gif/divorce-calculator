export function calculateTemporarySpousalSupport({
    highEarnerNet,
    lowEarnerNet,
    childSupport = 0,
  }) {
    const payorNet = highEarnerNet - childSupport;
    const payeeNet = lowEarnerNet + childSupport;
    const raw = 0.40 * payorNet - 0.50 * payeeNet;
    return Math.round(Math.max(0, raw));
  }