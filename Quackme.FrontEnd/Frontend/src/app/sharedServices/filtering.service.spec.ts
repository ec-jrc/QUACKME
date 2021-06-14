import { isBigger, isBiggerOrEqual, isEqual, isSmaller, isSmallerOrEqual } from './filtering.service';

describe('filtering.service', () => {

  it('should test isBigger : bollean', () => {
    const val1 = 1;
    const val2 = 2;
    expect(isBigger(val1, val2)).toBeFalsy();
    expect(isBigger(val1, val1)).toBeFalsy();
    expect(isBigger(val2, val1)).toBeTruthy();
    expect(isBigger(val2, val2)).toBeFalsy();
  });

  it('should test isBiggerOrEqual : bollean', () => {
    const val1 = 1;
    const val2 = 2;
    expect(isBiggerOrEqual(val1, val2)).toBeFalsy();
    expect(isBiggerOrEqual(val1, val1)).toBeTruthy();
    expect(isBiggerOrEqual(val2, val1)).toBeTruthy();
    expect(isBiggerOrEqual(val2, val2)).toBeTruthy();
  });

  it('should test isEqual : bollean', () => {
    const val1 = 1;
    const val2 = 2;
    expect(isEqual(val1, val2)).toBeFalsy();
    expect(isEqual(val1, val1)).toBeTruthy();
    expect(isEqual(val2, val1)).toBeFalsy();
    expect(isEqual(val2, val2)).toBeTruthy();
  });

  it('should test isSmaller : bollean', () => {
    const val1 = 1;
    const val2 = 2;
    expect(isSmaller(val1, val2)).toBeTruthy();
    expect(isSmaller(val1, val1)).toBeFalsy();
    expect(isSmaller(val2, val1)).toBeFalsy();
    expect(isSmaller(val2, val2)).toBeFalsy();
  });

  it('should test isSmallerOrEqual : bollean', () => {
    const val1 = 1;
    const val2 = 2;
    expect(isSmallerOrEqual(val1, val2)).toBeTruthy();
    expect(isSmallerOrEqual(val1, val1)).toBeTruthy();
    expect(isSmallerOrEqual(val2, val1)).toBeFalsy();
    expect(isSmallerOrEqual(val2, val2)).toBeTruthy();
  });

});

