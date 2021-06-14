const stateObj = {
  WeakChecks: {
    rerun: 'RUN_WEAK_CHECKS_FOR_CURRENT_DATE',
    next: 'RUN_AGGREGATION'
  },
  HeavyChecks: {
    rerun: 'RUN_HEAVY_CHECKS',
    next: 'RUN_THRESHOLD_CHECKS'
  },
  ThresholdChecks: {
    rerun: 'RUN_THRESHOLD_CHECKS',
    next: 'GENERATE_SFILE'
  }
};

export function determinateStep(checkLevel, action) {
  if (stateObj[checkLevel] !== undefined) {
    return stateObj[checkLevel][action];
  }
  return false;
}

export enum basedValues {
  'Modified' = 'M',
  'Forced' = 'F',
  'Suspicious' = 'S',
  'Warning' = 'W',
  'Clear' = 'C'
}
