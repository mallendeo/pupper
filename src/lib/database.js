import low from 'lowdb'
import fileAsync from 'lowdb/lib/file-async'
import crypto from 'crypto'
import { camelCase } from 'lodash'

const randomString = (size = 32) =>
  crypto.randomBytes(size).toString('hex')

export default dbFile => {
  const db = dbFile ? low(dbFile, { storage: fileAsync }) : low()

  db.defaults({
    pins: [],
    apiKeys: []
  }).value()

  const apiKeysData = db.get('apiKeys')
  const pinsData = db.get('pins')

  const apiKeys = {
    create: name => {
      const checkName = apiKeysData
        .cloneDeep()
        .find({ name })
        .value()

      if (checkName) throw Error('Key name already exists')

      return apiKeysData
        .push({
          name,
          key: randomString(),
          code: randomString(3)
        })
        .last()
        .value()
    },
    claim: code => {
      if (!code) throw Error('Code required!')
      const key = apiKeysData.find({ code }).value()
      if (!key) throw Error('Key not found or already claimed.')
      delete key['code']
      return key
    },
    remove: key =>
      apiKeysData
        .remove({ key })
        .value(),
    get: key =>
      apiKeysData
        .cloneDeep()
        .find({ key })
        .value(),
    all: () =>
      apiKeysData
        .cloneDeep()
        .value()
  }

  const pins = {
    add: ({ name, slug, num, dir, invert }) => {
      if (!name || !slug || !num) throw Error('Missing parameters.')

      const newSlug = slug || camelCase(name)
      if (
        pinsData.find({ num }).value() ||
        pinsData.find({ slug: newSlug }).value()
      ) {
        throw Error('Pin already set')
      }

      return pinsData
        .push({ name, slug: newSlug, num, dir, invert })
        .last()
        .value()
    },
    remove: slug => {
      const removed = pinsData.remove({ slug }).value()
      if (!removed.num) throw Error('Pin not found')
      return removed
    },
    find: slug =>
      pinsData
        .cloneDeep()
        .find({ slug })
        .value(),
    all: () =>
      pinsData
        .cloneDeep()
        .value()
  }

  return {
    db,
    pins,
    apiKeys
  }
}
