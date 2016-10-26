export const checkTimeDiff = (date, timeout = 1000) => {
  const dateDiff = Date.now() - parseInt(date)
  return !(dateDiff > timeout)
}
