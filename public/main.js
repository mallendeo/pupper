/* global io, localStorage, fetch */

;(() => {
  'use strict'

  const $ = sel => document.querySelector(sel)

  const setKeyBtn = $('.setKeyBtn')
  const setKeyInput = $('.setKeyInput')

  const magneticSensor = $('.magneticSensor')
  const proximitySensor = $('.proximitySensor')
  const intercomButton = $('.intercomButton')

  const datePing = $('.datePing')

  let timeDiff = 0

  const triggerGate = $('.triggerGate')
  const triggerDoor = $('.triggerDoor')

  const post = url => fetch(url, {
    method: 'post',
    headers: {
      authorization: localStorage.getItem('authKey'),
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ date: Date.now() + timeDiff })
  })

  triggerGate.addEventListener('click', () => post('/api/toggle/gateRelay'))
  triggerDoor.addEventListener('click', () => post('/api/toggle/doorRelay'))

  setKeyInput.value = localStorage.getItem('authKey') || ''
  setKeyBtn.addEventListener('click', () => {
    localStorage.setItem('authKey', setKeyInput.value)
  })

  const socket = io({
    query: `auth=${localStorage.getItem('authKey')}`
  })

  socket.on('GPIOChange', ({ name, value }) => {
    if (name === 'intercomBtn') intercomButton.textContent = value
    if (name === 'proximitySensor') proximitySensor.textContent = value
    if (name === 'magneticSensor') magneticSensor.textContent = value
  })

  socket.on('datePong', ({ now, received }) => {
    const ping = Date.now() - now
    const prevDiff = timeDiff
    timeDiff = received - now - ping

    datePing.innerHTML = (`received: ${received}\n` +
      `diff: ${timeDiff}\n` +
      `diff prev: ${timeDiff - prevDiff}\n` +
      `ping: ${ping}`).replace(/\n/g, '<br>')
  })

  const ping = () => socket.emit('datePing', { now: Date.now() })

  ping()
  setInterval(ping, 1000)
})()
