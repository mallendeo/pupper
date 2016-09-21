import debug from 'debug'
import socketioJwt from 'socketio-jwt'
import { checkTimeDiff } from './helpers'

const log = debug('pupper:socket.io')

export default (io, gpio, db) => {
  const getPin = slug => gpio.pins.find(pin => pin.slug === slug)

  io.sockets
    .on('connection', socketioJwt.authorize({
      secret: process.env.JWT_SECRET,
      timeout: 15000
    }))
    .on('authenticated', socket => {
      log(`Client connected: ${socket.decoded_token.name}`)

      socket.on('disconnect', () => {
        log(`Client disconnected: ${socket.decoded_token.name}`)
      })

      socket.on('datePing', ({ now }) => {
        socket.volatile.emit('datePong', { now, received: Date.now() })
      })

      socket.on('pinRead', ({ slug }) => {
        log(`pinRead: ${slug}, by: ${socket.decoded_token.name}`)
        const pin = getPin(slug)
        socket.emit('pinData', { pin, value: gpio.read(pin) })
      })

      socket.on('pinWrite', ({ slug, value, date }) => {
        log(`pinWrite: ${slug}, by: ${socket.decoded_token.name}`)
        if (!checkTimeDiff(date)) {
          return socket.emit('dateDiffError')
        }
        const pin = getPin(slug)
        socket.emit('pinData', {
          pin,
          value: value === 0 ? gpio.off(pin) : gpio.on(pin)
        })
      })

      socket.on('pinToggle', ({ slug, duration, date }) => {
        log(`pinToggle: ${slug}, by: ${socket.decoded_token.name}`)
        if (!checkTimeDiff(date)) {
          return socket.emit('dateDiffError')
        }
        const pin = getPin(slug)
        socket.emit('pinToggle', gpio.toggle(pin, duration))
      })
    })

  gpio.emitter.on('change', data => {
    log('emit', data)
    io.emit('GPIOChange', data)
  })
}
