// It's fake uuid, and it is sufficient for this project
// There is no need for real uuid because it is slow to generate

let id = new Date().valueOf();
const uuid = () => {
  return ++id;
};

export default uuid;
