const debug = require('debug')('alarmpi:gpio')
const EventEmitter = require('events')

module.exports = (pins, rpio) => {
  const emitter = new EventEmitter()

  // Inital state
  // rpio uses the physical pin layout
  Object.keys(pins).forEach(key => {
    const pin = pins[key]

    debug(`Opening/Exporting pin "${key}"`, pin)

    if (pin.dir === 'in') {
      rpio.open(pin.num, rpio.INPUT, rpio.PULL_UP)

      // Listen for input changes
      rpio.poll(pin.num, num => {
        const data = { name: key, num, value: rpio.read(num) }
        debug('Change event', data)
        emitter.emit('change', data)
      })

      return
    }

    rpio.open(pin.num, rpio.OUTPUT, pin.invert ? rpio.HIGH : rpio.LOW)
  })

  const on = pin => rpio.write(pin.num, pin.invert ? rpio.LOW : rpio.HIGH)
  const off = pin => rpio.write(pin.num, pin.invert ? rpio.HIGH : rpio.LOW)
  const read = pin => {
    const val = rpio.read(pin.num)
    return pin.invert ? !val : !!val
  }

  /**
   * Toggle an output pin for a period of time.
   * @param {object} pin
   * @param {number} timeout
   */
  const toggle = (pin, timeout = 200) => {
    on(pin)
    setTimeout(() => off(pin), timeout)
    return { pin, timeout }
  }

  process.on('exit', () => {
    debug('Restoring default pin values')
    Object.keys(pins).forEach(key => rpio.close(pins[key].num))
  })

  return {
    toggle,
    pins,
    emitter,
    read,
    on,
    off
  }
}
