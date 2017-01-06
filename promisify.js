export default function promisify (val, rejectIfFalsy) {
  if (val && val.then && typeof val.then === 'function') {
    return val
  }
  return rejectIfFalsy ? val ? Promise.resolve(val) : Promise.reject(val) : Promise.resolve(val)
}
