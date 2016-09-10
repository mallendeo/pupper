const chalk = require('chalk')
const debug = require('debug')('alarmpi:fakeGPIO')
const gpio = require('./gpio')
const stdin = process.openStdin()

let state = {}

const rpio = {
  open (num, mode, val) {
    if (mode === 0) state[num] = val
  },
  close () {},
  poll (pin, cb) {
    debug(chalk.magenta(`Listening for keypress for pin ${pin}`))

    // Usage: {pinNumber} {state}
    // e.g 11 0 or 11 1
    // Will toggle if state is omitted
    stdin.on('data', data => {
      const kv = String(data).replace(/\n/, '').split(' ')
      if (pin === parseInt(kv[0])) {
        if (kv.length > 1) {
          state[pin] = parseInt(kv[1]) ? 1 : 0
          cb(pin)
          return
        }
        state[pin] = state[pin] ? 0 : 1
        cb(pin)
      }
    })
  },
  read: pin => state[pin],
  write (pin, val) { state[pin] = val },
  OUTPUT: 1,
  INPUT: 0,
  PULL_UP: 1,
  PULL_DOWN: 1,
  LOW: 0,
  HIGH: 1
}

debug(chalk.magenta('Using fake GPIO'))
module.exports = pins => gpio(pins, rpio)
