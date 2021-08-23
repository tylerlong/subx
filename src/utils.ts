import _ from 'lodash';

export const startsWith = (
  small: string[] | undefined[],
  big: string[] | undefined[]
) => {
  for (let i = 0; i < small.length; i++) {
    if (big[i] !== small[i]) {
      return false;
    }
  }
  return true;
};

export const path = (paths: string[], obj: {}) => {
  if (paths.length === 0) {
    return obj;
  }
  return _.get(obj, paths);
};
