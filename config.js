module.exports = {
  port: 8080,
  authKey: '$ecr3t_key_123',
  gpio: {
    in: {
      ringBtn: 17,
      proximity: 27,
      magnetic: 22
    },
    out: {
      door: 20,
      gate: 21
    }
  }
}
