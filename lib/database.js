const low = require('lowdb')
const fileAsync = require('lowdb/lib/file-async')
const bcrypt = require('bcryptjs')
const uuid = require('node-uuid')
const { camelCase } = require('lodash')

const hash = password => bcrypt.hashSync(password, 8)

const db = low('db.json', { storage: fileAsync })

db.defaults({
  pins: [],
  settings: {
    password: hash('admin'),
    apiKeys: []
  }
}).value()

const apiKeysData = db.get('settings.apiKeys')
const password = db.get('settings.password').value()
const pinsData = db.get('pins')

const apiKeys = {
  create: description =>
    apiKeysData
      .push({ description, key: uuid() })
      .last()
      .value(),
  remove: key =>
    apiKeysData
      .remove({ key })
      .value(),
  verify: key => apiKeysData.cloneDeep().find({ key }).value(),
  all: () => apiKeysData.cloneDeep().value()
}

const settings = {
  updatePassword: (oldPassword, newPassword) => {
    if (hash(oldPassword) === password) {
      password.assign(hash(newPassword))
    }
  }
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
  find: slug => pinsData.cloneDeep().find({ slug }).value(),
  all: () => pinsData.cloneDeep().value()
}

module.exports = {
  db,
  pins,
  settings,
  apiKeys
}
