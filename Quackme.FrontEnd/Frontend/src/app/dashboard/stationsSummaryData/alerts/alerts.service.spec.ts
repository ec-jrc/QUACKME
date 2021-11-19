import { checkCorectenessOfString, setObervationStatus } from './alerts.service';

describe('alerts.service', () => {
  describe('checkCorectenessOfString ', () => {
    const elementObj = {
      test: {
        value: 1,
        status: 'W'
      },
    };
    const regexp = /\b(?:NA|na|Na|nA)$/;
    const propertyName = 'test';

    it('empty value', () => {
      const value = '';
      const result = checkCorectenessOfString(value, regexp, null, null);
      expect(result).toBe('');
    });

    it('empty value', () => {
      const value = ' ';
      const result = checkCorectenessOfString(value, regexp, null, null);
      expect(result).toBe(' ');
    });

    it('random value', () => {
      const value = 'asdf';
      const result = checkCorectenessOfString(value, regexp, elementObj, propertyName);
      expect(result).toBe(1);
    });

    it('random value: found NA', () => {
      const value = 'NA';
      const result = checkCorectenessOfString(value, regexp, elementObj, propertyName);
      expect(result).toEqual(value);
    });

    it('random value: found na', () => {
      const value = 'na';
      const result = checkCorectenessOfString(value, regexp, elementObj, propertyName);
      expect(result).toEqual(value);
    });

    it('random value: found nA', () => {
      const value = 'nA';
      const result = checkCorectenessOfString(value, regexp, elementObj, propertyName);
      expect(result).toEqual(value);
    });

    it('random value: found Na', () => {
      const value = 'Na';
      const result = checkCorectenessOfString(value, regexp, elementObj, propertyName);
      expect(result).toEqual(value);
    });

    it('random value: found nanana', () => {
      const value = 'nanana';
      const result = checkCorectenessOfString(value, regexp, elementObj, propertyName);
      expect(result).toEqual(1);
    });

    it('random value: found 1NA', () => {
      const value = '1NA';
      const result = checkCorectenessOfString(value, regexp, elementObj, propertyName);
      expect(result).toEqual(1);
    });

    it('random value: found 1NA', () => {
      const value = 'NA1';
      const result = checkCorectenessOfString(value, regexp, elementObj, propertyName);
      expect(result).toEqual(1);
    });
  });

  describe('checkCorectenessOfString ', () => {
    it('random value: found 1NA', () => {
      const element = {
        status: 'M'
      };
      const paramenter = true;
      const result = setObervationStatus(element, paramenter);
      expect(result.status).toEqual('F');
    });
    it('random value: found 1NA', () => {
      const element = {
        status: 'F'
      };
      const paramenter = false;
      const result = setObervationStatus(element, paramenter);
      expect(result.status).toEqual('M');
    });
  });

});
