const { exec } = require('child_process')

module.exports = config => {
  const runCmd = (...cmd) => new Promise((resolve, reject) => {
    exec(cmd.join(' '), (err, stdout, stderr) => {
      if (err) return reject(err)
      return resolve(stdout)
    })
  })

  /**
   * Set mode on a pin.
   * e.g: setMode(20, 'out')
   *      setMode(21, 'in')
   * @returns {promise}
   */
  const setMode = (pin, mode = 'in') => runCmd('gpio', '-g', 'mode', pin, mode)
  const write = (pin, val) => runCmd('gpio', '-g', 'write', pin, val)
  const read = pin => runCmd('gpio', '-g', 'read', pin).then(Number)

  /**
   * Set default pins values and its modes.
   * @returns {promise}
   */
  const init = () =>
    Promise.all([
      write(config.gpio.out.door, 1),
      write(config.gpio.out.gate, 1)
    ]).then(() => Promise.all([
      setMode(config.gpio.out.door, 'out'),
      setMode(config.gpio.out.gate, 'out'),
      setMode(config.gpio.in.ringBtn, 'in'),
      setMode(config.gpio.in.proximity, 'in'),
      setMode(config.gpio.in.magnetic, 'in')
    ]))

  /**
   * Toggle an output pin for a period of time.
   * @param {number} pin
   * @param {number} timeout
   * @returns {promise}
   */
  const toggle = (pin, timeout = 200) => new Promise((resolve, reject) => {
    write(pin, 0).then(() => {
      setTimeout(() => write(pin, 1)
        .then(resolve)
        .catch(reject)
      , timeout)
    }).catch(reject)
  })

  /**
   * Restore gpio values on exit
   */
  process.on('exit', () => {
    write(config.gpio.out.door, 1)
    write(config.gpio.out.gate, 1)
  })

  return {
    init,
    openDoor: () => toggle(config.gpio.out.door, 500),
    openGate: () => toggle(config.gpio.out.gate),
    getBtn: () => read(config.gpio.in.ringBtn),
    getProx: () => read(config.gpio.in.proximity),
    getMag: () => read(config.gpio.in.magnetic)
  }
}

