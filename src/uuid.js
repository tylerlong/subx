// import hyperid from 'hyperid'

// const uuid = hyperid()

let id = new Date().valueOf()
const uuid = () => {
  return ++id
}

export default uuid
