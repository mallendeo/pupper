/**
 * pinName: {
 *  num: [{number} Physical pin number],
 *  bcnum: [{number} Broadcom numbering],
 *  dir: [{string} in, out (INPUT, OUTPUT)],
 *  invert: [{boolean} Invert the logic (Relay)]
 * }
 */

module.exports = {
  doorRelay: { num: 40, bcnum: 21, dir: 'out', invert: true },
  gateRelay: { num: 38, bcnum: 20, dir: 'out', invert: true },
  intercomBtn: { num: 11, bcnum: 17, dir: 'in' },
  proximitySensor: { num: 15, bcnum: 22, dir: 'in' },
  magneticSensor: { num: 13, bcnum: 27, dir: 'in', invert: true }
}
