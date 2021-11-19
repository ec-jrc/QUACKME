export type compraingOperation = (arg1: number | string, arg2: number | string) => boolean;

let isBigger: compraingOperation;
isBigger = (arg1: number, arg2: number): boolean => {
  return arg1 > arg2;
};

let isEqual: compraingOperation;
isEqual = (arg1: string, arg2: string): boolean => {
  return arg1 === arg2;
};

let isSmaller: compraingOperation;
isSmaller = (arg1: number, arg2: number): boolean => {
  return arg1 < arg2;
};

let isSmallerOrEqual: compraingOperation;
isSmallerOrEqual = (arg1: number, arg2: number): boolean => {
  return arg1 <= arg2;
};

let isBiggerOrEqual: compraingOperation;
isBiggerOrEqual = (arg1: number, arg2: number): boolean => {
  return arg1 >= arg2;
};

const opertaionObj = {
  isBigger: {
    label: '>',
    func: isBigger,
    excluted: '>='
  },
  isBiggerOrEqual: {
    label: '>=',
    func: isBiggerOrEqual,
    excluted: '<='
  },
  isEqual: {
    label: '=',
    func: isEqual
  },
  isSmaller: {
    label: '<',
    func: isSmaller,
    excluted: '<='
  },
  isSmallerOrEqual: {
    label: '<=',
    func: isSmallerOrEqual,
    excluted: '>='
  },
};

export { isBigger, isBiggerOrEqual, isEqual, isSmaller, isSmallerOrEqual, opertaionObj };
