import debug from 'debug'
import socketioJwt from 'socketio-jwt'

const log = debug('pupper:socket.io')

export default (io, gpio, db) => {
  io.sockets
    .on('connection', socketioJwt.authorize({
      secret: process.env.JWT_SECRET,
      timeout: 15000
    }))
    .on('authenticated', socket => {
      log('Client connected!')

      socket.on('disconnect', () => {
        log('Client disconnected')
      })

      socket.on('datePing', ({ now }) => {
        socket.volatile.emit('datePong', { now, received: Date.now() })
      })
    })

  gpio.emitter.on('change', data => {
    log('emit', data)
    io.emit('GPIOChange', data)
  })
}
