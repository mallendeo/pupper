import low from 'lowdb'
import fileAsync from 'lowdb/lib/file-async'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { camelCase } from 'lodash'

const randomString = (size = 16) =>
  crypto.randomBytes(size).toString('hex')

const hash = password => bcrypt.hashSync(password, 8)

export default (dbFile = 'db.json') => {
  const db = low(dbFile, { storage: fileAsync })

  db.defaults({
    pins: [],
    settings: {
      password: hash('admin'),
      apiKeys: []
    }
  }).value()

  const apiKeysData = db.get('settings.apiKeys')
  const passwordData = db.get('settings.password')
  const settingsData = db.get('settings')
  const pinsData = db.get('pins')

  const apiKeys = {
    create: name =>
      apiKeysData
        .push({
          name,
          key: randomString(),
          secret: randomString(32)
        })
        .last()
        .value(),
    remove: key =>
      apiKeysData
        .remove({ key })
        .value(),
    verify: (key, secret) =>
      apiKeysData
        .cloneDeep()
        .find({ key })
        .value(),
    all: () =>
      apiKeysData
        .cloneDeep()
        .value()
  }

  const settings = {
    updatePassword: (oldPassword, newPassword) => {
      if (bcrypt.compareSync(oldPassword, passwordData.value())) {
        return settingsData.assign({ password: hash(newPassword) })
      }

      return false
    },
    checkPassword: password =>
      bcrypt.compareSync(password, passwordData.value())
  }

  const pins = {
    add: ({ name, slug, num, dir, invert }) => {
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

      if (!removed.num) {
        throw Error('Pin not found')
      }

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
    settings,
    apiKeys
  }
}
