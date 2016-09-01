const { exec } = require('child_process')
const { gpio } = require('../config')

const runCmd = (...cmd) => new Promise((resolve, reject) => {
  exec(cmd.join(' '), (err, stdout, stderr) => {
    if (err) return reject(err)
    return resolve(stdout)
  })
})

const setMode = (pin, mode = 'in') => runCmd('gpio', '-g', 'mode', pin, mode)
const write = (pin, val) => runCmd('gpio', '-g', 'write', pin, val)
const read = pin => runCmd('gpio', '-g', 'read', pin).then(Number)

const init = () =>
  Promise.all([
    write(gpio.out.door, 1),
    write(gpio.out.gate, 1)
  ]).then(() => Promise.all([
    setMode(gpio.out.door, 'out'),
    setMode(gpio.out.gate, 'out'),
    setMode(gpio.in.ringBtn, 'in'),
    setMode(gpio.in.proximity, 'in'),
    setMode(gpio.in.magnetic, 'in')
  ]))

const toggle = (pin, timeout = 200) => new Promise((resolve, reject) => {
  write(pin, 0).then(() => {
    setTimeout(() => write(pin, 1)
      .then(resolve)
      .catch(reject)
    , timeout)
  }).catch(reject)
})

process.on('exit', () => {
  write(gpio.out.door, 1)
  write(gpio.out.gate, 1)
})

module.exports = {
  init,
  openDoor: () => toggle(gpio.out.door, 500),
  openGate: () => toggle(gpio.out.gate),
  getBtn: () => read(gpio.in.ringBtn),
  getProx: () => read(gpio.in.proximity),
  getMag: () => read(gpio.in.magnetic)
}
