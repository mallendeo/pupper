const debug = require('debug')('pupper:socket.io')

module.exports = (io, gpio) => {
  io.on('connection', socket => {
    debug('Client connected!')

    socket.on('disconnect', () => {
      debug('Client disconnected')
    })

    socket.on('datePing', ({ now }) => {
      socket.volatile.emit('datePong', { now, received: Date.now() })
    })
  })

  gpio.emitter.on('change', data => {
    debug('emit', data)
    io.emit('GPIOChange', data)
  })
}
