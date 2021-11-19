import { determinateStep } from './stepsConaitener';

describe('stepsConaitener', () => {

  it('should run determinateStep, RUN_WEAK_CHECKS_FOR_CURRENT_DATE', () => {
    const resultRerun = determinateStep('WeakChecks', 'rerun');
    const resultNext = determinateStep('WeakChecks', 'next');
    expect(resultRerun).toBe('RUN_WEAK_CHECKS_FOR_CURRENT_DATE');
    expect(resultNext).toBe('RUN_AGGREGATION');
  });

  it('should run determinateStep, RUN_WEAK_CHECKS_FOR_CURRENT_DATE', () => {
    const resultRerun = determinateStep('HeavyChecks', 'rerun');
    const resultNext = determinateStep('HeavyChecks', 'next');
    expect(resultRerun).toBe('RUN_HEAVY_CHECKS');
    expect(resultNext).toBe('RUN_THRESHOLD_CHECKS');
  });

  it('should run determinateStep, RUN_WEAK_CHECKS_FOR_CURRENT_DATE', () => {
    const resultRerun = determinateStep('ThresholdChecks', 'rerun');
    const resultNext = determinateStep('ThresholdChecks', 'next');
    expect(resultRerun).toBe('RUN_THRESHOLD_CHECKS');
    expect(resultNext).toBe('GENERATE_SFILE');
  });

  it('should run determinateStep, RUN_WEAK_CHECKS_FOR_CURRENT_DATE', () => {
    const resultRerun = determinateStep('asdf', 'rerun');
    const resultNext = determinateStep('asdf', 'next');
    expect(resultRerun).not.toBe('RUN_THRESHOLD_CHECKS');
    expect(resultNext).not.toBe('GENERATE_SFILE');
  });

});
