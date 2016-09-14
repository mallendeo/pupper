import test from 'ava'
import { post, get } from './helpers'

test('Attempt auth with incorrect password (error)', async t => {
  const res = await post('/token/renew', { password: 'not_admin' })
  t.is(res.status, 401)
})

test('Attempt auth with correct password', async t => {
  const res = await post('/token/renew', { password: 'admin' })
  const { token } = await res.json()
  if (token) return t.pass()
  t.fail()
})
