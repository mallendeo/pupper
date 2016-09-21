export const checkTimeDiff = (date, timeout = 1000) => {
  const dateDiff = Date.now() - date
  return !(dateDiff > timeout)
}
