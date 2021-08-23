export const empty = (obj: object) => {
  if (Array.isArray(obj)) {
    return [];
  }
  return {};
};
