module.exports = () => {
  const random = () => Promise.resolve(Number(Math.random() > 0.5))
  const timeout = (t = 100) =>
    new Promise(resolve => setTimeout(resolve, t))

  return {
    init: () => Promise.resolve(),
    openDoor: timeout,
    openGate: timeout,
    getBtn: v => v ? Promise.resolve(v) : random(),
    getProx: v => v ? Promise.resolve(v) : random(),
    getMag: v => v ? Promise.resolve(v) : random()
  }
}
