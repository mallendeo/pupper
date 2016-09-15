/* global io, localStorage, fetch */

;(() => {
  'use strict'

  const $ = sel => document.querySelector(sel)

  const setKeyBtn = $('.setKeyBtn')
  const setKeyInput = $('.setKeyInput')
  const setSecretBtn = $('.setSecretBtn')
  const setSecretInput = $('.setSecretInput')
  const magneticSensor = $('.magneticSensor')
  const proximitySensor = $('.proximitySensor')
  const intercomButton = $('.intercomButton')
  const datePing = $('.datePing')
  const triggerGate = $('.triggerGate')
  const triggerDoor = $('.triggerDoor')

  let timeDiff = 0

  const getToken = () => localStorage.getItem('authToken')
  const setToken = token => localStorage.setItem('authToken', token)
  const getKey = () => localStorage.getItem('authKey')
  const setKey = key => localStorage.setItem('authKey', key)
  const getSecret = () => localStorage.getItem('authSecret')
  const setSecret = secret => localStorage.setItem('authSecret', secret)

  const post = (url, data = {}) => fetch(url, {
    method: 'post',
    headers: {
      authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(data)
  }).then(res => res.json())

  const renewToken = (key, secret) => post('/api/token/renew', { key, secret })

  setSecretInput.value = getSecret()
  setKeyInput.value = getKey()
  setSecretBtn.addEventListener('click', () => setSecret(setSecretInput.value))
  setKeyBtn.addEventListener('click', () => setKey(setKeyInput.value))

  post('/api/token/verify')
    .then(({ valid }) => {
      console.log('valid', valid)
      if (!valid) {
        const newToken = renewToken(getKey(), getSecret())
        newToken.then(console.log)
        return newToken
      }
      return { token: getToken() }
    })
    .then(({ token }) => setToken(token))
    .then(() => {
      triggerGate.addEventListener('click', () =>
        post('/api/toggle/gateRelay', { date: Date.now() + timeDiff }))
      triggerDoor.addEventListener('click', () =>
        post('/api/toggle/doorRelay', { date: Date.now() + timeDiff }))

      // const socket = io({ query: `token=${getKey()}` })
      const socket = io()

      socket.on('connect', () => {
        socket
          .emit('authenticate', { token: getToken() })
          .on('authenticated', () => {
            console.log('socketio authenticated!')
          })
          .on('unauthorized', msg => {
            console.log('unauthorized: ', JSON.stringify(msg.data))
            throw Error(msg.data.type)
          })
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
    })
})()
