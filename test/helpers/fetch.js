import fetch from 'node-fetch'

export const makeUrl = path => `http://localhost:3000/api${path}`

export const post = async (url, body = {}, token) =>
  fetch(makeUrl(url), {
    method: 'post',
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body)
  })

export const get = async (url, token) =>
  fetch(makeUrl(url), {
    headers: { authorization: `Bearer ${token}` }
  })

export const remove = async (url, token) =>
  fetch(makeUrl(url), {
    method: 'delete',
    headers: { authorization: `Bearer ${token}` }
  })
