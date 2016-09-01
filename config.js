module.exports = {
  port: 8080,
  authKey: '$ecr3t_key_123',
  gpio: {
    in: {
      ringBtn: 19,
      proximity: 3,
      magnetic: 5
    },
    out: {
      door: 20,
      gate: 21
    }
  }
}
