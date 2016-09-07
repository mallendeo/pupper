const debug = require('debug')('alarmpi:socket.io')

module.exports = (io, gpio) => {
  io.on('connection', socket => {
    debug('ws: client connected!')

    socket.on('disconnect', () => {
      debug('ws: client disconnected')
    })
  })

  gpio.emitter.on('change', data => {
    debug('emit', data)
    io.emit('GPIOChange', data, { for: 'everyone' })
  })
}
