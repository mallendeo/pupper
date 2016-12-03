import debug from 'debug'
import { checkTimeDiff } from './helpers'

const log = debug('pupper:socket.io')

export default (io, gpio, db) => {
  const getPin = slug => gpio.pins.find(pin => pin.slug === slug)

  io.use((socket, next) => {
    const { key } = socket.handshake.query
    if (!key) return next(Error('Key required'))
    if (db.apiKeys.get(key)) return next()
    next(new Error('Authentication error'))
  })

  io.on('connection', socket => {
    log(`Client connected`)

    socket.on('disconnect', () => {
      log(`Client disconnected`)
    })

    socket.on('datePing', ({ now }) => {
      socket.volatile.emit('datePong', { now, received: Date.now() })
    })

    socket.on('pin:read', ({ slug }) => {
      log(`pinRead: ${slug}`)
      const pin = getPin(slug)
      socket.emit('pinData', { pin, value: gpio.read(pin) })
    })

    socket.on('pin:write', ({ slug, value, date }) => {
      log(`pinWrite: ${slug}`)
      if (!checkTimeDiff(date)) {
        return socket.emit('dateDiffError')
      }
      const pin = getPin(slug)
      socket.emit('pinData', {
        pin,
        value: value === 0 ? gpio.off(pin) : gpio.on(pin)
      })
    })

    socket.on('pin:toggle', ({ slug, duration, date }) => {
      log(`pinToggle: ${slug}`)
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
