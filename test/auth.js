import test from 'ava'
import server from './helpers/server'
import { post, get } from './helpers/fetch'

test.before(async () => await server)

const getValidToken = async () => {
  const res = await post('/token/renew', { password: 'admin' })
  const data = await res.json()
  return data.token
}

test('Attempt auth with incorrect password (error)', async t => {
  const res = await post('/token/renew', { password: '🎺🎺💀' })
  t.is(res.status, 401)
})

test('Attempt auth with correct password', async t => {
  const token = await getValidToken()
  if (token) return t.pass()
  t.fail()
})

test('Get and verify JWT', async t => {
  const token = await getValidToken()
  const data = await (await post('/token/verify', {}, token)).json()
  t.is(data.valid, true)
  t.is(data.token.type, 'admin')
})

test('Create API key', async t => {
  const token = await getValidToken()
  const res = await post('/apiKey', { name: 'Android App' }, token)
  t.is(res.status, 200)
})

test('Creating a duplicated API key (name)', async t => {
  const token = await getValidToken()
  const res = await post('/apiKey', { name: 'Android App' }, token)
  t.is(res.status, 501)
  t.is(!!(await res.json()).error, true)
})

test(`Normal tokens shouldn't be allowed to create keys`, async t => {
  const adminToken = await getValidToken()
  const { data } = await (await get('/apiKey', adminToken)).json()
  const { key, secret } = data[0]
  const { token } = await (await post('/token/renew', { key, secret })).json()
  const res = await post('/apiKey', { name: 'iOS App' }, token)
  t.is(res.status, 401)
})

