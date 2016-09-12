const debug = require('debug')('pupper:gpio')
const chalk = require('chalk')
const EventEmitter = require('events')

module.exports = (pins, rpio) => {
  const emitter = new EventEmitter()

  /**
   * Export a pin and set the default value
   * @param {object} pin
   */
  const open = pin => {
    debug(`Opening/Exporting pin "${chalk.cyan(pin.slug)}" pin ${chalk.red(pin.num)}`)

    if (pin.dir === 'in') {
      // rpio uses the physical pin layout
      rpio.open(pin.num, rpio.INPUT, rpio.PULL_UP)

      // Listen for input changes
      rpio.poll(pin.num, num => {
        const data = { slug: pin.slug, num, value: rpio.read(num) }
        debug('Change event', data)
        emitter.emit('change', data)
      })

      return
    }

    rpio.open(pin.num, rpio.OUTPUT, pin.invert ? rpio.HIGH : rpio.LOW)
  }

  const read = pin => {
    debug('read', pin)
    const val = rpio.read(pin.num)
    return pin.invert ? !val : !!val
  }

  const on = pin => {
    debug('on', pin)
    rpio.write(pin.num, pin.invert ? rpio.LOW : rpio.HIGH)
    return read(pin)
  }

  const off = pin => {
    debug('off', pin)
    rpio.write(pin.num, pin.invert ? rpio.HIGH : rpio.LOW)
    return read(pin)
  }

  /**
   * Toggle an output pin for a period of time.
   * @param {object} pin
   * @param {number} duration in ms
   */
  const toggle = (pin, duration = 250) => {
    on(pin)
    setTimeout(() => off(pin), duration)
    return { pin, duration }
  }

  const close = num => rpio.close(num)

  // Inital state
  pins.forEach(open)

  process.on('exit', () => {
    debug('Restoring default pin values')
    pins.forEach(pin => close(pin.num))
  })

  return {
    toggle,
    pins,
    emitter,
    open,
    close,
    read,
    on,
    off
  }
}
