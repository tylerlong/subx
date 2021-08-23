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
