import test from 'ava'
import server from './helpers/server'
import { post, get, remove } from './helpers/fetch'
import { getValidToken } from './helpers/token'

test.before(async () => await server)

const pins = [
  {
    name: 'Door Relay',
    slug: 'doorRelay',
    num: 40,
    dir: 'out',
    invert: true
  },
  {
    name: 'Gate Relay',
    slug: 'gateRelay',
    num: 38,
    dir: 'out',
    invert: true
  },
  {
    name: 'Intercom Button',
    slug: 'intercomButton',
    num: 11,
    dir: 'in'
  },
  {
    name: 'Proximity Sensor',
    slug: 'proximitySensor',
    num: 15,
    dir: 'in',
    invert: true
  },
  {
    name: 'Magnetic Sensor',
    slug: 'magneticSensor',
    num: 13,
    dir: 'in',
    invert: true
  }
]

test('Create pin', async t => {
  const token = await getValidToken()
  const { data } = await (await post('/pin', pins[0], token)).json()
  const checkPin = await (await get(`/pin/${data.slug}`, token)).json()
  t.deepEqual(data, checkPin.data.pin)
})

test('Create pin (duplicated)', async t => {
  const token = await getValidToken()
  const { error } = await (await post('/pin', pins[0], token)).json()
  if (!error) t.fail()
})

