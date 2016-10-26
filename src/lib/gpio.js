import debug from 'debug'
import chalk from 'chalk'
import EventEmitter from 'events'

const log = debug('pupper:gpio')

// Must use CommonJS for conditional require
module.exports = (pins, rpio) => {
  const emitter = new EventEmitter()

  /**
   * Export a pin and set the default value
   * @param {object} pin
   */
  const open = pin => {
    log(`Opening/Exporting pin "${chalk.cyan(pin.slug)}" pin ${chalk.red(pin.num)}`)

    if (pin.dir === 'in') {
      // rpio uses the physical pin layout
      rpio.open(pin.num, rpio.INPUT, rpio.PULL_UP)

      // Listen for input changes
      rpio.poll(pin.num, num => {
        const data = { slug: pin.slug, num, value: rpio.read(num) }
        log('change', data)
        emitter.emit('change', data)
      })

      return
    }

    rpio.open(pin.num, rpio.OUTPUT, pin.invert ? rpio.HIGH : rpio.LOW)
  }

  const read = pin => {
    log('read', pin)
    return rpio.read(pin.num)
  }

  const on = pin => {
    log('on', pin)
    rpio.write(pin.num, pin.invert ? rpio.LOW : rpio.HIGH)
    return read(pin)
  }

  const off = pin => {
    log('off', pin)
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

  const close = pin => rpio.close(pin.num)

  // Inital state
  pins.forEach(open)

  process.on('exit', () => {
    log('Restoring default pin values')
    pins.forEach(close)
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
