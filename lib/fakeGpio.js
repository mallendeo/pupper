const chalk = require('chalk')
const debug = require('debug')('alarmpi:fakeGPIO')
const pinsConfig = require('./pins')
const EventEmitter = require('events')

module.exports = () => {
  debug(chalk.magenta('Using fake GPIO'))

  const emitter = new EventEmitter()
  const toggle = (pin, timeout = 200) => {
    setTimeout(() => {}, timeout)
    return { pin, timeout }
  }

  const writeSync = () => 0
  const readSync = () => 0
  const watch = cb => setInterval(() => {
    if (Math.random() < 0.1) {
      const value = Math.random() < 0.5 ? 0 : 1
      cb(null, value)
    }
  }, 500)

  const pins = pinsConfig.reduce((prev, curr) => {
    prev[curr.name] = { writeSync, readSync, watch }
    return prev
  }, {})

  pinsConfig
    .filter(pin => pin.dir === 'in')
    .forEach(pin => {
      pins[pin.name].watch((err, value) => {
        if (err) return debug(`error: ${err}`)
        const data = Object.assign({}, pin, { value })
        debug(chalk.magenta('change'), data)
        emitter.emit('change', data)
      })
    })

  return {
    pins,
    openDoor: () => toggle(20, 100),
    openGate: () => toggle(21, 200),
    emitter
  }
}
